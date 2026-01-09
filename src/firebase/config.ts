// Firebase configuration
// These values come from environment variables (see .env.example)

export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that all required config values are present
export const isFirebaseConfigured = (): boolean => {
    const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
    return requiredKeys.every(key =>
        firebaseConfig[key as keyof typeof firebaseConfig] &&
        !firebaseConfig[key as keyof typeof firebaseConfig]?.includes('your_')
    );
};
