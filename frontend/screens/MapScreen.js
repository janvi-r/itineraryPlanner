import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const SCREEN_WIDTH = Dimensions.get('window').width;

const MapScreen = ({ route }) => {
  const { cityName, selectedAttractions } = route.params;
  const [city, setCity] = useState(null);
  const [attractions, setAttractions] = useState([]);


    useEffect(() => {
  const username = 'janvi';
  fetch(`http://192.168.1.205:8000/api/saved_trip_attractions/${encodeURIComponent(cityName)}/${encodeURIComponent(username)}/`)
    .then(res => {
      console.log('Fetch response status:', res.status);
      return res.json();
    })
    .then(data => {
      console.log('Fetched data:', data);
      setCity(data.city);
      setAttractions(data.attractions);
    })
    .catch(error => {
      console.error("Map fetch error:", error);
    });
}, [cityName]);

// In render, before return
console.log('Current city state:', city);
console.log('Current attractions state:', attractions);




  if (!city) return null;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: parseFloat(city.lat),
          longitude: parseFloat(city.lon),
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Center Marker */}
        <Marker
          coordinate={{ latitude: parseFloat(city.lat), longitude: parseFloat(city.lon) }}
          title={city.name}
          description="City Center"
        />

        {/* Attraction Markers */}
        {/* Attraction Markers */}
{attractions
  .filter(a => a.lat && a.lon)  // only attractions with valid lat and lon
  .map((a, index) => (
    <Marker
      key={index}
      coordinate={{ latitude: parseFloat(a.lat), longitude: parseFloat(a.lon) }}
      title={a.name}
      description={a.url}
    />
  ))
}

      </MapView>
    </View>
  );
};

//TODO - try with fake numbers. Potential Issue: Our lat and lon have N,E,S, W so make it into one number value with +/-


const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
});

export default MapScreen;