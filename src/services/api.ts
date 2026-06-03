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
import Constants from 'expo-constants';

const PRODUCTION_API_URL = 'https://mashfa.odooclick.com/api';

export const getApiUrl = (): string => {
  // Prefer the value baked into app.json -> expo.extra.API_BASE_URL.
  const fromExtra = (Constants.expoConfig?.extra as { API_BASE_URL?: string } | undefined)?.API_BASE_URL;
  if (fromExtra) return fromExtra;

  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_API_URL_WEB || PRODUCTION_API_URL;
  }
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_API_URL_ANDROID || PRODUCTION_API_URL;
  }
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_API_URL_IOS || PRODUCTION_API_URL;
  }
  return PRODUCTION_API_URL;
};

export const API_URL = getApiUrl();

export const API_HEADERS: HeadersInit = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};