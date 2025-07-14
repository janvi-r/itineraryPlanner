import React from 'react';
import { View, StyleSheet } from 'react-native';
import {WebView} from "react-native-webview";

const MapScreen = ({ route }) => {
  const { cityId } = route.params;

  const mapUrl = `http://192.168.1.205:8000/map/${cityId}/`;  // replace with production IP or domain when needed

  return (
    <View style={styles.container}>
      <WebView source={{ uri: mapUrl }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
export default MapScreen;