import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
import os
import django
import sys
import re
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()
from backend.models import City, Attraction
from django.db import transaction

def dms_to_dd(dms_str):
    """
    Convert DMS string like '51°07′48″N' or '113°57′09″W' to decimal degrees float.
    """
    if not dms_str:
        return None

    # Pattern captures degrees, minutes, seconds, and direction
    pattern = r"(\d+)°(\d+)′(\d+)″?([NSEW])"
    match = re.match(pattern, dms_str.strip())
    if not match:
        return None

    degrees = int(match.group(1))
    minutes = int(match.group(2))
    seconds = int(match.group(3))
    direction = match.group(4)

    dd = degrees + minutes / 60 + seconds / 3600

    if direction in ['S', 'W']:
        dd = -dd

    return dd

def merge_images(map_url, img_url):
    try:
        img1 = Image.open(BytesIO(requests.get(map_url).content)).convert("RGB")
        img2 = Image.open(BytesIO(requests.get(img_url).content)).convert("RGB")

        target_width = min(img1.width, img2.width)
        img1 = img1.resize((target_width, int(img1.height * target_width / img1.width)))
        img2 = img2.resize((target_width, int(img2.height * target_width / img2.width)))

        total_height = img1.height + img2.height
        combined = Image.new("RGB", (target_width, total_height))

        combined.paste(img2, (0, 0))
        combined.paste(img1, (0, img2.height))

        return combined
    except Exception as e:
        print(f"Error merging images: {e}")
        return None

def getAttractionImages(sub_soup, infobox_src):
    img_urls = []
    infobox = sub_soup.find('table', class_='infobox')
    if infobox:
        image_tags = infobox.select(infobox_src)
        for img in image_tags:
            img_url = img.get('src')
            if img_url:
                if img_url.startswith('//'):
                    img_url = 'https:' + img_url
                img_urls.append(img_url)
    else:
        img_urls.append('N/A')
    return img_urls

def is_relevant(title):
    keywords = [
        'museum', 'park', 'gallery', 'monument', 'landmark',
        'zoo', 'tower', 'theatre', 'botanical', 'historic',
        'garden', 'palace', 'aquarium', 'castle', 'bridge',
        'funicular', 'street', 'building', 'club','chinatown',
        'city', 'centre', 'house', 'hotel', 'district', 'villa',
        'casino', 'place', 'art','field','downtown', 'stadium', 'mall', 'land', 'race']
    title_lower = title.lower()
    return any(keyword in title_lower for keyword in keywords)


def getCityCoordinates(city_name, sub_soup):
    lat = sub_soup.find('span', class_='latitude')
    lon = sub_soup.find('span', class_='longitude')

    return lat, lon

def get_attractions(city_name):
    # ✅ Step 1: Check if city is already cached in DB
    city = City.objects.filter(name__iexact=city_name).first()
    if city:
        print(f"✅ Using cached data for {city_name}")

        return [
            {
                "name": a.name,
                "url": a.url,
                "images": a.image_urls,
                'lat': a.lat,
                'lon': a.lon
            } for a in city.attractions.all()
        ]
    else:

        # ✅ Step 2: Scrape data from Wikipedia
        print(f"🌐 Scraping Wikipedia for {city_name}")
        base_url = "https://en.wikipedia.org/wiki/"
        city_formatted = city_name.replace(" ", "_")
        url_candidates = [
            f"{base_url}List_of_tourist_attractions_in_{city_formatted}",
            f"{base_url}Tourism_in_{city_formatted}",
            f"{base_url}{city_formatted}"
        ]

        soup = None
        for url in url_candidates:
            print(f"🔍 Trying: {url}")
            try:
                response = requests.get(url)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    break
            except:
                continue

        if soup is None:
            print(f"❌ Could not fetch a valid page for {city_name}")
            return []

        attraction = {}
        rejected_list = []
        map_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Edmonton_agglomeration-blank.svg/250px-Edmonton_agglomeration-blank.svg.png"

        for a in soup.find_all('a', href=True, title=True):
            # if len(attraction) >= 10:
            #     break
            href = a['href']
            title = a['title']

            if not (href.startswith('/wiki/') and ':' not in href):
                continue

            full_url = "https://en.wikipedia.org" + href
            try:
                res = requests.get(full_url)
                sub_soup = BeautifulSoup(res.content, 'html.parser')
                
                if title == city_name:
                    city_lat, city_lon = getCityCoordinates(city_name, sub_soup)
                    lat_dd = dms_to_dd(str(city_lat.text))
                    lon_dd = dms_to_dd(str(city_lon.text))

                subheaders = sub_soup.select('.infobox-subheader')
                subheader_texts = [tag.text.strip().lower() for tag in subheaders]
                keywords = ['country', 'province', 'state', 'city', 'borough', 'county',
                            'municipality', 'settlement type', 'states', 'list', 'wikipedia', 'content']

                if any(kw in subheader_texts for kw in keywords):
                    print(f"❌ Rejected '{title}' — matched keyword in subheaders")
                    rejected_list.append(title)
                    continue

                # if not is_relevant(title):
                #     print(f"❌ Rejected '{title}' — not a relevant attraction")
                #     rejected_list.append(title)
                #     continue

                latOG = sub_soup.find('span', class_='latitude')
                lonOG = sub_soup.find('span', class_='longitude')

                lat = dms_to_dd(str(latOG.text))
                lon = dms_to_dd(str(lonOG.text))

                img_urls = getAttractionImages(sub_soup, '.infobox-image img')
                img_urls2 = getAttractionImages(sub_soup, '.mw-file-description img')
                combinedImgUrls = img_urls + img_urls2

                attraction[title] = {
                    'url': full_url,
                    'images': combinedImgUrls,
                    'lat': lat,
                    'lon': lon,
                    'city_lat': lat_dd,
                    'city_lon': lon_dd

                }
            except Exception as e:
                print(f"Error fetching page for {title}: {e}")

        # ✅ Step 3: Save to database
        with transaction.atomic():
            city = City.objects.create(
                name=city_name,
                citylat=lat_dd,
                citylon=lon_dd,
            )
            for name, info in attraction.items():
                Attraction.objects.create(
                    city=city,
                    name=name,
                    url=info['url'],
                    image_urls=info['images'],
                    lat=info['lat'],
                    lon=info['lon'],
                )

        print(f"✅ Saved {len(attraction)} attractions for {city_name}")
        return [
            {
                "name": name,
                "url": info["url"],
                "images": info["images"],
                'lat': lat,
                'lon': lon,
                'city_lat': lat_dd,
                'city_lon': lon_dd
            }
            for name, info in attraction.items()
        ]

#print(get_attractions("Calgary"))
