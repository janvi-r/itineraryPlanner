import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, ScrollView, Button } from 'react-native';
import SwipeCard from '../components/swipeCard';
import { useNavigation } from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const HomeScreen = () => {
  const [city, setCity] = useState('');
  const [cards, setCards] = useState([]);
  const [savedList, setSavedList] = useState([]);
  const [suggestedCity, setSuggestedCity] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (!city) {
      setSuggestedCity(null);
      return;
    }

    const timeout = setTimeout(() => {
      fetch(`http://192.168.1.205:8000/cityVerifier?city=${encodeURIComponent(city)}`)
        .then(response => response.json())
        .then(data => {
          if (data.match && data.match.toLowerCase() !== city.toLowerCase()) {
            setSuggestedCity(data.match);
          } else {
            setSuggestedCity(null);
          }
        })
        .catch(error => {
          console.error("Error verifying city:", error);
          setSuggestedCity(null);
        });
    }, 500);

    return () => clearTimeout(timeout);
  }, [city]);

  const fetchAttractions = async () => {
    try {
      const response = await fetch(`http://192.168.1.205:8000/attractions?city=${city}`);
      const data = await response.json();
      setCards(data);
      setSavedList([]);
    } catch (e) {
      console.error('❌ Error fetching attractions:', e);
    }
  };

  const handleSwipeRight = (item) => {
    setSavedList(prev => [...prev, item.name]);
    removeTopCard();
  };

  const handleSwipeLeft = () => {
    removeTopCard();
  };

  const removeTopCard = () => {
    setCards(prev => prev.slice(1));
  };

  const handleDone = () => {
    if (!city) return;
    navigation.navigate('Map', { cityName: city });
  };

  return (
    <View style={styles.container}>
      {cards.length === 0 && savedList.length === 0 ? (
        <>
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
          {suggestedCity && (
            <TouchableOpacity onPress={() => setCity(suggestedCity)}>
              <Text style={{ color: 'blue', marginTop: 6 }}>
                Did you mean: <Text style={{ fontWeight: 'bold' }}>{suggestedCity}</Text>?
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={styles.title}>{city}</Text>
      )}

      <View style={styles.cardContainer}>
        {cards.length > 0 ? (
          cards.map((item, index) => {
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
          }).reverse()
        ) : (
          savedList.length > 0 ? (
            <ScrollView contentContainerStyle={styles.resultContainer}>
              <Text style={styles.savedTitle}>Saved Attractions:</Text>
              {savedList.map((name, index) => (
                <Text key={index} style={styles.savedItem}>• {name}</Text>
              ))}
              <View style={{ marginTop: 20 }}>
                <Button title="Done Choosing Attractions" onPress={handleDone} />
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.savedTitle}>No results yet. Search for a city!</Text>
          )
        )}
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
  title: { fontSize: 28, fontWeight: '600', marginBottom: 20, letterSpacing: 0.5, fontFamily: 'AvenirNext-Regular'},
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
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  buttonText: { color: 'white', fontWeight: '600' },
  cardContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 20,
    letterSpacing: 0.5, fontFamily: 'AvenirNext-Regular'
  },
  resultContainer: {
    alignItems: 'flex-start',
    width: '100%',
    paddingVertical: 20,
  },
  savedTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  savedItem: {
    fontSize: 18,
    color: '#333',
    marginVertical: 4,
  },
});

export default HomeScreen;
