import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import SwipeCard from '../components/swipeCard'; // import the card component

const SCREEN_WIDTH = Dimensions.get('window').width;

const myList = [];

const HomeScreen = () => {
  const [city, setCity] = useState('');
  const [cards, setCards] = useState([]);

  const fetchAttractions = async () => {
    try {
      const response = await fetch(`http://192.168.1.205:8000/attractions?city=${city}`);
      const data = await response.json();
      console.log('Fetched attractions:', data);  // <-- Add this log
      setCards(data);
    } catch (e) {
      console.error('❌ Error fetching attractions:', e);
    }
  };

  const handleSwipeRight = (item) => {
    myList.push(item.name);
    removeTopCard();
  };

  const handleSwipeLeft = () => {
    removeTopCard();
  };

  const removeTopCard = () => {
    setCards((prev) => prev.slice(1));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attraction Explorer</Text>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Enter a city..."
          style={styles.input}
          value={city}
          onChangeText={setCity}
        />
        <TouchableOpacity onPress={fetchAttractions} style={styles.button}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {cards.map((item, index) => {
          if (index === 0) {
            return (
              <SwipeCard
                key={item.name || index}
                data={item}
                onSwipeRight={handleSwipeRight}
                onSwipeLeft={handleSwipeLeft}
              />
            );
          }
          return null;
        }).reverse()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 20 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  input: {
    flex: 1,
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    height: 40,
    backgroundColor: '#fff',
  },
  button: { backgroundColor: '#007BFF', borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
  cardContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});

export default HomeScreen;
