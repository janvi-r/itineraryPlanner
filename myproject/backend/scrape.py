from bs4 import BeautifulSoup
import os
import django
import sys
from sentence_transformers import SentenceTransformer, util
import re

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()
from backend.models import City, Attraction
from django.db import transaction

model = SentenceTransformer('all-MiniLM-L6-v2')


irrelevant_keywords = [
    'history of', 'politics', 'demographics', 'attack', 'massacre', 'timeline',
    'battle of', 'incident', 'murder', 'killing', 'protest', 'riot', 'shooting',
    'civil war', 'conflict', 'uprising', 'revolution', 'rebellion', 'genocide',
    'military', 'army', 'navy', 'air force', 'war', 'bombing', 'terrorist',

    'transport', 'economy', 'government', 'province', 'municipality',
    'district of', 'mayor', 'borough', 'city of', 'town of', 'census',
    'ward', 'council', 'assembly', 'political party',

    'list of', 'flag of', 'coat of arms', 'area code', 'postal code', 'zip code',
    'telephone code', 'statistics', 'subdivision', 'administrative',

    'university', 'college', 'school', 'academy', 'institute', 'campus',

    'sports in', 'media in',  'music of', 'art of',
    'cinema of', 'film in', 'radio in', 'television in',

    'airport', 'bus station', 'train station', 'subway station',
    'highway', 'bridge of', 'road to', 'junction',
    'intersection',
]


irrelevant_examples = [
    "Battle of XYZ",
    "XYZ massacre",
    "Shooting incident in DEF",
    "2021 political protest",
    "Riots in ABC",
    "Historic political conflict",
    "Election violence",
    "Attack on the palace",
    "Civil war",
    "Military coup",
    "Rebellion",
    "Revolt",
    "Genocide",
    "Insurrection",
    "Bombing",
    "Terrorist attack",

    # Generic institutions
    "University",
    "High School",
    "College",
    "Hospital",
    "Police Station",
    "Fire Department",
    "Courthouse",
    "Jail",
    "Prison",

    "Highway",
    "Intersection",
    "Roundabout",
    "Bus Station",
    "Train Station",
    "Subway Stop",
    "Airport",

    "Residential Area",
    "Industrial Zone",
    "Warehouse",
    "Factory",
    "Office Building",
    "Housing Complex",
    "Apartment Block",
    "Slum",
    "Barn",
    "Parking Lot",
    "Gas Station",
    "Service Station",
    "Cafe",
    "Grocery Store"
]


relevant_examples = [
    "Eiffel Tower", "Central Park", "The Louvre", "CN Tower", "Banff National Park",
    "Empire State Building", "Times Square", "Niagara Falls", "Summit", "Burj Khalifa",
    "Pyramids of Giza", "Christ the Redeemer", "Skyline", "Beach", "Disney World", "Disneyland",
    "Great Wall of China", "Taj Mahal", "Sydney Opera House", "Stonehenge", "Colosseum",
    "Big Ben", "Mount Everest", "Mount Fuji", "Santorini", "Machu Picchu", "Golden Gate Bridge",
    "Petra", "Acropolis of Athens", "Angkor Wat", "Grand Canyon", "Statue of Liberty",
    "Mount Kilimanjaro", "Sagrada Familia", "Versailles Palace", "Chichen Itza", "Table Mountain",
    "Hagia Sophia", "St. Basil's Cathedral", "Blue Mosque", "Uluru (Ayers Rock)",
    "Salar de Uyuni", "Yellowstone National Park", "Serengeti National Park", "Great Barrier Reef",
    "Alhambra", "Notre Dame Cathedral",

    "Neuschwanstein Castle", "Edinburgh Castle", "Tower Bridge", "Brandenburg Gate",
    "Prague Castle", "Rialto Bridge", "Trevi Fountain", "Mount Etna", "Plitvice Lakes National Park",
    "Matterhorn", "Mont Saint-Michel", "Dubrovnik Old Town", "Vatican City", "Pantheon Rome",

    "Forbidden City", "Mount Bromo", "Borobudur", "Marina Bay Sands", "Gardens by the Bay",
    "Shwedagon Pagoda", "Ha Long Bay", "Bana Hills", "Kiyomizu-dera", "Fushimi Inari Shrine",
    "Kinkaku-ji", "Bagan Temples", "Himeji Castle", "Mount Rinjani",

    "Yosemite National Park", "Bryce Canyon", "Zion National Park", "Rocky Mountain National Park",
    "Monument Valley", "Denali National Park", "Mount Rushmore", "Glacier National Park",
    "Key West", "Times Square", "Las Vegas Strip", "Walt Disney Concert Hall",

    "Iguazu Falls", "Salar de Atacama", "Torres del Paine", "Galapagos Islands",
    "Amazon Rainforest", "Huayna Picchu", "Sugarloaf Mountain", "Lençóis Maranhenses",
    "Lake Titicaca",

    "Victoria Falls", "Table Mountain", "Sossusvlei", "Fish River Canyon",
    "Okavango Delta", "Mount Sinai", "Ngorongoro Crater", "Sphinx of Giza",
    "Robben Island", "Blyde River Canyon",

    "Milford Sound", "Franz Josef Glacier", "Bondi Beach", "Whitehaven Beach",
    "Kings Canyon", "Great Ocean Road", "Blue Mountains", "Rotorua Geothermal Area",
    "Waiheke Island"

]



irrelevant_embeds = model.encode(irrelevant_examples, convert_to_tensor=True)
relevant_embeds = model.encode(relevant_examples, convert_to_tensor=True)


def get_images_duckduckgo(query, num_images=3):
    url = "https://duckduckgo.com/"
    params = {"q": query}
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        res = requests.get(url, params=params, headers=headers)
        res.raise_for_status()
        token = re.search(r'vqd=([\'"]?)([0-9-]+)\1', res.text).group(2)

        api_url = "https://duckduckgo.com/i.js"
        params = {"q": query, "vqd": token, "o": "json"}
        res = requests.get(api_url, params=params, headers=headers)
        res.raise_for_status()

        data = res.json()
        return [item["image"] for item in data.get("results", [])[:num_images]]

    except Exception as e:
        print(f"⚠️ DuckDuckGo failed for '{query}': {e}")
        return []


def dms_to_dd(dms_str):
    if not dms_str:
        return None
    pattern = r"(\d+)\u00b0(\d+)\u2032(\d+)\u2033?([NSEW])"
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

def get_city_lat_lon(city_formatted):
    url = f"https://en.wikipedia.org/wiki/{city_formatted}"
    try:
        res = requests.get(url)
        if res.status_code != 200:
            return None, None
        soup = BeautifulSoup(res.content, 'html.parser')
        lat_tag = soup.find('span', class_='latitude')
        lon_tag = soup.find('span', class_='longitude')
        if lat_tag and lon_tag:
            return dms_to_dd(lat_tag.text), dms_to_dd(lon_tag.text)
        else:
            return None, None
    except:
        return None, None


def getCityCoordinates(city_name, sub_soup):
    lat = sub_soup.find('span', class_='latitude')
    lon = sub_soup.find('span', class_='longitude')
    return lat, lon

def getAttractionImages(sub_soup, infobox_src, map_url, dot_url):
    img_urls = []
    infobox = sub_soup.find('table', class_='infobox')
    if infobox:
        image_tags = infobox.select(infobox_src)
        for img in image_tags:
            img_url = img.get('src')
            if img_url:
                # Convert to full-res
                if img_url.startswith('//'):
                    img_url = 'https:' + img_url
                if '/thumb/' in img_url:
                    # Remove /thumb/ and last /<size>-filename.jpg
                    img_url = re.sub(r'/thumb(/.+)/[^/]+$', r'\1', img_url)
                if img_url != map_url and img_url != dot_url and is_not_white_image(img_url):
                    img_urls.append(img_url)
    return img_urls

from PIL import Image
import requests
from io import BytesIO

def is_not_white_image(url, threshold=245):
    """
    Returns True if the image is not mostly white.
    threshold: max average RGB value to consider it non-white
    """
    try:
        response = requests.get(url, timeout=5)
        img = Image.open(BytesIO(response.content)).convert("RGB")
        # Average brightness
        avg_brightness = sum(img.resize((10,10)).getdata()[i][0] for i in range(100)) / 100
        if avg_brightness > threshold:
            return False
        return True
    except:
        return True
def is_relevant(title: str) -> bool:
    # Only filter obvious non-attraction pages
    bad_prefixes = [
        "Category:", "Template:", "Commons:",
        "Wikipedia:", "Help:", "Portal:"
    ]
    return not any(title.startswith(bad) for bad in bad_prefixes)


def is_content_relevant(soup):
    try:
        paragraph = soup.select_one('p')
        if not paragraph:
            return True
        text = paragraph.get_text(strip=True).lower()
        if any(kw in text for kw in ['election', 'politics', 'province', 'municipality']):
            return False
        return True
    except:
        return True



def get_links_from_category(city_formatted):
    url = f"https://en.wikipedia.org/wiki/Category:Tourist_attractions_in_{city_formatted}"
    try:
        res = requests.get(url)
        if res.status_code != 200:
            return []
        soup = BeautifulSoup(res.content, 'html.parser')
        links = []
        for a in soup.select('#mw-pages ul li a'):
            href = a.get('href', '')
            if href.startswith('/wiki/') and ':' not in href:
                links.append(("https://en.wikipedia.org" + href, a.get_text(strip=True)))
        return links
    except Exception as e:
        print(f"Error in get_links_from_category: {e}")
        return []

def get_links_from_list_page(city_formatted):
    url = f"https://en.wikipedia.org/wiki/List_of_tourist_attractions_in_{city_formatted}"
    try:
        res = requests.get(url)
        if res.status_code != 200:
            return []
        soup = BeautifulSoup(res.content, 'html.parser')
        links = []

        for ul in soup.find_all('ul'):
            for a in ul.find_all('a', href=True, title=True):
                title_lower = a['title'].lower()
                if (
                    a['href'].startswith('/wiki/') and ':' not in a['href']
                    and not any(k in title_lower for k in irrelevant_keywords)
                ):
                    links.append(("https://en.wikipedia.org" + a['href'], a['title']))

        for table in soup.find_all('table', class_=lambda x: x and ('wikitable' in x or 'sortable' in x)):
            for a in table.find_all('a', href=True, title=True):
                title_lower = a['title'].lower()
                if (
                    a['href'].startswith('/wiki/') and ':' not in a['href']
                    and not any(k in title_lower for k in irrelevant_keywords)
                ):
                    links.append(("https://en.wikipedia.org" + a['href'], a['title']))

        seen = set()
        unique_links = []
        for link in links:
            if link[0] not in seen:
                unique_links.append(link)
                seen.add(link[0])

        return unique_links
    except Exception as e:
        print(f"Error in get_links_from_list_page: {e}")
        return []


def filter_attractions(raw_links, city, model, min_results=10, top_n=20):
    query = f"{city} tourist attraction"
    query_embedding = model.encode(query, convert_to_tensor=True)

    scored = []
    for link in raw_links:
        score = util.cos_sim(query_embedding, model.encode(link, convert_to_tensor=True)).item()
        scored.append((link, score))

    scored.sort(key=lambda x: x[1], reverse=True)

    if len(scored) < min_results:
        return [link for link, _ in scored]

    return [link for link, _ in scored[:top_n]]


def get_links_from_city_page(city_formatted):
    url = f"https://en.wikipedia.org/wiki/{city_formatted}"
    try:
        res = requests.get(url)
        if res.status_code != 200:
            return []
        soup = BeautifulSoup(res.content, 'html.parser')
        links = []
        for header in soup.find_all(['h2', 'h3']):
            header_text = header.get_text(strip=True).lower()
            if any(k in header_text for k in ['attractions', 'landmarks', 'tourism', 'things to see']):
                ul = header.find_next_sibling('ul')
                while ul and ul.name == 'ul':
                    for a in ul.find_all('a', href=True, title=True):
                        title_lower = a['title'].lower()
                        if (
                            a['href'].startswith('/wiki/') and ':' not in a['href']
                            and not any(k in title_lower for k in irrelevant_keywords)
                        ):
                            links.append(("https://en.wikipedia.org" + a['href'], a['title']))
                    ul = ul.find_next_sibling()
        return links
    except:
        return []

def get_full_res_url(url):
    if '/thumb/' in url:
        parts = url.split('/thumb/')
        path = parts[1].rsplit('/', 1)[0]
        return parts[0] + '/' + path
    return url


def get_attractions(city_name, min_results=10, top_n=100):
    city = City.objects.filter(name__iexact=city_name).first()
    if city:
        print(f"✅ Using cached data for {city_name}")
        return [
            {"name": a.name, "url": a.url, "images": a.image_urls,
             "lat": a.lat, "lon": a.lon,
             "city_lat": city.citylat, "city_lon": city.citylon}
            for a in city.attractions.all()
        ]

    print(f"🌐 Scraping Wikipedia for {city_name}")
    city_formatted = city_name.replace(" ", "_")

    links = get_links_from_list_page(city_formatted)
    if not links:
        links = get_links_from_category(city_formatted)
    if not links:
        links = get_links_from_city_page(city_formatted)

    if not links:
        print("⚠️ No attractions found.")
        return []

    print(f"🔗 Found {len(links)} raw links before filtering.")

    query = f"{city_name} tourist attraction"
    query_embedding = model.encode(query, convert_to_tensor=True)

    scored = []
    for url, title in links:
        score = util.cos_sim(query_embedding, model.encode(title, convert_to_tensor=True)).item()
        scored.append(((url, title), score))

    scored.sort(key=lambda x: x[1], reverse=True)

    if len(scored) < min_results:
        filtered_links = [item[0] for item in scored]
    else:
        filtered_links = [item[0] for item in scored[:top_n]]

    print(f"✅ {len(filtered_links)} attractions after filtering.")

    attraction = {}
    lat_dd = lon_dd = None
    map_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Edmonton_agglomeration-blank.svg/250px-Edmonton_agglomeration-blank.svg.png"
    dot_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Red_pog.svg/20px-Red_pog.svg.png"

    for full_url, title in filtered_links:
        try:
            res = requests.get(full_url)
            sub_soup = BeautifulSoup(res.content, 'html.parser')

            city_lat, city_lon = getCityCoordinates(city_name, sub_soup)
            if city_lat and city_lon:
                lat_dd = dms_to_dd(city_lat.text)
                lon_dd = dms_to_dd(city_lon.text)

            latOG = sub_soup.find('span', class_='latitude')
            lonOG = sub_soup.find('span', class_='longitude')
            if not latOG or not lonOG:
                continue
            lat = dms_to_dd(latOG.text)
            lon = dms_to_dd(lonOG.text)

            img_urls = getAttractionImages(sub_soup, '.infobox-image img', map_url, dot_url)
            img_urls2 = getAttractionImages(sub_soup, 'a.mw-file-description img', map_url, dot_url)
            combinedImgUrls = list(set(img_urls + img_urls2))
            if not combinedImgUrls:
                continue

            attraction[title] = {
                'url': full_url,
                'images': combinedImgUrls,
                'lat': lat,
                'lon': lon,
                'city_lat': lat_dd,
                'city_lon': lon_dd
            }
        except Exception as e:
            print(f"💥 Error fetching {title}: {e}")

    with transaction.atomic():
        city = City.objects.create(name=city_name, citylat=lat_dd, citylon=lon_dd)
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
        {"name": name, "url": info["url"], "images": info["images"],
         'lat': info["lat"], 'lon': info["lon"],
         'city_lat': info["city_lat"], 'city_lon': info["city_lon"]}
        for name, info in attraction.items()
    ]
