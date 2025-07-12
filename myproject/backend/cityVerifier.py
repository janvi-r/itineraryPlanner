from difflib import get_close_matches
import pickle

def find_closest_city(user_input):
    with open('cities.pkl', 'rb') as f:
        cities = pickle.load(f)

    matches = get_close_matches(user_input, cities, n=1, cutoff=0.6)

    confirmed_city = matches[0] if matches else None
    return confirmed_city

    # if confirmed_city:
    #     user_input = input(f"Did you mean {confirmed_city}? (Y/N) ")
    #     # RN im making it so they type y or n but in the long run I would like to change it so that it auto replaces their text with the city we think and if they press the enter button it goes or they delete it
    #     if user_input.lower() == "y":
    #         return {"match": confirmed_city}
    #
    # print("City not found. Please check the spelling and try again.")
    # return None


# This is test blwoe thing: we can delete this later
# user_input2 = input("Enter city name: ")
# find_closest_city(user_input2)

