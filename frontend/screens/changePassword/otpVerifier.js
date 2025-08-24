import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Button,
    TextInput,
    Alert,
} from 'react-native';

const OTP_Check = ({ route, navigation }) => {
    const otp = route?.params?.otp;
    const username = route?.params?.username;
    // const [otp, setOtp] = useState('');
    const [userOTP, setUserOTP] = useState('');
    const [email, setEmail] = useState(route.params?.email || ''); // assuming you pass email from the previous screen

    const verifyOtp = async () => {
                if (userOTP === otp){
                    console.log("correct OTP")
                    navigation.navigate("change_Password",{username: username} );
                } else {
                    console.log(userOTP)
                    console.log(otp)
                    Alert.alert("Error", "Invalid OTP.");
                }

    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.OTP_TitleBox}>
                <Text style={styles.OTP_Title}>Email Sent!</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="Enter the OTP pin"
                    style={styles.input}
                    value={userOTP}
                    onChangeText={setUserOTP}
                    keyboardType="numeric"
                />
            </View>

            <View style={{ paddingHorizontal: 20, marginBottom: 280 }}>
                <Button title="Check" onPress={verifyOtp} />
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
    OTP_TitleBox: {
        position: 'absolute',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: "15%",
    },
    OTP_Title: {
        fontSize: 30,
        fontFamily: 'serif',
        fontWeight: 'bold',
        color: 'white',
    },
    input: {
        flex: 1,
        borderColor: "#888",
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 100,
        backgroundColor: "#fff",
    },
    searchContainer: {
        paddingHorizontal: 20,
        width: "95%",
        height: "5%",
        marginBottom: 10,
        marginTop: 300,
    },
});

export default OTP_Check;



