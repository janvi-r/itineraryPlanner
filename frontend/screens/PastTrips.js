import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const SCREEN_WIDTH = Dimensions.get('window').width;

const PastTrips = ({ route }) => {
  const { username } = route.params;
  const [trips, setTrips] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Username in PastTrips:", username);
fetch(`http://192.168.1.205:8000/api/past_trips/${encodeURIComponent(username)}/`)
      .then(res => res.json())
      .then(data => {
        console.log("Fetched past trips:", data);
        setTrips(data.trips || []); // Adjust this based on your API response shape
      })
      .catch(err => {
        console.error("Failed to load trips:", err);
        setTrips([]); // show empty on error
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading past trips...</Text>
      </View>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No past trips found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Past Trips</Text>
      {trips.map((trip, idx) => (
        <View key={idx} style={styles.tripSection}>
          <Text style={styles.tripTitle}>Trip {idx + 1}</Text>

          {trip.map(({ day, attractions }) => {
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
                    scrollEnabled={false}
                    zoomEnabled={false}
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
                  <Text style={styles.noAttractions}>No attractions selected.</Text>
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
  },
  tripSection: {
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  tripTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  daySection: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
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
  },
  noAttractions: {
    fontStyle: 'italic',
    color: '#777',
    textAlign: 'center',
  },
});

export default PastTrips;



// import React, { useEffect, useState } from "react";
// import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
//
// const PastTrips = ({ navigation, route }) => {
//   const { username } = route.params;
//   console.log("Username in PastTrips:", username);
//
//   const [trips, setTrips] = useState([]);
//
//   useEffect(() => {
//   fetch(`http://192.168.1.205:8000/api/past_trips/${encodeURIComponent(username)}/`)
//       .then(res => res.json())
//       .then(data => setTrips(data))
//       .catch(err => console.error("Failed to load trips:", err));
//   }, [username]);
//
//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Past Trips</Text>
//       {trips.length === 0 && <Text>No past trips found.</Text>}
//       {trips.map(trip => (
//         <TouchableOpacity
//           key={trip.id}
//           style={styles.tripCard}
//           onPress={() =>
//             navigation.navigate("FinalItinerary", { itinerary: trip.itinerary })
//           }
//         >
//           <Text style={styles.cityName}>{trip.city}</Text>
//           <Text style={styles.info}>
//             {trip.itinerary.length} day{trip.itinerary.length > 1 ? "s" : ""}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </ScrollView>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#f5f5f5", flex: 1 },
//   title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
//   tripCard: {
//     padding: 15,
//     backgroundColor: "white",
//     marginBottom: 15,
//     borderRadius: 8,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cityName: { fontSize: 20, fontWeight: "600" },
//   info: { fontSize: 14, color: "#555", marginTop: 5 },
// });
//
// export default PastTrips;
