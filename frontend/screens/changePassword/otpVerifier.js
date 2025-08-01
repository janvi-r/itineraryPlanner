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
        // try {
        //     const response = await fetch("http://192.168.1.205:5000/api/verify-otp", {
        //
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify({
        //             email: email,
        //             otp: otp,
        //         }),
        //     });
        //
        //     const data = await response.json();

            // if (data.verified) {
                // Alert.alert("Success", "OTP Verified!");
                if (userOTP === otp){
                    console.log("correct OTP")
                    navigation.navigate("change_Password",{username: username} );
                } else {
                    console.log(userOTP)
                    console.log(otp)
                    Alert.alert("Error", "Invalid OTP.");
                }

            //  else {
            //     Alert.alert("Error", "Failed to Send OTP. Please Try Again");
            //     navigation.navigate("Login");
            //
            // }
        // } catch (error) {
        //     console.error("OTP verification failed:", error);
        //     Alert.alert("Error", "Something went wrong. Try again.");
        // }
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

            {/*{email && (*/}
            {/*    <View style={{ paddingHorizontal: 20 }}>*/}
            {/*        <Text style={{ fontSize: 16, color: 'black' }}>*/}
            {/*            Email: {email}*/}
            {/*        </Text>*/}
            {/*    </View>*/}
            {/*)}*/}
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




// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     SafeAreaView,
//     Button,
//     TextInput,
//     Alert,
// } from 'react-native';
//
// const OTP_Check = () => {
//     const [user_OTP, setUserOTP] = useState(false);
//     return (
//         <SafeAreaView style={styles.container}>
//
//             <View style={styles.OTP_TitleBox}>
//                 <Text style={styles.OTP_Title}>Email Sent!</Text>
//             </View>
//
//             <View style={styles.searchContainer}>
//                 <TextInput
//                     placeholder="Enter the OTP pin"
//                     style={styles.input}
//                     value={username}
//                     onChangeText={setUsername}
//                 />
//             </View>
//
//             <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
//                 {/*if it is correct which we need to figure out still then the next screen will be tje changePasswrod*/}
//                 <Button title="Check" onPress={() => getEmailByUsername(username)} />
//             </View>
//
//             {email && (
//                 <View style={{ paddingHorizontal: 20 }}>
//                     <Text style={{ fontSize: 16, color: 'black' }}>
//                         Email: {email}
//                     </Text>
//                 </View>
//             )}
//
//         </SafeAreaView>
//     );
// };
//
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#dcdcdc',
//         justifyContent: 'space-between',
//     },
//     OTP_TitleBox: {
//         position: 'absolute',
//         justifyContent: 'center',
//         alignSelf: 'center',
//         marginTop: "15%",
//     },
//     OTP_Title: {
//         fontSize: 30,
//         fontFamily: 'serif',
//         fontWeight: 'bold',
//         color: 'white',
//     },
//     input: {
//         flex: 1,
//         borderColor: "#888",
//         borderWidth: 2,
//         borderRadius: 8,
//         paddingHorizontal: 12,
//         height: 100,
//         backgroundColor: "#fff",
//     },
//     searchContainer: {
//         paddingHorizontal: 20,
//         width: "95%",
//         height: "5%",
//         marginBottom: 10,
//         marginTop: 500,
//     },
// });
//
// export default OTP_Check;