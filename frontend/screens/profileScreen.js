import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

const ProfileScreen = ({ navigation, route }) => {
    const { username } = route.params;

    return (
        <SafeAreaView style={styles.container}>

            {/* Top welcome box */}
            <View style={styles.welcomeBox}>
                <Text style={styles.welcome}>Hello {username}!</Text>
            </View>

            {/* Profile picture */}
            <View style={styles.profilePictureCircle}/>

            {/* Logout button */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => navigation.navigate('Login')} // Replace 'Login' with your actual login screen
            >
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            {/* Bottom navigation bar */}
            <View style={styles.bottomNav}>
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

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#dcdcdc',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeBox: {
        marginTop: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcome: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'serif',
    },
    profilePictureCircle: {
        width: "35%",
        height: "18%",
        borderRadius: 100,
        marginTop: 30,
        borderWidth: 3,
        borderColor: "blue",
        backgroundColor: 'white',
    },
    logoutButton: {
        backgroundColor: '#FF5A5F',
        paddingVertical: 12,
        paddingHorizontal: 50,
        borderRadius: 25,
        marginBottom: 20,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingVertical: 15,
        borderTopWidth: 2,
        borderColor: '#555',
        backgroundColor: '#dcdcdc',
    },
    iconContainer: {
        alignItems: 'center',
    },
    icon: {
        fontSize: 24,
        color: 'white',
    },
});

export default ProfileScreen;
