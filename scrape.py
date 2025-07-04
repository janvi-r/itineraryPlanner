import requests
from bs4 import BeautifulSoup
import time

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

    for a in soup.find_all('a', href=True, title=True):
        for a in soup.find_all('a', href=True, title=True):
            if len(attraction) >= 10:
                break
            href = a['href']
            title = a['title']
            if (href.startswith('/wiki/') and ':' not in href):# filter out special pages like Help:, File:, etc.
                attractions.add(title)
                full_url = "https://en.wikipedia.org" + href
                attraction[title] = {'url': full_url}

                try:
                    time.sleep(0.5)
                    res = requests.get(full_url)
                    sub_soup = BeautifulSoup(res.content, 'html.parser')

                    # Get image
                    image = sub_soup.select_one('.infobox img')
                    if image:
                        img_url = image.get('src')
                        if img_url.startswith('//'):
                            img_url = 'https:' + img_url
                        attraction[title]['image'] = img_url
                    else:
                        attraction[title]['image'] = 'N/A'

                except Exception as e:
                    attraction[title]['image'] = 'N/A'


            # full_url = base_url + href
            # attractions[title] = {"url": full_url}
            #
            # for title, data in list(attractions[:5]):  # limit to 10 for speed
            #     url = data['url']
            #     try:
            #         time.sleep(0.5)  # polite delay
            #         res = requests.get(url)
            #         sub_soup = BeautifulSoup(res.content, 'html.parser')
            #
            #         # Get image (from infobox)
            #         image = sub_soup.select_one('.infobox img')
            #         if image:
            #             data['image_url'] = base_url + image['src']
            #         else:
            #             data['image_url'] = "N/A"
            #
            #         # Get coordinates
            #         coord = sub_soup.select_one('.geo')
            #         if coord:
            #             lat, lon = coord.text.strip().split('; ')
            #             data['coordinates'] = (lat, lon)
            #         else:
            #             data['coordinates'] = "N/A"
            #
            #     except Exception as e:
            #         data['image_url'] = "N/A"
            #         data['coordinates'] = "N/A"
#OLD STUFF
    if attractions:
        print(f"\n🎯 Attractions found for {city.title()}:\n")
        for name in sorted(attractions):
            print(f"- {name}")
    else:
        print(f"⚠️ No attractions found on the Wikipedia page for {city}")

    for name, info in attraction.items():
        print(f"🏛️ {name}")
        print(f"   🔗 URL: {info['url']}")
        print(f"   🖼️ Image: {info['image']}")
        print()


# ✅ Example use:
#get_attractions("Edmonton")
#get_attractions("Calgary")
# get_attractions("Toronto")
# get_attractions("Madrid")
# get_attractions("New York City")
# get_attractions("Vancouver")
get_attractions("Brussels")
