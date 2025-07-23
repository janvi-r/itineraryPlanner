import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TripApp from './screens/homeScreen';
import HomeScreen from './screens/attractionChoice';
import ProfileScreen from './screens/profileScreen';
import {AboutScreen, ContactScreen} from './screens/sidebar2';
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
import CreateAccount from './screens/createAccount';
import MapScreen from "./screens/MapScreen";
import Login from './screens/Login';

// Drawer navigator with screens inside the drawer
function MyDrawer() {
  return (
    // <Drawer.Navigator initialRouteName="TripApp">
    //   <Drawer.Screen name="TripApp" component={TripApp} options={{ title: 'Home' }} />
    //      <Drawer.Navigator initialRouteName="CreateAccount">
    //   <Drawer.Screen name="CreateAccount" component={CreateAccount} options={{ title: 'Home' }} />
             <Drawer.Navigator initialRouteName="Login">
      <Drawer.Screen name="Login" component={Login} options={{ title: 'Home' }} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen name="Contact" component={ContactScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Drawer">
        <Stack.Screen
          name="Drawer"
          component={MyDrawer}
          options={{ headerShown: false }}
        />
          <Stack.Screen name="TripApp" component={TripApp} />
          <Stack.Screen name="createAccount" component={CreateAccount} options={{ title: 'Create Account' }} />
        <Stack.Screen name="attractionChoice" component={HomeScreen} />
        <Stack.Screen name="profileScreen" component={ProfileScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
