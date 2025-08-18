from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
import os
import django
import sys
from sentence_transformers import SentenceTransformer, util
import torch
import requests
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
    # Historical / political topics
    'history of', 'politics', 'demographics', 'attack', 'massacre', 'timeline',
    'battle of', 'incident', 'murder', 'killing', 'protest', 'riot', 'shooting',
    'civil war', 'conflict', 'uprising', 'revolution', 'rebellion', 'genocide',
    'military', 'army', 'navy', 'air force', 'war', 'bombing', 'terrorist',

    # Government / administrative
    'transport', 'economy', 'government', 'province', 'municipality',
    'district of', 'mayor', 'borough', 'city of', 'town of', 'census',
    'ward', 'council', 'assembly', 'political party',

    # Non-tourist informational pages
    'list of', 'flag of', 'coat of arms', 'area code', 'postal code', 'zip code',
    'telephone code', 'statistics', 'subdivision', 'administrative',

    # Education / institutions
    'university', 'college', 'school', 'academy', 'institute', 'campus',

    # Sports / media / culture
    'sports in', 'media in',  'music of', 'art of',
    'cinema of', 'film in', 'radio in', 'television in',

    # Infrastructure / generic locations
    'airport', 'bus station', 'train station', 'subway station',
    'highway', 'bridge of', 'road to', 'junction',
    'intersection',
]


irrelevant_examples = [
    # Historical events / conflicts
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

    # Generic natural/geographical terms
    "Highway",
    "Intersection",
    "Roundabout",
    "Bus Station",
    "Train Station",
    "Subway Stop",
    "Airport",

    # Other non-specific / irrelevant terms
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
    # Existing
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

    # Additional - Europe
    "Neuschwanstein Castle", "Edinburgh Castle", "Tower Bridge", "Brandenburg Gate",
    "Prague Castle", "Rialto Bridge", "Trevi Fountain", "Mount Etna", "Plitvice Lakes National Park",
    "Matterhorn", "Mont Saint-Michel", "Dubrovnik Old Town", "Vatican City", "Pantheon Rome",

    # Additional - Asia
    "Forbidden City", "Mount Bromo", "Borobudur", "Marina Bay Sands", "Gardens by the Bay",
    "Shwedagon Pagoda", "Ha Long Bay", "Bana Hills", "Kiyomizu-dera", "Fushimi Inari Shrine",
    "Kinkaku-ji", "Bagan Temples", "Himeji Castle", "Mount Rinjani",

    # Additional - North America
    "Yosemite National Park", "Bryce Canyon", "Zion National Park", "Rocky Mountain National Park",
    "Monument Valley", "Denali National Park", "Mount Rushmore", "Glacier National Park",
    "Key West", "Times Square", "Las Vegas Strip", "Walt Disney Concert Hall",

    # Additional - South America
    "Iguazu Falls", "Salar de Atacama", "Torres del Paine", "Galapagos Islands",
    "Amazon Rainforest", "Huayna Picchu", "Sugarloaf Mountain", "Lençóis Maranhenses",
    "Lake Titicaca",

    # Additional - Africa
    "Victoria Falls", "Table Mountain", "Sossusvlei", "Fish River Canyon",
    "Okavango Delta", "Mount Sinai", "Ngorongoro Crater", "Sphinx of Giza",
    "Robben Island", "Blyde River Canyon",

    # Additional - Oceania
    "Milford Sound", "Franz Josef Glacier", "Bondi Beach", "Whitehaven Beach",
    "Kings Canyon", "Great Ocean Road", "Blue Mountains", "Rotorua Geothermal Area",
    "Waiheke Island"

]



irrelevant_embeds = model.encode(irrelevant_examples, convert_to_tensor=True)
relevant_embeds = model.encode(relevant_examples, convert_to_tensor=True)



# --- DuckDuckGo image search ---
def get_images_duckduckgo(query, num_images=3):
    url = "https://duckduckgo.com/"
    params = {"q": query}
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        # Step 1: Get token ("vqd")
        res = requests.get(url, params=params, headers=headers)
        res.raise_for_status()
        token = re.search(r'vqd=([\'"]?)([0-9-]+)\1', res.text).group(2)

        # Step 2: Get image search results
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
        return True  # If we fail to load, keep it just in case


#
# def is_relevant(title, semantic_threshold=0.05):
#     title_lower = title.lower()
#     if any(k in title_lower for k in irrelevant_keywords):
#         return False
#     title_embed = model.encode(title, convert_to_tensor=True)
#     max_irrel = util.cos_sim(title_embed, irrelevant_embeds).max().item()
#     max_relev = util.cos_sim(title_embed, relevant_embeds).max().item()
#     if (max_relev - max_irrel) > semantic_threshold:
#         return True
#     else:
#         print(f"🧠 Filtered semantically: {title} (relev={{max_relev:.2f}}, irrel={{max_irrel:.2f}})")
#         return False

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

        # Extract from all unordered lists
        for ul in soup.find_all('ul'):
            for a in ul.find_all('a', href=True, title=True):
                title_lower = a['title'].lower()
                if (
                    a['href'].startswith('/wiki/') and ':' not in a['href']
                    and not any(k in title_lower for k in irrelevant_keywords)
                ):
                    links.append(("https://en.wikipedia.org" + a['href'], a['title']))

        # Extract from tables with class wikitable or sortable
        for table in soup.find_all('table', class_=lambda x: x and ('wikitable' in x or 'sortable' in x)):
            for a in table.find_all('a', href=True, title=True):
                title_lower = a['title'].lower()
                if (
                    a['href'].startswith('/wiki/') and ':' not in a['href']
                    and not any(k in title_lower for k in irrelevant_keywords)
                ):
                    links.append(("https://en.wikipedia.org" + a['href'], a['title']))

        # Deduplicate links by URL
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


# Instead of dropping everything below a threshold
# keep at least the top N attractions
def filter_attractions(raw_links, city, model, min_results=10, top_n=20):
    # Embed city + 'tourist attraction' as query
    query = f"{city} tourist attraction"
    query_embedding = model.encode(query, convert_to_tensor=True)

    # Score all raw links
    scored = []
    for link in raw_links:
        score = util.cos_sim(query_embedding, model.encode(link, convert_to_tensor=True)).item()
        scored.append((link, score))

    # Sort by score
    scored.sort(key=lambda x: x[1], reverse=True)

    # If we have fewer than min_results after filtering, just return all
    if len(scored) < min_results:
        return [link for link, _ in scored]

    # Otherwise, return the top_n
    return [link for link, _ in scored[:top_n]]


def get_links_from_city_page(city_formatted):
    """Scrapes only attraction/tourism/landmark sections from a city page."""
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
        path = parts[1].rsplit('/', 1)[0]  # remove the last size part
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

    # Priority: list page → category page → city page
    links = get_links_from_list_page(city_formatted)
    if not links:
        links = get_links_from_category(city_formatted)
    if not links:
        links = get_links_from_city_page(city_formatted)

    if not links:
        print("⚠️ No attractions found.")
        return []

    print(f"🔗 Found {len(links)} raw links before filtering.")

    # ---- Improved Filtering ----
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

    # ---- Scrape details for each attraction ----
    attraction = {}
    lat_dd = lon_dd = None
    map_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Edmonton_agglomeration-blank.svg/250px-Edmonton_agglomeration-blank.svg.png"
    dot_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Red_pog.svg/20px-Red_pog.svg.png"

    for full_url, title in filtered_links:
        try:
            res = requests.get(full_url)
            sub_soup = BeautifulSoup(res.content, 'html.parser')

            # if title == city_name:
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

    # ---- Save to DB ----
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

# def get_attractions(city_name):
#     city = City.objects.filter(name__iexact=city_name).first()
#     if city:
#         print(f"✅ Using cached data for {city_name}")
#         return [
#             {"name": a.name, "url": a.url, "images": a.image_urls, 'lat': a.lat, 'lon': a.lon}
#             for a in city.attractions.all()
#         ]
#
#     print(f"🌐 Scraping Wikipedia for {city_name}")
#     city_formatted = city_name.replace(" ", "_")
#
#     # Try multiple methods in order of accuracy
#     links = get_links_from_category(city_formatted)
#     if not links:
#         links = get_links_from_list_page(city_formatted)
#     if not links:
#         links = get_links_from_city_page(city_formatted)
#
#     if not links:
#         print("⚠️ No attractions found.")
#         return []
#
#     print(f"🔗 Found {len(links)} raw links before filtering.")
#
#     seen_titles = set()
#     filtered_links = []
#     for url, title in links:
#         if title not in seen_titles and is_relevant(title):
#             seen_titles.add(title)
#             filtered_links.append((url, title))
#
#     print(f"✅ {len(filtered_links)} attractions after filtering.")
#
#     attraction = {}
#     lat_dd = lon_dd = None
#     map_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Edmonton_agglomeration-blank.svg/250px-Edmonton_agglomeration-blank.svg.png"
#     dot_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Red_pog.svg/20px-Red_pog.svg.png"
#
#     for full_url, title in filtered_links:
#         try:
#             res = requests.get(full_url)
#             sub_soup = BeautifulSoup(res.content, 'html.parser')
#
#             if title == city_name:
#                 city_lat, city_lon = getCityCoordinates(city_name, sub_soup)
#                 # city_lat, city_lon = get_city_lat_lon(city_formatted)
#
#                 if city_lat and city_lon:
#                     lat_dd = dms_to_dd(city_lat.text)
#                     lon_dd = dms_to_dd(city_lon.text)
#
#             latOG = sub_soup.find('span', class_='latitude')
#             lonOG = sub_soup.find('span', class_='longitude')
#             if not latOG or not lonOG:
#                 continue
#             lat = dms_to_dd(latOG.text)
#             lon = dms_to_dd(lonOG.text)
#
#             img_urls = getAttractionImages(sub_soup, '.infobox-image img', map_url, dot_url)
#             img_urls2 = getAttractionImages(sub_soup, 'a.mw-file-description img', map_url, dot_url)
#             combinedImgUrls = list(set(img_urls + img_urls2))
#             if not combinedImgUrls:
#                 continue
#
#             attraction[title] = {
#                 'url': full_url,
#                 'images': combinedImgUrls,
#                 'lat': lat,
#                 'lon': lon,
#                 'city_lat': lat_dd,
#                 'city_lon': lon_dd
#             }
#         except Exception as e:
#             print(f"💥 Error fetching {title}: {e}")
#
#     with transaction.atomic():
#         city = City.objects.create(name=city_name, citylat=lat_dd, citylon=lon_dd)
#         for name, info in attraction.items():
#             Attraction.objects.create(
#                 city=city,
#                 name=name,
#                 url=info['url'],
#                 image_urls=info['images'],
#                 lat=info['lat'],
#                 lon=info['lon'],
#             )
#
#     print(f"✅ Saved {len(attraction)} attractions for {city_name}")
#     return [
#         {"name": name, "url": info["url"], "images": info["images"],
#          'lat': info["lat"], 'lon': info["lon"], 'city_lat': info["city_lat"], 'city_lon': info["city_lon"]}
#         for name, info in attraction.items()
#     ]


# --------------
# # Currently works better however it returns a lot more information then needed. e.g brussle gives 500 things. we need to make that smaller
#
# import requests
# from bs4 import BeautifulSoup
# from PIL import Image
# from io import BytesIO
# import os
# import django
# import sys
# import re
#
# BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
# if BASE_DIR not in sys.path:
#     sys.path.insert(0, BASE_DIR)
#
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
# django.setup()
# from backend.models import City, Attraction
# from django.db import transaction
#
# def dms_to_dd(dms_str):
#     if not dms_str:
#         return None
#     pattern = r"(\d+)\u00b0(\d+)\u2032(\d+)\u2033?([NSEW])"
#     match = re.match(pattern, dms_str.strip())
#     if not match:
#         return None
#     degrees = int(match.group(1))
#     minutes = int(match.group(2))
#     seconds = int(match.group(3))
#     direction = match.group(4)
#     dd = degrees + minutes / 60 + seconds / 3600
#     if direction in ['S', 'W']:
#         dd = -dd
#     return dd
#
# def getCityCoordinates(city_name, sub_soup):
#     lat = sub_soup.find('span', class_='latitude')
#     lon = sub_soup.find('span', class_='longitude')
#     return lat, lon
#
# def getAttractionImages(sub_soup, infobox_src, map_url, dot_url):
#     img_urls = []
#     infobox = sub_soup.find('table', class_='infobox')
#     if infobox:
#         image_tags = infobox.select(infobox_src)
#         for img in image_tags:
#             img_url = img.get('src')
#             if img_url:
#                 if img_url.startswith('//'):
#                     img_url = 'https:' + img_url
#                 if img_url != map_url and img_url != dot_url:
#                     img_urls.append(img_url)
#     return img_urls
#
# def is_relevant(title):
#     title_lower = title.lower()
#     irrelevant_keywords = [
#         'history of', 'politics', 'demographics', 'attack', 'massacre', 'timeline',
#         'transport', 'economy', 'government', 'list of', 'province', 'municipality',
#         'district of', 'mayor', 'sports in', 'media in', 'culture of', 'flag of',
#         'coat of arms', 'area code', 'postal code', 'borough', 'city of', 'town of',
#         'history', 'timeline', 'events', 'incident'
#     ]
#     if any(k in title_lower for k in irrelevant_keywords):
#         return False
#     return True
#
# def is_content_relevant(soup):
#     try:
#         paragraph = soup.select_one('p')
#         if not paragraph:
#             return True  # allow if no lead paragraph
#         text = paragraph.get_text(strip=True).lower()
#         if any(kw in text for kw in ['election', 'politics', 'province', 'municipality']):
#             return False
#         return True
#     except:
#         return True
#
# def get_links_from_category(city_formatted):
#     url = f"https://en.wikipedia.org/wiki/Category:Tourist_attractions_in_{city_formatted}"
#     try:
#         res = requests.get(url)
#         if res.status_code != 200:
#             return []
#         soup = BeautifulSoup(res.content, 'html.parser')
#         return [
#             ("https://en.wikipedia.org" + a['href'], a.get_text(strip=True))
#             for a in soup.select('.mw-category a')
#             if a['href'].startswith('/wiki/') and ':' not in a['href']
#         ]
#     except:
#         return []
#
# def get_links_from_list_page(city_formatted):
#     url = f"https://en.wikipedia.org/wiki/List_of_tourist_attractions_in_{city_formatted}"
#     try:
#         res = requests.get(url)
#         if res.status_code != 200:
#             return []
#         soup = BeautifulSoup(res.content, 'html.parser')
#         links = []
#         for ul in soup.find_all('ul'):
#             for a in ul.find_all('a', href=True, title=True):
#                 if a['href'].startswith('/wiki/') and ':' not in a['href']:
#                     links.append(("https://en.wikipedia.org" + a['href'], a['title']))
#         return links
#     except:
#         return []
#
# def get_links_from_city_page(city_formatted):
#     url = f"https://en.wikipedia.org/wiki/{city_formatted}"
#     try:
#         res = requests.get(url)
#         if res.status_code != 200:
#             return []
#         soup = BeautifulSoup(res.content, 'html.parser')
#         links = []
#         for header in soup.find_all(['h2', 'h3']):
#             text = header.get_text(strip=True).lower()
#             if any(k in text for k in ['attractions', 'sights', 'landmarks', 'tourism']):
#                 ul = header.find_next_sibling('ul')
#                 while ul and ul.name == 'ul':
#                     for a in ul.find_all('a', href=True, title=True):
#                         if a['href'].startswith('/wiki/') and ':' not in a['href']:
#                             links.append(("https://en.wikipedia.org" + a['href'], a['title']))
#                     ul = ul.find_next_sibling()
#         return links
#     except:
#         return []
#
# def get_attractions(city_name):
#     city = City.objects.filter(name__iexact=city_name).first()
#     if city:
#         print(f"✅ Using cached data for {city_name}")
#         return [
#             {"name": a.name, "url": a.url, "images": a.image_urls, 'lat': a.lat, 'lon': a.lon}
#             for a in city.attractions.all()
#         ]
#
#     print(f"🌐 Scraping Wikipedia for {city_name}")
#     city_formatted = city_name.replace(" ", "_")
#     base_url = "https://en.wikipedia.org/wiki/"
#
#     links = get_links_from_category(city_formatted)
#     if not links:
#         links = get_links_from_list_page(city_formatted)
#     if not links:
#         links = get_links_from_city_page(city_formatted)
#     if not links:
#         url_candidates = [
#             f"{base_url}List_of_tourist_attractions_in_{city_formatted}",
#             f"{base_url}Tourism_in_{city_formatted}",
#             f"{base_url}{city_formatted}"
#         ]
#         soup = None
#         for url in url_candidates:
#             print(f"🔍 Trying: {url}")
#             try:
#                 response = requests.get(url)
#                 if response.status_code == 200:
#                     soup = BeautifulSoup(response.content, 'html.parser')
#                     break
#             except:
#                 continue
#         if soup:
#             links = [
#                 ("https://en.wikipedia.org" + a['href'], a['title'])
#                 for a in soup.find_all('a', href=True, title=True)
#                 if a['href'].startswith('/wiki/') and ':' not in a['href']
#             ]
#
#     print(f"🔗 Found {len(links)} raw links")
#
#     seen_titles = set()
#     filtered_links = []
#     for url, title in links:
#         if title in seen_titles:
#             continue
#         seen_titles.add(title)
#         filtered_links.append((url, title))
#
#     attraction = {}
#     lat_dd = lon_dd = None
#     map_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Edmonton_agglomeration-blank.svg/250px-Edmonton_agglomeration-blank.svg.png"
#     dot_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Red_pog.svg/20px-Red_pog.svg.png"
#
#     for full_url, title in filtered_links:
#         title_lower = title.lower()
#         if not is_relevant(title):
#             print(f"❌ Filtered out by title: {title}")
#             continue
#         try:
#             res = requests.get(full_url)
#             sub_soup = BeautifulSoup(res.content, 'html.parser')
#             if not is_content_relevant(sub_soup):
#                 print(f"⚠️ Content irrelevant for: {title}")
#                 continue
#             if title == city_name:
#                 city_lat, city_lon = getCityCoordinates(city_name, sub_soup)
#                 if city_lat and city_lon:
#                     lat_dd = dms_to_dd(city_lat.text)
#                     lon_dd = dms_to_dd(city_lon.text)
#             latOG = sub_soup.find('span', class_='latitude')
#             lonOG = sub_soup.find('span', class_='longitude')
#             if latOG is None or lonOG is None:
#                 print(f"📍 Skipping (no coords): {title}")
#                 continue
#             lat = dms_to_dd(latOG.text)
#             lon = dms_to_dd(lonOG.text)
#             img_urls = getAttractionImages(sub_soup, '.infobox-image img', map_url, dot_url)
#             img_urls2 = getAttractionImages(sub_soup, 'a.mw-file-description img', map_url, dot_url)
#             combinedImgUrls = list(set(img_urls + img_urls2))
#             if not combinedImgUrls:
#                 print(f"🖼️ Skipping (no images): {title}")
#                 continue
#             attraction[title] = {
#                 'url': full_url,
#                 'images': combinedImgUrls,
#                 'lat': lat,
#                 'lon': lon,
#                 'city_lat': lat_dd,
#                 'city_lon': lon_dd
#             }
#         except Exception as e:
#             print(f"💥 Error fetching {title}: {e}")
#
#     with transaction.atomic():
#         city = City.objects.create(name=city_name, citylat=lat_dd, citylon=lon_dd)
#         for name, info in attraction.items():
#             Attraction.objects.create(
#                 city=city,
#                 name=name,
#                 url=info['url'],
#                 image_urls=info['images'],
#                 lat=info['lat'],
#                 lon=info['lon'],
#             )
#
#     print(f"✅ Saved {len(attraction)} attractions for {city_name}")
#     return [
#         {"name": name, "url": info["url"], "images": info["images"],
#          'lat': info["lat"], 'lon': info["lon"], 'city_lat': info["city_lat"], 'city_lon': info["city_lon"]}
#         for name, info in attraction.items()
#     ]
#
# # Example usage:
# # print(get_attractions("Brussels"))

# ---------
# import requests
# from bs4 import BeautifulSoup
# from PIL import Image
# from io import BytesIO
# import os
# import django
# import sys
# import re
#
# BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
# if BASE_DIR not in sys.path:
#     sys.path.insert(0, BASE_DIR)
#
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
# django.setup()
# from backend.models import City, Attraction
# from django.db import transaction
#
# def dms_to_dd(dms_str):
#     """Convert DMS string like '51°07′48″N' or '113°57′09″W' to decimal degrees float."""
#     if not dms_str:
#         return None
#     pattern = r"(\d+)°(\d+)′(\d+)″?([NSEW])"
#     match = re.match(pattern, dms_str.strip())
#     if not match:
#         return None
#     degrees = int(match.group(1))
#     minutes = int(match.group(2))
#     seconds = int(match.group(3))
#     direction = match.group(4)
#     dd = degrees + minutes / 60 + seconds / 3600
#     if direction in ['S', 'W']:
#         dd = -dd
#     return dd
#
# def merge_images(map_url, img_url):
#     try:
#         img1 = Image.open(BytesIO(requests.get(map_url).content)).convert("RGB")
#         img2 = Image.open(BytesIO(requests.get(img_url).content)).convert("RGB")
#         target_width = min(img1.width, img2.width)
#         img1 = img1.resize((target_width, int(img1.height * target_width / img1.width)))
#         img2 = img2.resize((target_width, int(img2.height * target_width / img2.width)))
#         total_height = img1.height + img2.height
#         combined = Image.new("RGB", (target_width, total_height))
#         combined.paste(img2, (0, 0))
#         combined.paste(img1, (0, img2.height))
#         return combined
#     except Exception as e:
#         print(f"Error merging images: {e}")
#         return None
#
# def getAttractionImages(sub_soup, infobox_src, map_url, dot_url):
#     img_urls = []
#     infobox = sub_soup.find('table', class_='infobox')
#     if infobox:
#         image_tags = infobox.select(infobox_src)
#         for img in image_tags:
#             img_url = img.get('src')
#             if img_url:
#                 if img_url.startswith('//'):
#                     img_url = 'https:' + img_url
#                 if img_url != map_url and img_url != dot_url:
#                     img_urls.append(img_url)
#     return img_urls
#
# def is_relevant(title, sub_soup):
#     title_lower = title.lower()
#
#     # Hard exclude patterns
#     bad_keywords = [
#         'attack', 'massacre', 'history of', 'politics', 'economy',
#         'demographics', 'transport', 'timeline', 'government', 'province',
#         'municipality', 'county', 'region', 'kingdom', 'republic', 'empire', 'department'
#     ]
#     if any(bad in title_lower for bad in bad_keywords):
#         return False
#
#     # Category check
#     cat_links = [a.text.lower() for a in sub_soup.select('#mw-normal-catlinks a')]
#     good_cats = ['tourist attractions', 'landmarks', 'heritage', 'monuments',
#                  'museums', 'parks', 'historic sites']
#     if any(gc in cat for gc in good_cats for cat in cat_links):
#         return True
#
#     # Keyword fallback
#     keywords = [
#         'museum', 'park', 'gallery', 'monument', 'landmark',
#         'zoo', 'tower', 'theatre', 'botanical', 'historic',
#         'garden', 'palace', 'aquarium', 'castle', 'bridge',
#         'funicular', 'plaza', 'square', 'stadium'
#     ]
#     return any(keyword in title_lower for keyword in keywords)
#
#
# def getCityCoordinates(city_name, sub_soup):
#     lat = sub_soup.find('span', class_='latitude')
#     lon = sub_soup.find('span', class_='longitude')
#     return lat, lon
#
# # ---- New helper functions for multiple sources ----
# def get_links_from_category(city_formatted):
#     url = f"https://en.wikipedia.org/wiki/Category:Tourist_attractions_in_{city_formatted}"
#     try:
#         res = requests.get(url)
#         if res.status_code != 200:
#             return []
#         soup = BeautifulSoup(res.content, 'html.parser')
#         return [
#             ("https://en.wikipedia.org" + a['href'], a.get_text(strip=True))
#             for a in soup.select('.mw-category a')
#             if a['href'].startswith('/wiki/') and ':' not in a['href']
#         ]
#     except:
#         return []
#
# def get_links_from_list_page(city_formatted):
#     url = f"https://en.wikipedia.org/wiki/List_of_tourist_attractions_in_{city_formatted}"
#     try:
#         res = requests.get(url)
#         if res.status_code != 200:
#             return []
#         soup = BeautifulSoup(res.content, 'html.parser')
#         links = []
#         for ul in soup.find_all('ul'):
#             for a in ul.find_all('a', href=True, title=True):
#                 if a['href'].startswith('/wiki/') and ':' not in a['href']:
#                     links.append(("https://en.wikipedia.org" + a['href'], a['title']))
#         return links
#     except:
#         return []
#
# def get_links_from_city_page(city_formatted):
#     url = f"https://en.wikipedia.org/wiki/{city_formatted}"
#     try:
#         res = requests.get(url)
#         if res.status_code != 200:
#             return []
#         soup = BeautifulSoup(res.content, 'html.parser')
#         links = []
#         for header in soup.find_all(['h2', 'h3']):
#             text = header.get_text(strip=True).lower()
#             if any(k in text for k in ['attractions', 'sights', 'landmarks', 'tourism']):
#                 ul = header.find_next_sibling('ul')
#                 while ul and ul.name == 'ul':
#                     for a in ul.find_all('a', href=True, title=True):
#                         if a['href'].startswith('/wiki/') and ':' not in a['href']:
#                             links.append(("https://en.wikipedia.org" + a['href'], a['title']))
#                     ul = ul.find_next_sibling()
#         return links
#     except:
#         return []
#
# # ---- Main function ----
# def get_attractions(city_name):
#     # ✅ Step 1: Check if city is already cached in DB
#     city = City.objects.filter(name__iexact=city_name).first()
#     if city:
#         print(f"✅ Using cached data for {city_name}")
#         return [
#             {"name": a.name, "url": a.url, "images": a.image_urls, 'lat': a.lat, 'lon': a.lon}
#             for a in city.attractions.all()
#         ]
#
#     print(f"🌐 Scraping Wikipedia for {city_name}")
#     city_formatted = city_name.replace(" ", "_")
#     base_url = "https://en.wikipedia.org/wiki/"
#
#     # ✅ Step 2: Try smarter link gathering first
#     links = get_links_from_category(city_formatted)
#     if not links:
#         links = get_links_from_list_page(city_formatted)
#     if not links:
#         links = get_links_from_city_page(city_formatted)
#
#     # ✅ Step 3: If still nothing, fall back to your original URL candidates
#     if not links:
#         url_candidates = [
#             f"{base_url}List_of_tourist_attractions_in_{city_formatted}",
#             f"{base_url}Tourism_in_{city_formatted}",
#             f"{base_url}{city_formatted}"
#         ]
#         soup = None
#         for url in url_candidates:
#             print(f"🔍 Trying: {url}")
#             try:
#                 response = requests.get(url)
#                 if response.status_code == 200:
#                     soup = BeautifulSoup(response.content, 'html.parser')
#                     break
#             except:
#                 continue
#
#         if soup:
#             links = [
#                 ("https://en.wikipedia.org" + a['href'], a['title'])
#                 for a in soup.find_all('a', href=True, title=True)
#                 if a['href'].startswith('/wiki/') and ':' not in a['href']
#             ]
#
#     if not links:
#         print(f"❌ No attraction links found for {city_name}")
#         return []
#
#     irrelevant_keywords = [
#         'attack', 'massacre', 'history of', 'politics', 'economy',
#         'demographics', 'transport', 'list of', 'timeline', 'government',
#         'mayor', 'province', 'municipality'
#     ]
#
#     attraction = {}
#     lat_dd = lon_dd = None
#     map_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Edmonton_agglomeration-blank.svg/250px-Edmonton_agglomeration-blank.svg.png"
#     dot_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Red_pog.svg/20px-Red_pog.svg.png"
#
#     # ✅ Step 4: Process each link
#     for full_url, title in links:
#         title_lower = title.lower()
#
#         try:
#             res = requests.get(full_url)
#             sub_soup = BeautifulSoup(res.content, 'html.parser')
#
#             if not is_relevant(title, sub_soup) or any(k in title_lower for k in irrelevant_keywords):
#                 continue
#
#             if title == city_name:
#                 city_lat, city_lon = getCityCoordinates(city_name, sub_soup)
#                 if city_lat and city_lon:
#                     lat_dd = dms_to_dd(city_lat.text)
#                     lon_dd = dms_to_dd(city_lon.text)
#
#             latOG = sub_soup.find('span', class_='latitude')
#             lonOG = sub_soup.find('span', class_='longitude')
#             if latOG is None or lonOG is None:
#                 continue
#             lat = dms_to_dd(latOG.text)
#             lon = dms_to_dd(lonOG.text)
#
#             img_urls = getAttractionImages(sub_soup, '.infobox-image img', map_url, dot_url)
#             img_urls2 = getAttractionImages(sub_soup, 'a.mw-file-description img', map_url, dot_url)
#             combinedImgUrls = list(set(img_urls + img_urls2))
#             if not combinedImgUrls:
#                 continue
#
#             attraction[title] = {
#                 'url': full_url,
#                 'images': combinedImgUrls,
#                 'lat': lat,
#                 'lon': lon,
#                 'city_lat': lat_dd,
#                 'city_lon': lon_dd
#             }
#         except Exception as e:
#             print(f"Error fetching page for {title}: {e}")
#
#     # ✅ Step 5: Save to DB
#     with transaction.atomic():
#         city = City.objects.create(name=city_name, citylat=lat_dd, citylon=lon_dd)
#         for name, info in attraction.items():
#             Attraction.objects.create(
#                 city=city,
#                 name=name,
#                 url=info['url'],
#                 image_urls=info['images'],
#                 lat=info['lat'],
#                 lon=info['lon'],
#             )
#
#     print(f"✅ Saved {len(attraction)} attractions for {city_name}")
#     return [
#         {"name": name, "url": info["url"], "images": info["images"],
#          'lat': info["lat"], 'lon': info["lon"], 'city_lat': info["city_lat"], 'city_lon': info["city_lon"]}
#         for name, info in attraction.items()
#     ]

# print(get_attractions("Brussels"))

#----------ORIGINAL

# import requests
# from bs4 import BeautifulSoup
# from PIL import Image
# from io import BytesIO
# import os
# import django
# import sys
# import re
#
# BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
# if BASE_DIR not in sys.path:
#     sys.path.insert(0, BASE_DIR)
#
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
# django.setup()
# from backend.models import City, Attraction
# from django.db import transaction
#
# def dms_to_dd(dms_str):
#     """
#     Convert DMS string like '51°07′48″N' or '113°57′09″W' to decimal degrees float.
#     """
#     if not dms_str:
#         return None
#
#     # Pattern captures degrees, minutes, seconds, and direction
#     pattern = r"(\d+)°(\d+)′(\d+)″?([NSEW])"
#     match = re.match(pattern, dms_str.strip())
#     if not match:
#         return None
#
#     degrees = int(match.group(1))
#     minutes = int(match.group(2))
#     seconds = int(match.group(3))
#     direction = match.group(4)
#
#     dd = degrees + minutes / 60 + seconds / 3600
#
#     if direction in ['S', 'W']:
#         dd = -dd
#
#     return dd
#
# def merge_images(map_url, img_url):
#     try:
#         img1 = Image.open(BytesIO(requests.get(map_url).content)).convert("RGB")
#         img2 = Image.open(BytesIO(requests.get(img_url).content)).convert("RGB")
#
#         target_width = min(img1.width, img2.width)
#         img1 = img1.resize((target_width, int(img1.height * target_width / img1.width)))
#         img2 = img2.resize((target_width, int(img2.height * target_width / img2.width)))
#
#         total_height = img1.height + img2.height
#         combined = Image.new("RGB", (target_width, total_height))
#
#         combined.paste(img2, (0, 0))
#         combined.paste(img1, (0, img2.height))
#
#         return combined
#     except Exception as e:
#         print(f"Error merging images: {e}")
#         return None
#
# def getAttractionImages(sub_soup, infobox_src, map_url, dot_url):
#     img_urls = []
#     infobox = sub_soup.find('table', class_='infobox')
#     if infobox:
#         image_tags = infobox.select(infobox_src)
#         for img in image_tags:
#             img_url = img.get('src')
#             if img_url:
#                 if img_url.startswith('//'):
#                     img_url = 'https:' + img_url
#                 if img_url != map_url and img_url != dot_url:
#                     img_urls.append(img_url)
#     return img_urls
#
# def is_relevant(title):
#     keywords = [
#         'museum', 'park', 'gallery', 'monument', 'landmark',
#         'zoo', 'tower', 'theatre', 'botanical', 'historic',
#         'garden', 'palace', 'aquarium', 'castle', 'bridge',
#         'funicular', 'street', 'building', 'club','chinatown',
#         'city', 'centre', 'house', 'hotel', 'district', 'villa',
#         'casino', 'place', 'art','field','downtown', 'stadium', 'mall', 'land', 'race']
#     title_lower = title.lower()
#     return any(keyword in title_lower for keyword in keywords)
#
#
# def getCityCoordinates(city_name, sub_soup):
#     lat = sub_soup.find('span', class_='latitude')
#     lon = sub_soup.find('span', class_='longitude')
#
#     return lat, lon
#
# def get_attractions(city_name):
#     # ✅ Step 1: Check if city is already cached in DB
#     city = City.objects.filter(name__iexact=city_name).first()
#     if city:
#         print(f"✅ Using cached data for {city_name}")
#
#         return [
#             {
#                 "name": a.name,
#                 "url": a.url,
#                 "images": a.image_urls,
#                 'lat': a.lat,
#                 'lon': a.lon
#             } for a in city.attractions.all()
#         ]
#     else:
#
#         # ✅ Step 2: Scrape data from Wikipedia
#         print(f"🌐 Scraping Wikipedia for {city_name}")
#         base_url = "https://en.wikipedia.org/wiki/"
#         city_formatted = city_name.replace(" ", "_")
#         url_candidates = [
#             f"{base_url}List_of_tourist_attractions_in_{city_formatted}",
#             f"{base_url}Tourism_in_{city_formatted}",
#             f"{base_url}{city_formatted}"
#         ]
#
#         soup = None
#         for url in url_candidates:
#             print(f"🔍 Trying: {url}")
#             try:
#                 response = requests.get(url)
#                 if response.status_code == 200:
#                     soup = BeautifulSoup(response.content, 'html.parser')
#                     break
#             except:
#                 continue
#
#         if soup is None:
#             print(f"❌ Could not fetch a valid page for {city_name}")
#             return []
#
#         attraction = {}
#         rejected_list = []
#         map_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Edmonton_agglomeration-blank.svg/250px-Edmonton_agglomeration-blank.svg.png"
#         dot_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Red_pog.svg/20px-Red_pog.svg.png"
#         for a in soup.find_all('a', href=True, title=True):
#             # if len(attraction) >= 10:
#             #     break
#             href = a['href']
#             title = a['title']
#
#             if not (href.startswith('/wiki/') and ':' not in href):
#                 continue
#
#             full_url = "https://en.wikipedia.org" + href
#             try:
#                 res = requests.get(full_url)
#                 sub_soup = BeautifulSoup(res.content, 'html.parser')
#
#                 if title == city_name:
#                     city_lat, city_lon = getCityCoordinates(city_name, sub_soup)
#                     lat_dd = dms_to_dd(str(city_lat.text))
#                     lon_dd = dms_to_dd(str(city_lon.text))
#
#                 subheaders = sub_soup.select('.infobox-subheader')
#                 subheader_texts = [tag.text.strip().lower() for tag in subheaders]
#                 keywords = ['country', 'province', 'state', 'city', 'borough', 'county',
#                             'municipality', 'settlement type', 'states', 'list', 'wikipedia', 'content']
#
#                 if any(kw in subheader_texts for kw in keywords):
#                     print(f"❌ Rejected '{title}' — matched keyword in subheaders")
#                     rejected_list.append(title)
#                     continue
#
#                 # if not is_relevant(title):
#                 #     print(f"❌ Rejected '{title}' — not a relevant attraction")
#                 #     rejected_list.append(title)
#                 #     continue
#
#                 latOG = sub_soup.find('span', class_='latitude')
#                 lonOG = sub_soup.find('span', class_='longitude')
#
#                 if latOG is None or lonOG is None:
#                     print(f"❌ Skipping '{title}' — no coordinates found")
#                     rejected_list.append(title)
#                     continue
#
#                 lat = dms_to_dd(str(latOG.text))
#                 lon = dms_to_dd(str(lonOG.text))
#
#                 img_urls = getAttractionImages(sub_soup, '.infobox-image img', map_url, dot_url)
#                 img_urls2 = getAttractionImages(sub_soup, 'a.mw-file-description img', map_url, dot_url)
#                 combinedImgUrls = list(set(img_urls + img_urls2))
#
#                 attraction[title] = {
#                     'url': full_url,
#                     'images': combinedImgUrls,
#                     'lat': lat,
#                     'lon': lon,
#                     'city_lat': lat_dd,
#                     'city_lon': lon_dd
#
#                 }
#             except Exception as e:
#                 print(f"Error fetching page for {title}: {e}")
#
#         # ✅ Step 3: Save to database
#         with transaction.atomic():
#             city = City.objects.create(
#                 name=city_name,
#                 citylat=lat_dd,
#                 citylon=lon_dd,
#             )
#             for name, info in attraction.items():
#                 Attraction.objects.create(
#                     city=city,
#                     name=name,
#                     url=info['url'],
#                     image_urls=info['images'],
#                     lat=info['lat'],
#                     lon=info['lon'],
#                 )
#
#         print(f"✅ Saved {len(attraction)} attractions for {city_name}")
#         return [
#             {
#                 "name": name,
#                 "url": info["url"],
#                 "images": info["images"],
#                 'lat': lat,
#                 'lon': lon,
#                 'city_lat': lat_dd,
#                 'city_lon': lon_dd
#             }
#             for name, info in attraction.items()
#         ]
#
# #print(get_attractions("Edmonton"))
