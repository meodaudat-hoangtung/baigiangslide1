import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with ignoreUndefinedProperties: true and custom databaseId if configured
function createFirestoreInstance() {
  try {
    if (firebaseConfig.firestoreDatabaseId) {
      return initializeFirestore(
        firebaseApp,
        { ignoreUndefinedProperties: true },
        firebaseConfig.firestoreDatabaseId
      );
    }
    return initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true });
  } catch {
    return firebaseConfig.firestoreDatabaseId
      ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
      : getFirestore(firebaseApp);
  }
}

export const db = createFirestoreInstance();

// Initialize Firebase Auth
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'app_config', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

