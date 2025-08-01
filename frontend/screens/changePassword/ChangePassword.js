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

const Change_Password = ({route, navigation}) => {
    const username = route?.params?.username;
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async () => {
    if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match!");
        return;
    }

    try {
        const response = await fetch("http://192.168.1.205:8000/api/change_password/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                new_password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            Alert.alert("Success", "Password changed successfully!");
            navigation.navigate("Login");
        } else {
            Alert.alert("Error", data.detail || "Something went wrong");
        }
    } catch (error) {
        console.error(error);
        Alert.alert("Error", "Network error");
    }
};

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.OTP_TitleBox}>
                <Text style={styles.OTP_Title}>Please Enter New Password</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="Enter Password..."
                    style={styles.input}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
            </View>

            <View style={styles.searchContainer2}>
                <TextInput
                    placeholder="Enter Password Again..."
                    style={styles.input}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
            </View>

            <View style={{paddingHorizontal: 20, marginBottom: 20}}>
                <Button title="Change Password" onPress={handleSubmit}/>
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
        marginTop: 250,
    },
    searchContainer2: {
        paddingHorizontal: 20,
        width: "95%",
        height: "5%",
        marginBottom: 10,
        marginTop: "-50%",
    },
});

export default Change_Password;

