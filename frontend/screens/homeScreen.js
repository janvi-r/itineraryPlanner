//import React from 'react';
import React, { useState, useEffect } from 'react';

import {View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Button, ImageBackground} from 'react-native';


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

const TripApp = ({navigation, route}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { username } = route.params;
  //   const username = route?.params?.username;
  //   console.log('TripApp username:', username);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000); // 3 seconds per slide

    return () => clearInterval(interval);
  }, []);
    return (
        <ImageBackground style={styles.container}>

            {/* Main Content */}
            <View style={styles.mainContent}>
                <View style={styles.cardsContainer}>

                    <View style={styles.card}>
                        <Text style={styles.cardText}>Trips you been on</Text>
                    </View>

                    <ImageBackground
                       source={slides[currentIndex].image}
                        style={styles.cardBackground}
                        imageStyle={{borderRadius: 10}}
                    >
                        <View style={styles.cardOverlay}>
                            <Text style={styles.cardText}>{slides[currentIndex].text}</Text>
                        </View>
                    </ImageBackground>

                </View>
            </View>

<ImageBackground
            source = {require('/Users/janvi/PycharmProjects/itineraryPlanner/frontend/images/sunset.jpg')}
            style={styles.bottomBigcard}
  imageStyle={{ borderRadius: 8 }}
        >
                <Text style={styles.message}>Your Trip Awaits You!</Text>
    </ImageBackground>

            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => navigation.navigate('SidebarNavigator')}
                >


                    <Text style={styles.icon}>🏠</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => navigation.navigate('attractionChoice', {username})}>
                    <Text style={styles.icon}>＋</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => navigation.navigate('profileScreen', {username})}>
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
        backgroundColor: '#dcdcdc',
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
        backgroundColor: 'silver',
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
        fontFamily: 'AvenirNext-Regular', // or add a custom Google Font via Expo
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
        fontFamily: 'AvenirNext-Regular', // or add a custom Google Font via Expo
        letterSpacing: 0.5,
        color: 'midnightblue'
    },
    companyTitleBox: {
        position: 'absolute',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        marginLeft: 25,
        marginTop: 65,
        marginVertical: 20,
        fontFamily: 'AvenirNext-Regular', // or add a custom Google Font via Expo
        letterSpacing: 0.5,
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white', // or any color
        fontFamily: 'AvenirNext-Regular', // or add a custom Google Font via Expo
letterSpacing: 0.5,

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
        color: 'black'
    },
});


export default TripApp;
