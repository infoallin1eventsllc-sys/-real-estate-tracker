import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();
// Request Google Workspace permissions (Sheets, Drive, Gmail, Docs, Calendar)
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/gmail.modify');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/documents');
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/meetings.space.created');
provider.addScope('https://www.googleapis.com/auth/meetings.space.readonly');
provider.addScope('https://www.googleapis.com/auth/meetings.space.settings');
provider.addScope('https://www.googleapis.com/auth/tasks');
provider.addScope('https://www.googleapis.com/auth/keep');
provider.addScope('https://www.googleapis.com/auth/chat.spaces');
provider.addScope('https://www.googleapis.com/auth/chat.messages');
provider.addScope('https://www.googleapis.com/auth/chat.memberships');

// Cache the access token in-memory
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If user is logged in but token is not in-memory, we can prompt sign-in or wait for manual sync
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google OAuth access token.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in failed:', error);
    // Dispatch custom event so the UI can show a helpful connection guide
    window.dispatchEvent(new CustomEvent('google-signin-failed', { detail: error }));
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export const getAccessToken = () => cachedAccessToken;
