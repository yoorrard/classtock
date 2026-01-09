import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig, isFirebaseConfigured } from './config';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Initialize Firebase only if properly configured
export const initializeFirebase = (): boolean => {
    if (!isFirebaseConfigured()) {
        console.warn('Firebase is not configured. Running in demo mode with local state.');
        return false;
    }

    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        return false;
    }
};

// Getters for Firebase services
export const getFirebaseApp = () => app;
export const getFirebaseAuth = () => auth;
export const getFirebaseDb = () => db;
export const getFirebaseStorage = () => storage;

// Check if Firebase is available
export const isFirebaseAvailable = () => app !== null;
