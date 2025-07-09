// SidebarNavigator.js
import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text } from 'react-native';
import TripApp from './homeScreen';
const Drawer = createDrawerNavigator();


export function AboutScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>ℹ️ About Page</Text>
    </View>
  );
}

export function ContactScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>📞 Contact Page</Text>
    </View>
  );
}