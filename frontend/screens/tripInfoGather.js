import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Button } from 'react-native';


const tripDataGathering = () => {
  return (
    <SafeAreaView style={styles.container}>


      {/*bottom nav bar*/}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('Test')}>
          <Text style={styles.icon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('Test')}>
          <Text style={styles.icon}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('attractionChoice')}>
          <Text style={styles.icon}>👤</Text>
        </TouchableOpacity>
      </View>


    {/*  place holder*/}
      <View style={styles.placeholder}>
        <View style={styles.placeholderCardContainer}>
          <View style={styles.placeholderCard}>

            <Text style={styles.textOne}>sdsdds</Text>

            <View style={styles.placeholder}>
              <View style={styles.insideCardContainer}>
                <View style={styles.insiderCard}>
                  <Text>...</Text>
                </View>
              </View>
            </View>

          </View>
        </View>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'space-between',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderCardContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 10,
    marginTop: "-215%",
  },
  placeholderCard: {
    backgroundColor: '#333',
    borderRadius: 15,
    width: "92%",
    height: "126%",
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  placeholderText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: "4%",
    borderTopWidth: 2,
    borderColor: '#555',
    marginTop: "182%",
  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    color: 'white',
  },
  insideCardContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 10,
  },
  insiderCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: "90%",
    height: "90%",
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  textOne: {
    fontSize: 30,
    justifyContent: 'center',
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: 'white',
  },
});

export default tripDataGathering;