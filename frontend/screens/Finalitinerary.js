import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const SCREEN_WIDTH = Dimensions.get('window').width;

const FinalItinerary = ({ route, navigation }) => {
  const { itinerary } = route.params;
  const { username } = route.params;



  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Final Itinerary</Text>

      {/* Home button */}


      {itinerary.map(({ day, attractions }) => {
        const coordinates = attractions
          .filter(a => a.lat && a.lon)
          .map(a => ({
            latitude: parseFloat(a.lat),
            longitude: parseFloat(a.lon),
          }));

        return (
          <View key={day} style={styles.daySection}>
            <Text style={styles.dayTitle}>Day {day}</Text>

            {coordinates.length > 0 && (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: coordinates[0].latitude,
                  longitude: coordinates[0].longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                {coordinates.map((coord, index) => (
                  <Marker
                    key={index}
                    coordinate={coord}
                    title={attractions[index].name}
                  />
                ))}

                <Polyline
                  coordinates={coordinates}
                  strokeColor="#007BFF"
                  strokeWidth={3}
                />
              </MapView>
            )}

            {attractions.length > 0 ? (
              attractions.map((attr, index) => (
                <Text key={index} style={styles.attraction}>
                  {attr.name || attr}
                </Text>
              ))
            ) : (
              <Text style={styles.noAttractions}>
                No attractions selected.
              </Text>
            )}
          </View>
        );
      })}
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('Drawer', {
    screen: 'TripApp',
    params: { username: username }
  })
}

      >
        <Text style={styles.homeButtonText}>Go Back Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#dcdcdc',
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'AvenirNext-Regular',
  },
  homeButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  daySection: {
    marginBottom: 30,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  map: {
    width: SCREEN_WIDTH - 40,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  attraction: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 5,
  },
  noAttractions: {
    fontStyle: 'italic',
    color: '#777',
    textAlign: 'center',
  },
});

export default FinalItinerary;
