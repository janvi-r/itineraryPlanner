
import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Button,
} from 'react-native';
import SwipeCard from '../components/swipeCard';
import {useNavigation} from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const HomeScreen = ({route}) => {
    const {username} = route.params;

    const [city, setCity] = useState('');
    const [cards, setCards] = useState([]);
    const [savedList, setSavedList] = useState([]);
    const [history, setHistory] = useState([]); // For Undo
    const [suggestedCity, setSuggestedCity] = useState(null);
    const [days, setDays] = useState("");
    const navigation = useNavigation();

    const hasCards = cards.length > 0;

    useEffect(() => {
        if (!city) {
            setSuggestedCity(null);
            return;
        }

        const timeout = setTimeout(() => {
            fetch(`http://192.168.1.205:8000/cityVerifier?city=${encodeURIComponent(city)}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.match && data.match.toLowerCase() !== city.toLowerCase()) {
                        setSuggestedCity(data.match);
                    } else {
                        setSuggestedCity(null);
                    }
                })
                .catch((error) => {
                    console.error('Error verifying city:', error);
                    setSuggestedCity(null);
                });
        }, 500);

        return () => clearTimeout(timeout);
    }, [city]);

    const fetchAttractions = async () => {
        try {
            const response = await fetch(`http://192.168.1.205:8000/attractions?city=${city}`);
            const data = await response.json();
            setCards(data);
            setSavedList([]);
            setHistory([]);
        } catch (e) {
            console.error('❌ Error fetching attractions:', e);
        }
    };

    const handleSwipeRight = (item) => {
        setHistory((prev) => [item, ...prev]);
        // setSavedList((prev) => [...prev, item.name]);

        setSavedList((prev) => {
            if (!prev.includes(item.name)) {
                return [...prev, item.name];
            }
            return prev;
        });

        removeTopCard();
    };

    const handleSwipeLeft = () => {
        if (cards[0]) setHistory((prev) => [cards[0], ...prev]);
        removeTopCard();
    };

    const removeTopCard = () => {
        setCards((prev) => prev.slice(1));
    };

    const handleUndo = () => {
        if (history.length > 0) {
            const [lastItem, ...rest] = history;
            setCards((prev) => [lastItem, ...prev]);
            setHistory(rest);
            setSavedList((prev) => prev.filter((name) => name !== lastItem.name));
        }
    };

    const handleHeart = () => {
        if (cards.length > 0) {
            handleSwipeRight(cards[0]);
        }
    };

    const handleX = () => {
        if (cards.length > 0) {
            handleSwipeLeft();
        }
    };

    const handleDone = async () => {
        if (!city || savedList.length === 0) return;

        try {
            const response = await fetch('http://192.168.1.205:8000/api/save_trip/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username,
                    city,
                    attractions: savedList,
                }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                alert('Trip saved successfully!');
                setSavedList([]);
                navigation.navigate('Map', {
                    cityName: city,
                    selectedAttractions: savedList,
                    username,
                    days: Number(days),
                });
            } else {
                alert('Failed to save trip: ' + result.detail);
            }
        } catch (e) {
            alert('Network error: ' + e.message);
        }
    };

    return (
        <View style={styles.container}>
            {cards.length === 0 && savedList.length === 0 ? (
                <>
                    <Text style={styles.title}>Attraction Explorer</Text>
                    <View style={styles.searchContainer}>
                        <TextInput
                            placeholder="Enter a city..."
                            style={styles.input}
                            value={city}
                            onChangeText={setCity}
                        />
                    </View>
                    <View style={styles.searchContainer}>
                        <TextInput
                            placeholder="How many days is your trip?"
                            style={styles.input}
                            value={days}
                            onChangeText={setDays}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity onPress={fetchAttractions} style={styles.button}>
                            <Text style={styles.buttonText}>Search</Text>
                        </TouchableOpacity>
                    </View>
                    {suggestedCity && (
                        <TouchableOpacity onPress={() => setCity(suggestedCity)}>
                            <Text style={{color: 'blue', marginTop: 6}}>
                                Did you mean: <Text style={{fontWeight: 'bold'}}>{suggestedCity}</Text>?
                            </Text>
                        </TouchableOpacity>
                    )}
                </>
            ) : (
                <Text style={styles.title}>{city}</Text>
            )}

            <View style={styles.cardContainer}>
                {cards.length > 0 ? (
                    cards
                        .map((item, index) => {
                            if (index === 0) {
                                return (
                                    <SwipeCard
                                        key={item.name || index}
                                        data={item}
                                        onSwipeRight={handleSwipeRight}
                                        onSwipeLeft={handleSwipeLeft}
                                    />
                                );
                            }
                            return null;
                        })
                        .reverse()
                ) : savedList.length > 0 ? (
                    <ScrollView contentContainerStyle={styles.resultContainer}>
                        <Text style={styles.savedTitle}>Saved Attractions:</Text>
                        {savedList.map((name, index) => (
                            <Text key={index} style={styles.savedItem}>
                                • {name}
                            </Text>
                        ))}
                        <View style={{marginTop: 20}}>
                            <Button title="Done Choosing Attractions" onPress={handleDone}/>
                        </View>
                    </ScrollView>
                ) : (
                    <Text style={styles.savedTitle}>No results yet. Search for a city!</Text>
                )}
            </View>

            {/*{cards.length > 0 && (*/}
            {/*    <View style={styles.actionButtons}>*/}
            {/*        <TouchableOpacity style={[styles.circleButton, {backgroundColor: '#ccc'}]} onPress={handleUndo}>*/}
            {/*            <Text style={styles.buttonLabel}>↺</Text>*/}
            {/*        </TouchableOpacity>*/}
            {/*        <TouchableOpacity style={[styles.circleButton, {backgroundColor: '#e74c3c'}]} onPress={handleX}>*/}
            {/*            <Text style={styles.buttonLabel}>✖</Text>*/}
            {/*        </TouchableOpacity>*/}
            {/*        <TouchableOpacity style={[styles.circleButton, {backgroundColor: '#2ecc71'}]} onPress={handleHeart}>*/}
            {/*            <Text style={styles.buttonLabel}>❤</Text>*/}
            {/*        </TouchableOpacity>*/}
            {/*    </View>*/}
            {/*)}*/}

            {hasCards && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.circleButton, {backgroundColor: '#ccc', opacity: history.length ? 1 : 0.4}]}
                        onPress={handleUndo}
                        disabled={history.length === 0}
                    >
                        <Text style={styles.buttonLabel}>↺</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.circleButton, {backgroundColor: '#e74c3c', opacity: hasCards ? 1 : 0.4}]}
                        onPress={handleX}
                        disabled={!hasCards}
                    >
                        <Text style={styles.buttonLabel}>✖</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.circleButton, {backgroundColor: '#ffc0cb', opacity: hasCards ? 1 : 0.4}]}
                        onPress={handleHeart}
                        disabled={!hasCards}
                    >
                        <Text style={styles.buttonLabel}>❤</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 20,
        letterSpacing: 0.5,
        fontFamily: 'AvenirNext-Regular',
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        borderColor: '#888',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 10,
        height: 40,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#007BFF',
        borderRadius: 8,
        paddingHorizontal: 14,
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
    },
    cardContainer: {
        flex: 1,
        width: SCREEN_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        paddingHorizontal: 20,
        fontFamily: 'AvenirNext-Regular',
    },
    resultContainer: {
        alignItems: 'flex-start',
        width: '100%',
        paddingVertical: 20,
    },
    savedTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 10,
    },
    savedItem: {
        fontSize: 18,
        color: '#333',
        marginVertical: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 40,
        width: '100%',
        paddingHorizontal: 50,
    },
    circleButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    buttonLabel: {
        color: 'white',
        fontSize: 26,
        fontWeight: 'bold',
    },
});

export default HomeScreen;
