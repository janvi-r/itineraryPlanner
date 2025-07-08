# import requests
# from bs4 import BeautifulSoup
# import time
# import wikipedia
#
# def get_attractions(city):
#     base_url = "https://en.wikipedia.org/wiki/"
#     city_formatted = city.replace(" ", "_")
#
#     url_candidates = [
#         f"{base_url}List_of_tourist_attractions_in_{city_formatted}",
#         f"{base_url}Tourism_in_{city_formatted}",
#         f"{base_url}{city_formatted}"
#     ]
#
#     soup = None
#     for url in url_candidates:
#         print(f"🔍 Trying: {url}")
#         try:
#             response = requests.get(url)
#             if response.status_code == 200:
#                 soup = BeautifulSoup(response.content, 'html.parser')
#                 break
#         except:
#             continue
#
#     if soup is None:
#         print(f"❌ Could not fetch a valid page for {city}")
#         return
#
#     attractions = set()
#     images = []
#     attraction = {}
#     rejected_list = []
#     approved_list = []
#     for a in soup.find_all('a', href=True, title=True):
#         for a in soup.find_all('a', href=True, title=True):
#             if len(attraction) >= 30:
#                 break
#             href = a['href']
#             title = a['title']
#             if (href.startswith('/wiki/') and ':' not in href):# filter out special pages like Help:, File:, etc.
#                 attractions.add(title)
#                 if not is_relevant(title):
#                     rejected_list.append(title)
#                     continue
#                 full_url = "https://en.wikipedia.org" + href
#                 attraction[title] = {'url': full_url}
#
#                 try:
#                    # time.sleep(0.5)
#                     res = requests.get(full_url)
#                     sub_soup = BeautifulSoup(res.content, 'html.parser')
#
#                     # Get image
#                     image = sub_soup.select_one('.infobox img')
#                     if image:
#                         img_url = image.get('src')
#                         if img_url.startswith('//'):
#                             img_url = 'https:' + img_url
#                         attraction[title]['image'] = img_url
#                     else:
#                         attraction[title]['image'] = 'N/A'
#
#                 except Exception as e:
#                     attraction[title]['image'] = 'N/A'
#     results = []
#     for name, info in attraction.items():
#         results.append({
#                     "name": name,
#                     "url": info['url'],
#                     "image": info['image']
#                 })
#
#     #return results
#     return rejected_list
#
# def is_relevant(title):
#     keywords = [
#         'museum', 'park', 'gallery', 'monument', 'landmark',
#         'zoo', 'tower', 'theatre', 'botanical', 'historic',
#         'garden', 'palace', 'aquarium', 'castle', 'bridge',
#         'funicular', 'street', 'building', 'club','chinatown',
#         'city', 'centre', 'house', 'hotel', 'district', 'villa',
#         'casino', 'place', 'art','field','downtown', 'stadium', 'mall', 'land', 'race'
#     ]
#     title_lower = title.lower()
#     return any(keyword in title_lower for keyword in keywords)
#
#
# print(get_attractions("Edmonton"))
# #print(get_attractions("Calgary"))
# #print(get_attractions("Toronto"))
# # get_attractions("Madrid")
# #print(get_attractions("New York City"))
# # get_attractions("Vancouver")
# #get_attractions("Brussels")

import requests
from bs4 import BeautifulSoup
#import pillow
from PIL import Image
from io import BytesIO
import time
import wikipedia


def merge_images(map_url, img_url):
    try:
        # Load the first image
        img1 = Image.open(BytesIO(requests.get(map_url).content)).convert("RGB")

        # Load image 2 (will go on top)
        img2 = Image.open(BytesIO(requests.get(img_url).content)).convert("RGB")

        target_width = min(img1.width, img2.width)
        img1 = img1.resize((target_width, int(img1.height * target_width / img1.width)))
        img2 = img2.resize((target_width, int(img2.height * target_width / img2.width)))

        # Create a new image tall enough to hold both
        total_height = img1.height + img2.height
        combined = Image.new("RGB", (target_width, total_height))

        # Paste img2 (top), then img1 (bottom)
        combined.paste(img2, (0, 0))
        combined.paste(img1, (0, img2.height))

        return combined

    except Exception as e:
        print(f"Error merging images: {e}")
        return None


def getAttractionImages(infobox_src):
    pass


def get_attractions(city):
    base_url = "https://en.wikipedia.org/wiki/"
    city_formatted = city.replace(" ", "_")

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
        print(f"❌ Could not fetch a valid page for {city}")
        return

    attractions = set()
    images = []
    attraction = {}
    rejected_list = []
    approved_list = []
    map_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Edmonton_agglomeration-blank.svg/250px-Edmonton_agglomeration-blank.svg.png"
    for a in soup.find_all('a', href=True, title=True):
        if len(attraction) >= 30:
            break
        href = a['href']
        title = a['title']
        # if (href.startswith('/wiki/') and ':' not in href):# filter out special pages like Help:, File:, etc.
        #     #attractions.add(title)
        #     # if not is_relevant(title):
        #     #     rejected_list.append(title)
        #     #     continue
        #     full_url = "https://en.wikipedia.org" + href
        #     attraction[title] = {'url': full_url}
        if not (href.startswith('/wiki/') and ':' not in href):
            continue

        full_url = "https://en.wikipedia.org" + href
        try:
            res = requests.get(full_url)
            sub_soup = BeautifulSoup(res.content, 'html.parser')
            keywords = ['country', 'province', 'state', 'city', 'borough', 'county', 'municipality', 'settlement type',
                        'states', 'list', 'wikipedia', 'content']

            # Check for 'infobox-subheader' tags only
            subheaders = sub_soup.select('.infobox-subheader')
            subheader_texts = [tag.text.strip().lower() for tag in subheaders]
            matched_keyword = next((kw for kw in keywords if kw in subheader_texts), None)

            if matched_keyword:
                print(f"❌ Rejected '{title}' — matched exact keyword: '{matched_keyword}'")
                print(subheader_texts)
                rejected_list.append(f"{title} (matched: {matched_keyword})")
                continue

            img_urls = []
            #getAttractionImages(infobox_src)
            #images = sub_soup.select('.infobox .infobox-image img')
            infobox = sub_soup.find('table', class_='infobox')
            if infobox:
                image_tags = infobox.select('.infobox-image img')
                for img in image_tags:
                    img_url = img.get('src')
                    if img_url:
                    #if not (img_url.endswith("Red_pog.svg.png") or img_url.endswith(map_url)):
                        if img_url.startswith('//'):
                            img_url = 'https:' + img_url
                        img_urls.append(img_url)
            else:
                img_urls.append('N/A')
            # images = sub_soup.select('.infobox .infobox-image img')
            # if images:
            #     for i in range(len(images)):
            #         img_url = images[i].get('src')
            #         if img_url.startswith('//'):
            #             img_url = 'https:' + img_url
            #             img_urls.append(img_url)
            # else:
            #     img_url = 'N/A'
            #     img_urls.append(img_url)
            #     image_found = False

            attraction[title] = {
                'url': full_url,
                'images': img_urls
            }

        except Exception as e:
            print(f"Error fetching page for {title}: {e}")

    results = []
    count = 0
    for name, info in attraction.items():
        if 'url' in info and 'images' in info:
            count += 1
            if count > 2:
                results.append({
                    "name": name,
                    "url": info['url'],
                    "images": info['images']
                })
        else:
            print(f"⚠️ Skipping {name} due to missing data: {info}")

    return results

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


print(get_attractions("Edmonton"))
#print(get_attractions("Calgary"))
#print(get_attractions("Toronto"))
# get_attractions("Madrid")
#print(get_attractions("New York City"))
# get_attractions("Vancouver")
#get_attractions("Brussels")
