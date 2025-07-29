import {
    StyleSheet,
    TextInput,
    View,
    ScrollView,
    Button,
    Alert,
    TouchableOpacity,
    Text,
    Modal,
    FlatList,
    ImageBackground
} from "react-native";
import React, {useState} from "react";

//import AsyncStorage from '@react-native-async-storage/async-storage';


const Login = ({navigation}) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");


    const handleLoginSubmit = async () => {
        if (!username || !password) {
            Alert.alert("Error", "Please enter both username and password");
            return;
        }

        try {
            const response = await fetch("http://192.168.1.205:8000/api/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Example: data might contain token if using token auth
                Alert.alert("Success", "Logged in successfully!");
                console.log("Token:", data.token);
                //await AsyncStorage.setItem('userToken', data.token);


                // Note to self: We left for now - do not know if we also need to get rid of the token when we logout - fix at end
                // rn the log in is not persistent meaning if we reload the app the user will have to log in again - to fix this we have to store the token in our memory whihc we do not do. asyncStorage is great if we can get it to work. also vice versa for logout, we have to get ride of the token from memory.


                navigation.reset({
                    index: 0,
                    routes: [{name: 'Drawer', params: {username: username}}],
                });

            } else {
                // Login failed
                Alert.alert("Login Failed", "Invalid username or password");
            }
        } catch (error) {
            Alert.alert("Network Error", error.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.inputContainer}>
            <ImageBackground
                source={require('/Users/janvi/PycharmProjects/itineraryPlanner/frontend/images/sunset.jpg')}
                style={styles.background}>
                <View style={styles.inputGroup}>
                    <View style={styles.searchContainer}>
                        <TextInput placeholder="Enter Username..." style={styles.input} value={username}
                                   onChangeText={setUsername}/>
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
                    <View style={styles.buttonContainer}>
                        {/*<Button title="Login" onPress={() => navigation.navigate('Drawer', {username: username})}/>*/}
                        <Button title="Login" onPress={handleLoginSubmit}/>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title="Create Account Instead?" onPress={() => navigation.navigate('createAccount')}/>
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('placeholder')}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                </View>

            </ImageBackground>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexGrow: 1,
        paddingVertical: 20,
        backgroundColor: "white",
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    input: {
        flex: 1,
        borderColor: "#888",
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 50,
        backgroundColor: "#fff",
    },
    buttonContainer: {
        paddingHorizontal: 40,
        marginTop: 20,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 50,
    },
    inputBox: {
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input1: {
        width: 150,
        height: 40,
        borderColor: 'white',
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        width: 250,
        borderRadius: 8,
        padding: 10,
        maxHeight: 300,
    },
    option: {
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    optionText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'blue',
        fontSize: 16,
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
    inputGroup: {
        marginTop: 350,  // pushes entire input block down
    },
    forgotPasswordText: {
        color: 'blue',
        marginTop: 10,
        textAlign: 'center',
        textDecorationLine: 'underline',
        fontSize: 16,
    },
});

export default Login;
