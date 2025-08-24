import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
} from 'react-native';

const slides = [
  {
    image: require('/Users/janvi/PycharmProjects/itineraryPlanner/frontend/hawaii.jpg.avif'),
    text: 'Hawaii',
  },
  {
    image: require('/Users/janvi/PycharmProjects/itineraryPlanner/frontend/nyc.jpg'),
    text: 'NYC',
  },
  {
    image: require('/Users/janvi/PycharmProjects/itineraryPlanner/frontend/italy.jpg'),
    text: 'Italy',
  },
];

const TripApp = ({ navigation, route }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { username } = route.params;
  const [tripCount, setTripCount] = useState(0);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user's FinalItinerary
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch(`http://192.168.1.205:8000/api/user_trips/${username}/`);
        const data = await response.json();

        // Get unique days of itinerary
        const cities = data.map(trip => trip.city);
        const uniqueCities = [...new Set(cities)];
        setTripCount(uniqueCities.length);
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    };

    fetchTrips();
  }, [username]);

  return (
    <ImageBackground style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              Trips you been on: {tripCount}
            </Text>
          </View>

          <ImageBackground
            source={slides[currentIndex].image}
            style={styles.cardBackground}
            imageStyle={{ borderRadius: 10 }}
          >
            <View style={styles.cardOverlay}>
              <Text style={styles.cardText}>{slides[currentIndex].text}</Text>
            </View>
          </ImageBackground>
        </View>
      </View>

      <ImageBackground
        source={require('/Users/janvi/PycharmProjects/itineraryPlanner/frontend/images/sunset.jpg')}
        style={styles.bottomBigcard}
        imageStyle={{ borderRadius: 8 }}
      >
        <Text style={styles.message}>Your Trip Awaits You!</Text>
        <TouchableOpacity onPress={() => navigation.navigate('attractionChoice')}></TouchableOpacity>
      </ImageBackground>

      <View style={styles.bottomNav}>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('attractionChoice', { username })}
        >
          <Text style={styles.icon}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('profileScreen', { username })}
        >
          <Text style={styles.icon}>👤</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  cardBackground: {
    width: 185,
    height: 260,
    justifyContent: 'center',
  },
  cardOverlay: {
    padding: 15,
    borderRadius: 10,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: -380,
  },
  card: {
    backgroundColor: 'thistle',
    borderRadius: 8,
    padding: 20,
    width: 185,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cardText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'AvenirNext-Regular',
    letterSpacing: 0.5,
  },
  bottomBigcard: {
    position: 'absolute',
    top: 300,
    alignSelf: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 20,
    height: 380,
    width: 390,
    marginTop: 0,
  },
  message: {
    marginTop: 30,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'AvenirNext-Regular',
    letterSpacing: 0.5,
    color: 'midnightblue',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderTopWidth: 2,
    borderColor: '#555',
  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    color: 'black',
  },
});

export default TripApp;

