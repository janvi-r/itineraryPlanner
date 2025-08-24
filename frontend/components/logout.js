


import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Logout = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const logout = async () => {
      try {
        Alert.alert("Logged Out", "You have been logged out.");

        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } catch (error) {
        console.error("Error clearing AsyncStorage during logout:", error);
      }
    };

    logout();
  }, []);

  return null;
};

export default Logout;