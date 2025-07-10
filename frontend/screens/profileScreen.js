import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Button} from 'react-native';


const ProfileScreen = () => {
    return (
        <SafeAreaView style={styles.container}>

            {/*top welcome box*/}
            <View style={styles.welcomeBox}>
                <Text style={styles.welcome}>Hello 'Name'</Text>
            </View>

            {/*profile picture face box*/}
            <View style={styles.profilePictureCircle}/>

            {/*chnge pp pic placeholder*/}
            <View style={styles.changeImgBox}>
                <Text style={styles.changeImg}>Change Profile Picture</Text>
            </View>

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

            {/*Still gotta make the home button on the top left so that if clicked it takes user back to homeScreen*/}


            {/*  place holder*/}
            <View style={styles.placeholder}>
                <View style={styles.placeholderCardContainer}>
                    <View style={styles.placeholderCard}>
                        <Text style={styles.placeholderText}>IDK what to put here</Text>
                    </View>
                </View>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#dcdcdc',
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
        marginTop: "-145%",
    },
    placeholderCard: {
        backgroundColor: 'silver',
        borderRadius: 8,
        width: "92%",
        height: "110%",
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
    changeImgBox: {
        position: 'absolute',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: "75%",
    },
    changeImg: {
        fontSize: 15,
        justifyContent: 'center',
        color: 'white', // or any color
    },
    welcomeBox: {
        position: 'absolute',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: "15%",
    },
    welcome: {
        fontSize: 30,
        justifyContent: 'center',
        fontFamily: 'serif',
        fontWeight: 'bold',
        color: 'white', // or any color
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: "4%",
        borderTopWidth: 2,
        borderColor: '#555',
        marginTop: "110%",
    },
    iconContainer: {
        alignItems: 'center',
    },
    icon: {
        fontSize: 24,
        color: 'white',
    },
    profilePictureCircle: {
        width: "35%",
        height: "18%",
        borderRadius: 100,
        marginTop: "30%",
        alignSelf: 'center',
        borderWidth: 3,
        borderColor: "blue",
        backgroundColor: 'white',
    },
});

export default ProfileScreen;