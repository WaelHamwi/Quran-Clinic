declare module 'expo-router';
declare module 'expo-auth-session/providers/google';
declare module 'expo-auth-session';
declare module 'expo-secure-store';
declare module '@react-native-async-storage/async-storage';

declare module '*.svg' {
  import type React from 'react';
  import type { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
