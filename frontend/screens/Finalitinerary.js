import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const SCREEN_WIDTH = Dimensions.get('window').width;

const FinalItinerary = ({ route }) => {
  const { itinerary } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Final Itinerary</Text>
      {itinerary.map(({ day, attractions }) => {
        // filter valid lat/lon
        const coordinates = attractions
          .filter(a => a.lat && a.lon)
          .map(a => ({
            latitude: parseFloat(a.lat),
            longitude: parseFloat(a.lon),
          }));

        return (
          <View key={day} style={styles.daySection}>
            <Text style={styles.dayTitle}>Day {day}</Text>

            {/* Small map for each day */}
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
                {/* Markers */}
                {coordinates.map((coord, index) => (
                  <Marker
                    key={index}
                    coordinate={coord}
                    title={attractions[index].name}
                  />
                ))}

                {/* Draw line between attractions */}
                <Polyline
                  coordinates={coordinates}
                  strokeColor="#007BFF"
                  strokeWidth={3}
                />
              </MapView>
            )}

            {/* Attraction list */}
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
    width: SCREEN_WIDTH - 40, // fit nicely in padding
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


// import React from 'react';
// import { View, Text, ScrollView, StyleSheet } from 'react-native';
//
// const FinalItinerary = ({ route }) => {
//   const { itinerary } = route.params;
//
//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Final Itinerary</Text>
//       {itinerary.map(({ day, attractions }) => (
//         <View key={day} style={styles.daySection}>
//           <Text style={styles.dayTitle}>Day {day}</Text>
//           {attractions.length > 0 ? (
//             attractions.map((attr, index) => (
//               <Text key={index} style={styles.attraction}>
//                  {attr.name || attr}
//               </Text>
//             ))
//           ) : (
//             <Text style={styles.noAttractions}>No attractions selected.</Text>
//           )}
//         </View>
//       ))}
//     </ScrollView>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: '#dcdcdc',
//     flex: 1,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     fontFamily: 'AvenirNext-Regular', // or add a custom Google Font via Expo
//     letterSpacing: 0.5,
//   },
//   daySection: {
//     marginBottom: 25,
//   },
//   dayTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 10,
//     textAlign: 'center',
//     fontFamily: 'AvenirNext-Regular',
//     letterSpacing: 0.5,
//   },
//   attraction: {
//     textAlign: 'center',
//     fontSize: 16,
//     marginLeft: 10,
//     marginBottom: 5,
//     fontFamily: 'AvenirNext-Regular',
//     letterSpacing: 0.5,
//   },
//   noAttractions: {
//     fontStyle: 'italic',
//     color: '#777',
//   },
// });
//
// export default FinalItinerary;
