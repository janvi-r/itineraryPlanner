import React, {useState} from 'react';
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

const SentOTP = ({navigation}) => {
    const [username, setUsername] = useState('');

    const [email, setEmail] = useState(null);

    const getEmailByUsername = async (username) => {
        try {
            const response = await fetch(`http://192.168.68.79:8000/api/get-email/?username=${username}`);
            const data = await response.json();

            if (response.ok) {
                console.log("User email:", data.email);
                setEmail(data.email);
            } else {
                Alert.alert("Error", data.error || "Something went wrong");
                setEmail(null);
            }
        } catch (error) {
            Alert.alert("Network Error", error.message);
            setEmail(null);
        }
    };

    const sendOTP = async (username) => {
        try {
            const response = await fetch("http://192.168.1.205:8000/api/send_otp/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username}),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("OTP Sent", "Check your email for the OTP.");
                // remove agtetr
                console.log("OTP (testing only):", data.otp);  // ✅ Only for dev
                navigation.navigate("OTP Verifier", {otp: data.otp, username}); // your next screen

            } else {
                Alert.alert("Error", data.detail || "OTP send failed.");
            }
        } catch (error) {
            Alert.alert("Network Error", error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.OTP_TitleBox}>
                <Text style={styles.OTP_Title}>Enter Your Username</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="Enter Username..."
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                />
            </View>

            <View style={{paddingHorizontal: 20, marginBottom: 20}}>
                <Button title="Send Email" onPress={() => sendOTP(username)}/>
            </View>

            {email && (
                <View style={{paddingHorizontal: 20}}>
                    <Text style={{fontSize: 16, color: 'black'}}>
                        Email: {email}
                    </Text>
                </View>
            )}

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
        marginTop: "30%",
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
        marginBottom: 40,
        marginTop: 300,
    },
});

export default SentOTP;


