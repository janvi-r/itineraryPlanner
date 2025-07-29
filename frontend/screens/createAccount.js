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
} from "react-native";
import React, {useState} from "react";

const CreateAccount = ({navigation}) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [year, setYear] = useState('');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const days = Array.from({length: 31}, (_, i) => (i + 1).toString());
    // const currentYear = 2025;
    // const years = Array.from({length: currentYear - 1924}, (_, i) => (1925 + i).toString());
    const currentYear = 2025;
    const years = Array.from({ length: currentYear - 1924 }, (_, i) => (currentYear - i).toString());


    const [isMonthDropdownVisible, setMonthDropdownVisible] = useState(false);
    const [isDayDropdownVisible, setDayDropdownVisible] = useState(false);
    const [isYearDropdownVisible, setYearDropdownVisible] = useState(false);

    const handleSelectMonth = (selectedMonth) => {
        setMonth(selectedMonth);
        setMonthDropdownVisible(false);
    };

    const handleSelectDay = (selectedDay) => {
        setDay(selectedDay);
        setDayDropdownVisible(false);
    };

    const handleSelectYear = (selectedYear) => {
        setYear(selectedYear);
        setYearDropdownVisible(false);
    };

    const handleSubmit = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match!");
            return;
        }

        if (!month || !day || !year) {
            Alert.alert("Error", "Please select a valid birthday.");
            return;
        }

        const monthNumber = (months.indexOf(month) + 1).toString().padStart(2, '0');
        const dayNumber = day.padStart(2, '0');
        const birthday = `${year}-${monthNumber}-${dayNumber}`;

        const userData = {
            first_name: firstName,
            last_name: lastName,
            email,
            username,
            password,
            birthday,
        };

        try {
            const response = await fetch("http://192.168.1.205:8000/api/register/"
                , {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userData),
                });

            if (response.ok) {
                Alert.alert("Success", "Account created successfully!");
                // navigation.reset({
                //     index: 0,
                //     routes: [{ name: 'Drawer', params: { username: username } }],
                //   });\
                navigation.navigate("Drawer", {username: username});
                // Clear form if needed
            } else {
                const error = await response.json();
                Alert.alert("Error", JSON.stringify(error));
            }
        } catch (error) {
            Alert.alert("Network Error", error.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.inputContainer}>
            <View style={styles.searchContainer}>
                <TextInput placeholder="Enter First Name..." style={styles.input} value={firstName}
                           onChangeText={setFirstName}/>
            </View>

            <View style={styles.searchContainer}>
                <TextInput placeholder="Enter Last Name..." style={styles.input} value={lastName}
                           onChangeText={setLastName}/>
            </View>

            <View style={styles.searchContainer}>
                <TextInput placeholder="Enter Email..." style={styles.input} value={email}
                           onChangeText={setEmail}/>
            </View>

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

            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="Enter Password Again..."
                    style={styles.input}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
            </View>


            {/*Birthday stuff*/}
            {/* Month Box with dropdown */}
            <View style={styles.inputBox}>
                <Text style={styles.label}>Month</Text>
                <TouchableOpacity
                    style={styles.input1}
                    onPress={() => setMonthDropdownVisible(true)}
                >
                    <Text style={{color: month ? 'black' : 'gray'}}>
                        {month || 'Select Month'}
                    </Text>
                </TouchableOpacity>


                {/* Month Dropdown Modal */}
                <Modal
                    visible={isMonthDropdownVisible}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <FlatList
                                data={months}
                                keyExtractor={(item) => item}
                                renderItem={({item}) => (
                                    <TouchableOpacity
                                        style={styles.option}
                                        onPress={() => handleSelectMonth(item)}
                                    >
                                        <Text style={styles.optionText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setMonthDropdownVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>


            {/* Day Dropdown */}
            <View style={styles.inputBox}>
                <Text style={styles.label}>Day</Text>
                <TouchableOpacity
                    style={styles.input1}
                    onPress={() => setDayDropdownVisible(true)}
                >
                    <Text style={{color: day ? 'black' : 'gray'}}>
                        {day || 'Select Day'}
                    </Text>
                </TouchableOpacity>
                {/* Day Modal */}
                <Modal
                    visible={isDayDropdownVisible}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <FlatList
                                data={days}
                                keyExtractor={(item) => item}
                                renderItem={({item}) => (
                                    <TouchableOpacity
                                        style={styles.option}
                                        onPress={() => handleSelectDay(item)}
                                    >
                                        <Text style={styles.optionText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setDayDropdownVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>


            <View style={styles.inputBox}>
                <Text style={styles.label}>Year</Text>
                <TouchableOpacity
                    style={styles.input1}
                    onPress={() => setYearDropdownVisible(true)}
                >
                    <Text style={{color: year ? 'black' : 'gray'}}>
                        {year || 'Select Year'}
                    </Text>
                </TouchableOpacity>
                {/* Year Modal */}
                <Modal
                    visible={isYearDropdownVisible}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <FlatList
                                data={years}
                                keyExtractor={(item) => item}
                                renderItem={({item}) => (
                                    <TouchableOpacity
                                        style={styles.option}
                                        onPress={() => handleSelectYear(item)}
                                    >
                                        <Text style={styles.optionText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setYearDropdownVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Create Account" onPress={handleSubmit}/>
            </View>

        </ScrollView>


    );
};

const styles = StyleSheet.create({
    inputContainer: {
        paddingVertical: 20,
        backgroundColor: "white",
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        borderColor: "#888",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
        backgroundColor: "#fff",
    },
    buttonContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
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
});

export default CreateAccount;
