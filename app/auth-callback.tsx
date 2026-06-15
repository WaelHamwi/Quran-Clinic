import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { palette } from '@/theme/colors';

// Fallback handler for the OAuth `quranicclinic://auth-callback` deep link in case it
// reaches the router instead of being rewritten by +native-intent. Actual auth
// completion is driven by AuthContext (session polling); here we just bounce to the
// app root so the user never lands on the "Unmatched Route" screen.
export default function AuthCallback() {
  useEffect(() => {
    router.replace('/');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={palette.brand[500]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
  },
});
