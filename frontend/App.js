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
import attractionChoice from "./screens/attractionChoice";
import Logout from './components/logout';
import FinalItinerary from "./screens/Finalitinerary";

// Drawer navigator with screens inside the drawer
function MyDrawer({route}) {
      // const { username } = route.params;
      const username = route?.params?.username;


  return (
    <Drawer.Navigator initialRouteName="TripApp">
      <Drawer.Screen name="TripApp"  component={TripApp}  initialParams={{ username }} options={{ title: 'Home' }} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen name="Contact" component={ContactScreen} />
        <Drawer.Screen name="Start a Trip" component={attractionChoice} />
      <Drawer.Screen name="Profile" component={ProfileScreen} initialParams={{ username }} />

      {/*  Make the button red*/}
      <Drawer.Screen name="Logout" component={Logout} />

    </Drawer.Navigator>
  );
}
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
          <Stack.Screen name = "Drawer" component={MyDrawer} options={{ headerShown: false }} />
          {/*//<Stack.Screen name="TripApp" component={TripApp} initialParams={ username } />*/}
          <Stack.Screen name="createAccount" component={CreateAccount} options={{ title: 'Create Account' }} />
        <Stack.Screen name="attractionChoice" component={HomeScreen} />
        <Stack.Screen name="profileScreen" component={ProfileScreen} />
        <Stack.Screen name="Map" component={MapScreen}  />
          <Stack.Screen name="FinalItinerary" component={FinalItinerary}  />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
