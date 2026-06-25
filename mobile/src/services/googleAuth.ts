import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Must match exactly what's registered in Google Cloud Console → Authorized redirect URIs
const REDIRECT_URI = 'https://auth.expo.io/@wael_hamwi/quranic-clinic';

export const signInWithGoogle = async () => {
  try {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!clientId) throw new Error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not defined');

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=token` +
      `&scope=openid%20profile%20email`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

    if (result.type === 'success' && result.url) {
      const fragment = result.url.split('#')[1] ?? '';
      const accessToken = new URLSearchParams(fragment).get('access_token');
      if (accessToken) return { type: 'success' as const, params: { access_token: accessToken } };
    }

    return { type: 'error' as const, message: 'Authentication failed' };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    return { type: 'error' as const, message: error.message };
  }
};