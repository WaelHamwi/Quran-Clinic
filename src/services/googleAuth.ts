import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const signInWithGoogle = async () => {
  try {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not defined');
    }

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'quran-mobile',
      path: 'oauthredirect',
    });
    
    console.log('YOUR EXACT REDIRECT URI IS:', redirectUri);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=openid profile email`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      const hashParams = new URLSearchParams(result.url.split('#')[1]);
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        return {
          type: 'success',
          params: { access_token: accessToken },
        };
      }
    }
    
    return { type: 'error', message: 'Authentication failed' };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    return { type: 'error', message: error.message };
  }
};