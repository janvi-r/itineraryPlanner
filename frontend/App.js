import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TripApp from './screens/homeScreen';
import HomeScreen from './screens/attractionChoice';
import ProfileScreen from './screens/profileScreen';
import {AboutScreen, ContactScreen} from './screens/sidebar2';
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer navigator with screens inside the drawer
function MyDrawer() {
  return (
    <Drawer.Navigator initialRouteName="TripApp">
      <Drawer.Screen name="TripApp" component={TripApp} options={{ title: 'Home' }} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen name="Contact" component={ContactScreen} />
    </Drawer.Navigator>
  );
}
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Drawer">
        <Stack.Screen
          name="Drawer"
          component={MyDrawer}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="attractionChoice" component={HomeScreen} />
        <Stack.Screen name="profileScreen" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


// import React, { useRef, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   PanResponder,
//   Dimensions,
//   TouchableOpacity,
//   Image,
//   TextInput,
//   ScrollView,
// } from 'react-native';
//
// const SCREEN_WIDTH = Dimensions.get('window').width;
// const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
// const myList = [];
//
//
// const SwipeCard = ({ data, onSwipeRight, onSwipeLeft }) => {
//   const position = useRef(new Animated.ValueXY()).current;
//
//   const rotate = position.x.interpolate({
//     inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
//     outputRange: ['-8deg', '0deg', '8deg'],
//     extrapolate: 'clamp',
//   });
//
//   const cardStyle = {
//     transform: [...position.getTranslateTransform(), { rotate }],
//   };
//
//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: () => true,
//       onPanResponderGrant: () => {
//         position.setOffset({
//           x: position.x._value,
//           y: position.y._value,
//         });
//         position.setValue({ x: 0, y: 0 });
//       },
//       onPanResponderMove: Animated.event(
//         [null, { dx: position.x, dy: position.y }],
//         { useNativeDriver: false }
//       ),
//       onPanResponderRelease: () => {
//         position.flattenOffset();
//         if (position.x._value > SWIPE_THRESHOLD) {
//           forceSwipe('right');
//         } else if (position.x._value < -SWIPE_THRESHOLD) {
//           forceSwipe('left');
//         } else {
//           resetPosition();
//         }
//       },
//     })
//   ).current;
//
//   const forceSwipe = (direction) => {
//     const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
//     Animated.timing(position, {
//       toValue: { x, y: 0 },
//       duration: 200,
//       useNativeDriver: false,
//     }).start(() => {
//       if (direction === 'right') {
//         onSwipeRight(data);
//       } else {
//         onSwipeLeft(data);
//       }
//     });
//   };
//
//   const resetPosition = () => {
//     Animated.spring(position, {
//       toValue: { x: 0, y: 0 },
//       useNativeDriver: false,
//     }).start();
//   };
//
//   return (
//     <Animated.View style={[styles.card, cardStyle]} {...panResponder.panHandlers}>
//       {data.image && (
//         <Image
//           source={{ uri: data.image }}
//           style={styles.image}
//           resizeMode="cover"
//         />
//       )}      <Text style={styles.text}>{data.name}</Text>
//     </Animated.View>
//   );
// };
//
// export default function App() {
//   const [city, setCity] = useState('');
//   const [attractions, setAttractions] = useState([]);
//   const [cards, setCards] = useState([]);
//
//   const fetchAttractions = async () => {
//     try {
//       const response = await fetch(`http://192.168.1.205:8000/attractions?city=${city}`);
//       const data = await response.json();
//       setAttractions(data);
//       setCards(data); // load into cards
//     } catch (e) {
//       console.error('❌ Error fetching attractions:', e);
//     }
//   };
//
//   const handleSwipeRight = (item) => {
//     //alert(`✅ Liked: ${item.name}`);
//     myList.push(item.name);
//     removeTopCard();
//   };
//
//   const handleSwipeLeft = (item) => {
//     //alert(`⏩ Skipped: ${item.name}`);
//     removeTopCard();
//   };
//
//   const removeTopCard = () => {
//     setCards((prev) => prev.slice(1));
//   };
//
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Attraction Explorer</Text>
//       <View style={styles.searchContainer}>
//         <TextInput
//           placeholder="Enter a city..."
//           style={styles.input}
//           value={city}
//           onChangeText={setCity}
//         />
//         <TouchableOpacity onPress={fetchAttractions} style={styles.button}>
//           <Text style={styles.buttonText}>Search</Text>
//         </TouchableOpacity>
//       </View>
//
//       <View style={styles.cardContainer}>
//         {cards
//           .map((item, index) => {
//             if (index === 0) {
//               return (
//                 <SwipeCard
//                   key={item.id}
//                   data={item}
//                   onSwipeRight={handleSwipeRight}
//                   onSwipeLeft={handleSwipeLeft}
//                 />
//               );
//             } else {
//               return null;
//             }
//           })
//           .reverse()}
//       </View>
//     </View>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 60,
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '600',
//     marginBottom: 20,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     paddingHorizontal: 20,
//     marginBottom: 20,
//   },
//   input: {
//     flex: 1,
//     borderColor: '#888',
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     marginRight: 10,
//     height: 40,
//     backgroundColor: '#fff',
//   },
//   button: {
//     backgroundColor: '#007BFF',
//     borderRadius: 8,
//     paddingHorizontal: 14,
//     justifyContent: 'center',
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: '600',
//   },
//   cardContainer: {
//   flex: 1,
//   width: SCREEN_WIDTH,
//   alignItems: 'center',
//   justifyContent: 'center',
//   position: 'relative', // needed to center absolute children
// },
//
//   card: {
//   position: 'absolute',
//   width: SCREEN_WIDTH * 0.9,
//   height: 450,
//   backgroundColor: 'white',
//   borderRadius: 10,
//   alignItems: 'center',
//   justifyContent: 'flex-start',
//   elevation: 6,
//   shadowColor: '#000',
//   shadowOpacity: 0.2,
//   shadowRadius: 5,
//   shadowOffset: { width: 0, height: 2 },
//   overflow: 'hidden',
// },
//
//   image: {
//     width: '100%',
//     height: 300,
//   },
//   text: {
//     fontSize: 24,
//     marginTop: 15,
//     fontWeight: '500',
//   },
// });
//
//  // import React, { useState } from 'react';
// // // import { View, Text, TextInput, Button, FlatList, Image, StyleSheet, ScrollView } from 'react-native';
// // //
// // // export default function App() {
// // //   const [city, setCity] = useState('');
// // //   const [attractions, setAttractions] = useState([]);
// // //
// // //   const fetchAttractions = async () => {
// // //     try {
// // //       const response = await fetch(`http://192.168.1.205:8000/attractions?city=${city}`);
// // //
// // //       const data = await response.json();
// // //       setAttractions(data);
// // //     } catch (e) {
// // //       console.error('❌ Error fetching attractions:', e);
// // //     }
// // //   };
// // //
// // //   return (
// // //     <ScrollView contentContainerStyle={styles.container}>
// // //       <Text style={styles.header}>Tourist Attractions</Text>
// // //       <TextInput
// // //         placeholder="Enter a city"
// // //         value={city}
// // //         onChangeText={setCity}
// // //         style={styles.input}
// // //       />
// // //       <Button title="Search" onPress={fetchAttractions} />
// // //       <FlatList
// // //         data={attractions}
// // //         keyExtractor={(item) => item.name}
// // //         renderItem={({ item }) => (
// // //           <View style={styles.item}>
// // //             <Text style={styles.name}>{item.name}</Text>
// // //             {item.image !== 'N/A' && (
// // //               <Image source={{ uri: item.image }} style={styles.image} />
// // //             )}
// // //             <Text style={styles.link}>{item.url}</Text>
// // //           </View>
// // //         )}
// // //       />
// // //     </ScrollView>
// // //   );
// // // }
// // //
// // // const styles = StyleSheet.create({
// // //   container: { padding: 20 },
// // //   header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
// // //   input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
// // //   item: { marginBottom: 20 },
// // //   name: { fontWeight: 'bold', fontSize: 16 },
// // //   image: { width: '100%', height: 150, marginTop: 10, borderRadius: 10 },
// // //   link: { marginTop: 5, color: 'blue' },
// // // });
// //
// //
// //
// //
// //
// // // --------------
// //
// //
// // import React, { useRef } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   Animated,
// //   PanResponder,
// //   Dimensions,
// //   TouchableOpacity,
// // } from 'react-native';
// //
// // const SCREEN_WIDTH = Dimensions.get('window').width;
// //
// // const DATA = [
// //   { id: '2', text: 'User 2'},
// //   { id: '3', text: 'User 3'}
// //   // Add more sample users
// // ];
// //
// // const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
// //
// // const SwipeCard = ({ data, onSwipeRight, onSwipeLeft }) => {
// //   const position = useRef(new Animated.ValueXY()).current;
// //
// //   const rotate = position.x.interpolate({
// //     inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
// //     outputRange: ['-8deg', '0deg', '8deg'],
// //     extrapolate: 'clamp',
// //   });
// //
// //   const cardStyle = {
// //     transform: [
// //       ...position.getTranslateTransform(),
// //       { rotate },
// //     ],
// //   };
// //
// //   const panResponder = useRef(
// //     PanResponder.create({
// //       onMoveShouldSetPanResponder: () => true,
// //       onPanResponderGrant: () => {
// //         position.setOffset({
// //           x: position.x._value,
// //           y: position.y._value,
// //         });
// //         position.setValue({ x: 0, y: 0 });
// //       },
// //       onPanResponderMove: Animated.event(
// //         [null, { dx: position.x, dy: position.y }],
// //         { useNativeDriver: false }
// //       ),
// //       onPanResponderRelease: () => {
// //         position.flattenOffset();
// //         if (position.x._value > SWIPE_THRESHOLD) {
// //           forceSwipe('right');
// //         } else if (position.x._value < -SWIPE_THRESHOLD) {
// //           forceSwipe('left');
// //         } else {
// //           resetPosition();
// //         }
// //       },
// //     })
// //   ).current;
// //
// //   const forceSwipe = (direction) => {
// //     const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
// //     Animated.timing(position, {
// //       toValue: { x, y: 0 },
// //       duration: 200,
// //       useNativeDriver: false,
// //     }).start(() => {
// //       if (direction === 'right') {
// //         onSwipeRight(data);
// //       } else {
// //         onSwipeLeft(data);
// //       }
// //     });
// //   };
// //
// //   const resetPosition = () => {
// //     Animated.spring(position, {
// //       toValue: { x: 0, y: 0 },
// //       useNativeDriver: false,
// //     }).start();
// //   };
// //
// //   return (
// //     <Animated.View
// //       style={[styles.card, cardStyle]}
// //       {...panResponder.panHandlers}
// //     >
// //       <Text style={styles.text}>{data.text}</Text>
// //     </Animated.View>
// //   );
// // };
// //
// // const App = () => {
// //   const [cards, setCards] = React.useState(DATA);
// //
// //   const handleSwipeRight = (item) => {
// //     alert(`Liked: ${item.text}`);
// //     removeTopCard();
// //   };
// //
// //   const handleSwipeLeft = (item) => {
// //     alert(`Skipped: ${item.text}`);
// //     removeTopCard();
// //   };
// //
// //   const removeTopCard = () => {
// //     setCards((prev) => prev.slice(1));
// //   };
// //
// //   return (
// //     <View style={styles.container}>
// //       {cards
// //         .map((item, index) => {
// //           if (index === 0) {
// //             return (
// //               <SwipeCard
// //                 key={item.id}
// //                 data={item}
// //                 onSwipeRight={handleSwipeRight}
// //                 onSwipeLeft={handleSwipeLeft}
// //               />
// //             );
// //           } else {
// //             return null; // Only render the top card for now
// //           }
// //         })
// //         .reverse()}
// //     </View>
// //   );
// // };
// //
// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#f0f0f0',
// //   },
// //   card: {
// //     position: 'absolute',
// //     width: SCREEN_WIDTH * 0.9,
// //     height: 400,
// //     backgroundColor: 'white',
// //     borderRadius: 10,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     elevation: 5,
// //   },
// //   text: {
// //     fontSize: 24,
// //   },
// // });
// //
// // export default App;
