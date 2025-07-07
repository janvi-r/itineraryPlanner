import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, StyleSheet, ScrollView } from 'react-native';

export default function App() {
  const [city, setCity] = useState('');
  const [attractions, setAttractions] = useState([]);

  const fetchAttractions = async () => {
    try {
      const response = await fetch(`http://192.168.1.205:8000/attractions?city=${city}`);

      const data = await response.json();
      setAttractions(data);
    } catch (e) {
      console.error('❌ Error fetching attractions:', e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Tourist Attractions</Text>
      <TextInput
        placeholder="Enter a city"
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />
      <Button title="Search" onPress={fetchAttractions} />
      <FlatList
        data={attractions}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            {item.image !== 'N/A' && (
              <Image source={{ uri: item.image }} style={styles.image} />
            )}
            <Text style={styles.link}>{item.url}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  item: { marginBottom: 20 },
  name: { fontWeight: 'bold', fontSize: 16 },
  image: { width: '100%', height: 150, marginTop: 10, borderRadius: 10 },
  link: { marginTop: 5, color: 'blue' },
});