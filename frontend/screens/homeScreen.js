//import React from 'react';
import React, { useState, useEffect } from 'react';

import {View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Button, ImageBackground} from 'react-native';


// const images = [
//   require('/Users/janvi/PycharmProjects/itineraryPlanner/frontend/hawaii.jpg.avif'),
//   require('/Users/janvi/PycharmProjects/itineraryPlanner/frontend/nyc.jpg'),
//   require('/Users/janvi/PycharmProjects/itineraryPlanner/frontend/italy.jpg'),
// ];

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

const TripApp = ({navigation}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000); // 3 seconds per slide

    return () => clearInterval(interval);
  }, []);
    return (
        <SafeAreaView style={styles.container}>

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


            <View style={styles.bottomBigcard}>
                <Text style={styles.message}>Your Trip Awaits You!</Text>
            </View>

            <View style={styles.companyTitleBox}>
                <Text style={styles.companyName}>Triply</Text>
            </View>


            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => navigation.openDrawer()}>
                    <Text style={styles.icon}>≡</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => navigation.navigate('attractionChoice')}>
                    <Text style={styles.icon}>＋</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => navigation.navigate('profileScreen')}>
                    <Text style={styles.icon}>👤</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    cardBackground: {
        width: 185,
        height: 260,
        justifyContent: 'center',
    },

    cardOverlay: {
        backgroundColor: 'rgba(0,0,0,0.3)', // optional for text readability
        padding: 15,
        borderRadius: 10,
    },

    container: {
        flex: 1,
        backgroundColor: '#222',
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
        backgroundColor: '#333',
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
    },
    bottomBigcard: {
        position: 'absolute',
        top: 300,
        alignSelf: 'center',
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 20,
        height: 500,
        width: 390,
        marginTop: 0,
    },
    message: {
        marginTop: 30,
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    companyTitleBox: {
        position: 'absolute',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        marginLeft: 25,
        marginTop: 65,
        marginVertical: 20,
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white', // or any color
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
        color: 'white',
    },
});


export default TripApp;
