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
import time
import wikipedia

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
        #     attraction[title] = {'url': full_url} #TODO - only do this if not a city or country
        if not (href.startswith('/wiki/') and ':' not in href):
            continue

        full_url = "https://en.wikipedia.org" + href
        try:
            res = requests.get(full_url)
            sub_soup = BeautifulSoup(res.content, 'html.parser')
            keywords = ['country', 'province', 'state', 'city', 'borough', 'county', 'municipality', 'settlement type', 'states', 'list']

            # Check if it's a geographic region
            infobox = sub_soup.find("table", {"class": "infobox"})
            if infobox:
                link_texts = [link.text.strip().lower() for link in infobox.find_all('a')]
                matched_keyword = next((kw for kw in keywords if kw in link_texts), None)

                if matched_keyword:
                    print(f"❌ Rejected '{title}' — matched exact keyword: '{matched_keyword}'")
                    print(link_texts)
                    rejected_list.append(f"{title} (matched: {matched_keyword})")
                    continue

            # ✅ Not a region — safe to add
            image = sub_soup.select_one('.infobox img')
            if image:
                img_url = image.get('src')
                if img_url.startswith('//'):
                    img_url = 'https:' + img_url
            else:
                img_url = 'N/A'

            attraction[title] = {
                'url': full_url,
                'image': img_url
            }

        except Exception as e:
            print(f"Error fetching page for {title}: {e}")

    results = []
    for name, info in attraction.items():
        if 'url' in info and 'image' in info:  # ✅ Only add complete items
            results.append({
                "name": name,
                "url": info['url'],
                "image": info['image']
            })
        else:
            print(f"⚠️ Skipping {name} due to missing data: {info}")

    return results#, rejected_list
    #return rejected_list

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


#print(get_attractions("Edmonton"))
#print(get_attractions("Calgary"))
print(get_attractions("Toronto"))
# get_attractions("Madrid")
#print(get_attractions("New York City"))
# get_attractions("Vancouver")
#get_attractions("Brussels")
