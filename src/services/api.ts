/*import { Platform } from 'react-native';

export const getApiUrl = (): string => {
  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_API_URL_WEB || 'http://localhost:8000/api';
  }
  
  if (Platform.OS === 'android') {
    // Use YOUR local IP address from ipconfig
    return process.env.EXPO_PUBLIC_API_URL_ANDROID || 'http://192.168.100.103:8000/api';
  }
  
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_API_URL_IOS || 'http://192.168.100.103:8000/api';
  }
  
  // Default fallback
  return 'http://localhost:8000/api';
};

export const API_URL = getApiUrl();*/
import { Platform } from 'react-native';

export const getApiUrl = (): string => {
  // Use your ngrok URL
  return 'https://theatrics-filth-slab.ngrok-free.dev/api';
};

export const API_URL = getApiUrl();

export const API_HEADERS: HeadersInit = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};