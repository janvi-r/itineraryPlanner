import React, { useEffect, useState } from 'react';
import {View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, LayoutAnimation, Platform, UIManager} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const SCREEN_WIDTH = Dimensions.get('window').width;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PastTrips = ({ route }) => {
  const { username } = route.params;
  const [trips, setTrips] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState({});

  useEffect(() => {
    fetch(`http://192.168.1.205:8000/api/user_trips/${encodeURIComponent(username)}/`)
      .then(res => res.json())
      .then(data => {
        const grouped = {};
        data.forEach(trip => {
          const city = trip.city;
          if (!grouped[city]) grouped[city] = [];
          grouped[city].push(trip);
        });
        setTrips(grouped);
      })
      .catch(err => {
        console.error("Failed to load trips:", err);
        setTrips({});
      })
      .finally(() => setLoading(false));
  }, [username]);

  const toggleExpand = (city, day) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const key = `${city}-${day}`;
    setExpandedDays(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return <View style={styles.container}><Text>Loading past trips...</Text></View>;
  }

  if (!Object.keys(trips).length) {
    return <View style={styles.container}><Text>No past trips found.</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Past Trips</Text>
      {Object.entries(trips).map(([city, dayTrips], idx) => (
        <View key={idx} style={styles.tripSection}>
          <Text style={styles.tripTitle}>{city}</Text>

          {dayTrips.map((trip, i) => {
            const { day, attractions, attractions_data } = trip;
            const coordinates = (attractions_data || []).filter(a => a.lat && a.lon).map(a => ({
              latitude: parseFloat(a.lat),
              longitude: parseFloat(a.lon),
            }));
            const key = `${city}-${day}`;
            const isExpanded = expandedDays[key];

            return (
              <View key={i} style={{ marginBottom: 15 }}>
                <TouchableOpacity onPress={() => toggleExpand(city, day)} style={styles.dayHeader}>
                  <Text style={styles.dayText}>Day {day} {isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ marginTop: 10 }}>
                    {coordinates.length > 0 && (
                      <MapView
                        style={styles.map}
                        initialRegion={{
                          latitude: coordinates[0].latitude,
                          longitude: coordinates[0].longitude,
                          latitudeDelta: 0.05,
                          longitudeDelta: 0.05,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                      >
                        {coordinates.map((coord, index) => (
                          <Marker
                            key={index}
                            coordinate={coord}
                            title={attractions[index]?.name || attractions[index]}
                          />
                        ))}
                        <Polyline
                          coordinates={coordinates}
                          strokeColor="#007BFF"
                          strokeWidth={3}
                        />
                      </MapView>
                    )}

                    {(attractions || []).length > 0 ? (
                      attractions.map((attr, j) => (
                        <Text key={j} style={styles.attraction}>
                          {typeof attr === 'string' ? attr : attr.name}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.noAttractions}>No attractions listed.</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
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
    letterSpacing: 0.5,
  },
  tripSection: {
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'AvenirNext-Regular',
    letterSpacing: 0.5,
  },
  dayHeader: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 5,
    fontFamily: 'AvenirNext-Regular',
    letterSpacing: 0.5,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'AvenirNext-Regular',
    letterSpacing: 0.5,
  },
  map: {
    width: SCREEN_WIDTH - 60,
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  attraction: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'AvenirNext-Regular',
    letterSpacing: 0.5,
  },
  noAttractions: {
    fontStyle: 'italic',
    color: '#777',
    textAlign: 'center',
    fontFamily: 'AvenirNext-Regular',
    letterSpacing: 0.5,
  },
});

export default PastTrips;
