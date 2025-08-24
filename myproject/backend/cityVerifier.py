from difflib import get_close_matches
import pickle

def find_closest_city(user_input):
    with open('cities.pkl', 'rb') as f:
        cities = pickle.load(f)

    matches = get_close_matches(user_input, cities, n=1, cutoff=0.6)

    confirmed_city = matches[0] if matches else None
    return confirmed_city



