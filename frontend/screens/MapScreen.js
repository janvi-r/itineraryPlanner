import React, {useEffect, useState} from 'react';
import MapView, {Callout, Marker} from 'react-native-maps';
import {View, StyleSheet, Dimensions, Button, Text, Image} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const MapScreen = ({navigation, route}) => {
    const { username } = route.params;
    const {cityName, selectedAttractions, days } = route?.params || {};
    const [city, setCity] = useState(null);
    const [attractions, setAttractions] = useState([]);
    const [removedMarkers, setRemovedMarkers] = useState([]); // Track removed marker
    const [pressedAttractions, setPressedAttractions] = useState([]);
    const [attractionDays, setAttractionDays] = useState([]);
    const [currentDay, setCurrentDay] = useState(1);

    useEffect(() => {
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

    if (!city) return null;

    const handleMarkerPress = (a) => {
        setAttractions(prev => prev.filter(item => item !== a));
        setPressedAttractions(prev => [...prev, a]);
    };

    const undo = () => {
        if (pressedAttractions.length > 0) {
            const lastRemoved = pressedAttractions[pressedAttractions.length - 1];

            setPressedAttractions(prev => prev.slice(0, -1)); // remove last
            setAttractions(prev => [...prev, lastRemoved]);   // add back to map
        }
    };


    const handleDone = () => {
        setAttractionDays(prev => [
            ...prev,
            {day: currentDay, attractions: pressedAttractions}
        ]);
        const newAttractionDays = [
            ...attractionDays,
                    {day: currentDay, attractions: pressedAttractions }
          ];
        setPressedAttractions([]);
        attractions.filter(a => a.lat && a.lon)

        if (currentDay < days) {
            setCurrentDay(prev => prev + 1);
        } else {
            console.log(
      'Trip complete:',
      JSON.stringify(newAttractionDays, null, 2)
    );
            // navigation.navigate('FinalItinerary', { itinerary: newAttractionDays });
            const finalItinerary = [...attractionDays, { day: currentDay, attractions: pressedAttractions }];

fetch('http://192.168.1.205:8000/api/save_daywise_trip/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: username,
    city: cityName,
    itinerary: finalItinerary
  }),
})
  .then(res => {
    if (!res.ok) throw new Error("Failed to save itinerary");
    return res.json();
  })
  .then(data => {
    console.log('Successfully saved day-wise trip:', data);
    navigation.navigate('FinalItinerary', { itinerary: finalItinerary });
  })
  .catch(err => {
    console.error('Error saving trip:', err);
    // Still navigate to itinerary screen, optionally show error to user
    navigation.navigate('FinalItinerary', { itinerary: finalItinerary });
  });

        }
    };

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
                    coordinate={{latitude: parseFloat(city.lat), longitude: parseFloat(city.lon)}}
                    title={city.name}
                    description="City Center"
                />

                {/* Attraction Markers */}
                {attractions.filter(a => a.lat && a.lon)
                    .map((a, index) => {
                        return (
                            <Marker
                                key={index}
                                coordinate={{latitude: parseFloat(a.lat), longitude: parseFloat(a.lon)}}
                                title={a.name}

                                onPress={() => handleMarkerPress(a)}
                            >

                                <Callout>
                                    <View style={styles.calloutContainer}>
                                        <Text style={styles.calloutTitle}>{a.name}</Text>
                                        {a.image_urls?.length > 0 && a.image_urls[0] !== 'N/A' ? (
                                            <Image
                                                source={{uri: a.image_urls[0]}}
                                                style={{width: 30, height: 30}}
                                            />
                                        ) : (
                                            <Text>No Image</Text>
                                        )}
                                    </View>
                                </Callout>

                            </Marker>
                        );
                    })}

            </MapView>
            <Text>Currently selecting for Day {currentDay} of {days}</Text>
            <View style={styles.buttonsRow}>

                <View style={styles.buttonContainer}>
                    <Button title="Undo" onPress={undo}/>
                </View>
                <View style={styles.buttonContainer}>
                    <Button title="Done Day" onPress={handleDone}/>
                </View>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        width: SCREEN_WIDTH,
        flex: 1,
    },
    buttonContainer: {
        flex: 1.5,
        padding: 10,
        backgroundColor: 'white',  // so it’s visible
    },
    buttonsRow: {
        flexDirection: 'row', // optional, to add space between buttons
        marginTop: 20,
    },
    image: {
        width: 400,     // or '100%' depending on container
        height: 400,    // must have height too
        resizeMode: 'cover',
    },
    calloutContainer: {
        width: 200,
        alignItems: 'center',
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    calloutImage: {
        width: 180,
        height: 120,
        resizeMode: 'cover',
    }


});
export default MapScreen;
// // import React, { useEffect, useState } from 'react';
// // import { View, StyleSheet, Dimensions } from 'react-native';
// // import MapView, { Marker } from 'react-native-maps';
// //
// // const SCREEN_WIDTH = Dimensions.get('window').width;
// //
// // const MapScreen = ({ route }) => {
// //   const { cityName, selectedAttractions } = route.params;
// //   const [city, setCity] = useState(null);
// //   const [attractions, setAttractions] = useState([]);
// //
// //
// //     useEffect(() => {
// //   const username = 'janvi';
// //   fetch(`http://192.168.1.205:8000/api/saved_trip_attractions/${encodeURIComponent(cityName)}/${encodeURIComponent(username)}/`)
// //     .then(res => {
// //       console.log('Fetch response status:', res.status);
// //       return res.json();
// //     })
// //     .then(data => {
// //       console.log('Fetched data:', data);
// //       setCity(data.city);
// //       setAttractions(data.attractions);
// //     })
// //     .catch(error => {
// //       console.error("Map fetch error:", error);
// //     });
// // }, [cityName]);
// //
// // // In render, before return
// // console.log('Current city state:', city);
// // console.log('Current attractions state:', attractions);
// //
// //   if (!city) return null;
// //
// //   return (
// //     <View style={styles.container}>
// //       <MapView
// //         style={styles.map}
// //         initialRegion={{
// //           latitude: parseFloat(city.lat),
// //           longitude: parseFloat(city.lon),
// //           latitudeDelta: 0.05,
// //           longitudeDelta: 0.05,
// //         }}
// //       >
// //         {/* Center Marker */}
// //         <Marker
// //           coordinate={{ latitude: parseFloat(city.lat), longitude: parseFloat(city.lon) }}
// //           title={city.name}
// //           description="City Center"
// //         />
// //
// //         {/* Attraction Markers */}
// //         {/* Attraction Markers */}
// // {attractions
// //   .filter(a => a.lat && a.lon)  // only attractions with valid lat and lon
// //   .map((a, index) => (
// //     <Marker
// //       key={index}
// //       coordinate={{ latitude: parseFloat(a.lat), longitude: parseFloat(a.lon) }}
// //       title={a.name}
// //       description={a.url}
// //     />
// //   ))
// // }
// //
// //       </MapView>
// //     </View>
// //   );
// // };
// //
// // //TODO - try with fake numbers. Potential Issue: Our lat and lon have N,E,S, W so make it into one number value with +/-
// //
// //
// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1
// //   },
// //   map: {
// //     width: SCREEN_WIDTH,
// //     height: '100%',
// //   },
// // });
// //
// // export default MapScreen;

// import React, {useEffect, useState} from 'react';
// import MapView, {Marker} from 'react-native-maps';
// import {View, StyleSheet, Dimensions, Button, Text} from 'react-native';
//
//
// const SCREEN_WIDTH = Dimensions.get('window').width;
//
// const MapScreen = ({route}) => {
//     const {cityName, selectedAttractions} = route.params;
//     const [city, setCity] = useState(null);
//     const [attractions, setAttractions] = useState([]);
//     const [removedMarkers, setRemovedMarkers] = useState([]); // Track removed marker
//     const [pressedAttractions, setPressedAttractions] = useState([]);
//     const [attractionDays, setAttractionDays] = useState([]);
//     const [currentDay, setCurrentDay] = useState(1);
//     const validImages = data.images ? data.images.filter(url => url && url !== 'N/A') : [];
//     const [currentImageIndex, setCurrentImageIndex] = useState(0);
//     //
//     //
//     // for (let i = 1; i < 3; i++) { //rn iots a number but later we change to  user input for days of trip
//     //     attractionDays.push({day: i, attractions: [pressedAttractions]});
//     //     console.log(attractionDays);
//     // }
//
//
//     useEffect(() => {
//         const username = 'janvi';
//         fetch(`http://192.168.1.205:8000/api/saved_trip_attractions/${encodeURIComponent(cityName)}/${encodeURIComponent(username)}/`)
//             .then(res => {
//                 console.log('Fetch response status:', res.status);
//                 return res.json();
//             })
//             .then(data => {
//                 console.log('Fetched data:', data);
//                 setCity(data.city);
//                 setAttractions(data.attractions);
//             })
//             .catch(error => {
//                 console.error("Map fetch error:", error);
//             });
//     }, [cityName]);
//
//     if (!city) return null;
//
//     // const handleMarkerPress = (a) => {
//     //     // Remove the marker from attractions to hide it from the map
//     //     setAttractions(prev => prev.filter(item => item !== a));
//     //     setPressedAttractions(prev => [...prev, a]);
//     // };
//     const handleMarkerPress = (a) => {
//         setAttractions(prev => prev.filter(item => item !== a));
//         setPressedAttractions(prev => [...prev, a]);
//     };
//
//     const undo = () => {
//         if (pressedAttractions.length > 0) {
//             const lastRemoved = pressedAttractions[pressedAttractions.length - 1];
//
//             setPressedAttractions(prev => prev.slice(0, -1)); // remove last
//             setAttractions(prev => [...prev, lastRemoved]);   // add back to map
//         }
//     };
//
//
//     const handleDone = () => {
//         setAttractionDays(prev => [
//             ...prev,
//             {day: currentDay, attractions: pressedAttractions}
//         ]);
//
//         setPressedAttractions([]);
//
//         if (currentDay < 3) {
//             setCurrentDay(prev => prev + 1);
//         } else {
//             console.log('Trip complete:', JSON.stringify([...attractionDays, {
//                 day: currentDay,
//                 attractions: pressedAttractions
//             }], null, 2));
//         }
//     };
//
//
//     return (
//         <View style={styles.container}>
//             <MapView
//                 style={styles.map}
//                 initialRegion={{
//                     latitude: parseFloat(city.lat),
//                     longitude: parseFloat(city.lon),
//                     latitudeDelta: 0.05,
//                     longitudeDelta: 0.05,
//                 }}
//             >
//                 {/* Center Marker */}
//                 <Marker
//                     coordinate={{latitude: parseFloat(city.lat), longitude: parseFloat(city.lon)}}
//                     title={city.name}
//                     description="City Center"
//                 />
//
//                 {/* Attraction Markers */}
//                 {attractions
//                     .filter(a => a.lat && a.lon)
//                     .map((a, index) => (
//                         <Marker
//                             key={index}
//                             coordinate={{ latitude: parseFloat(a.lat), longitude: parseFloat(a.lon) }}
//                             title={a.name}
//                          onPress={() => handleMarkerPress(a)}
//                         >
//                           <View>
//                             <Image
//                               source={{ uri: a.image }} // use image per attraction
//                               style={styles.markerImage} // use better marker size
//                             />
//                           </View>
//                         </Marker>
//                             // description={a.url}
//                             onPress={() => handleMarkerPress(a)} // Remove marker when pressed
//
//                     ))}
//             </MapView>
//             <Text>Currently selecting for Day {currentDay} of {3}</Text>
//             <View style={styles.buttonsRow}>
//
//                 <View style={styles.buttonContainer}>
//                     <Button title="Undo" onPress={undo}/>
//                 </View>
//                 <View style={styles.buttonContainer}>
//                     <Button title="Done Day" onPress={handleDone}/>
//                 </View>
//             </View>
//         </View>
//     );
// };
//
//
// const styles = StyleSheet.create({
//     container: {
//         flex: 1
//     },
//     map: {
//         width: SCREEN_WIDTH,
//         //height: '100%',
//         flex: 1,
//     },
//     buttonContainer: {
//         flex: 1.5,
//         padding: 10,
//         backgroundColor: 'white',  // so it’s visible
//     },
//     buttonsRow: {
//         flexDirection: 'row', // optional, to add space between buttons
//         marginTop: 20,
//     }
//     image: {
//         width: 400,     // or '100%' depending on container
//         height: 400,    // must have height too
//         resizeMode: 'cover',
//   },
// });
// export default MapScreen;
// import React, { useEffect, useState } from 'react';
// import { View, StyleSheet, Dimensions } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
//
// const SCREEN_WIDTH = Dimensions.get('window').width;
//
// const MapScreen = ({ route }) => {
//   const { cityName, selectedAttractions } = route.params;
//   const [city, setCity] = useState(null);
//   const [attractions, setAttractions] = useState([]);
//
//
//     useEffect(() => {
//   const username = 'janvi';
//   fetch(`http://192.168.1.205:8000/api/saved_trip_attractions/${encodeURIComponent(cityName)}/${encodeURIComponent(username)}/`)
//     .then(res => {
//       console.log('Fetch response status:', res.status);
//       return res.json();
//     })
//     .then(data => {
//       console.log('Fetched data:', data);
//       setCity(data.city);
//       setAttractions(data.attractions);
//     })
//     .catch(error => {
//       console.error("Map fetch error:", error);
//     });
// }, [cityName]);
//
// // In render, before return
// console.log('Current city state:', city);
// console.log('Current attractions state:', attractions);
//
//   if (!city) return null;
//
//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         initialRegion={{
//           latitude: parseFloat(city.lat),
//           longitude: parseFloat(city.lon),
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//       >
//         {/* Center Marker */}
//         <Marker
//           coordinate={{ latitude: parseFloat(city.lat), longitude: parseFloat(city.lon) }}
//           title={city.name}
//           description="City Center"
//         />
//
//         {/* Attraction Markers */}
//         {/* Attraction Markers */}
// {attractions
//   .filter(a => a.lat && a.lon)  // only attractions with valid lat and lon
//   .map((a, index) => (
//     <Marker
//       key={index}
//       coordinate={{ latitude: parseFloat(a.lat), longitude: parseFloat(a.lon) }}
//       title={a.name}
//       description={a.url}
//     />
//   ))
// }
//
//       </MapView>
//     </View>
//   );
// };
//
// //TODO - try with fake numbers. Potential Issue: Our lat and lon have N,E,S, W so make it into one number value with +/-
//
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1
//   },
//   map: {
//     width: SCREEN_WIDTH,
//     height: '100%',
//   },
// });
//
// export default MapScreen;