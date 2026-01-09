import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    deleteUser,
    User,
} from 'firebase/auth';
import { getFirebaseAuth } from './index';

const googleProvider = new GoogleAuthProvider();

export const authService = {
    // Register with email and password
    async register(email: string, password: string): Promise<User> {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error('Firebase Auth not initialized');

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    },

    // Login with email and password
    async login(email: string, password: string): Promise<User> {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error('Firebase Auth not initialized');

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    },

    // Login with Google
    async loginWithGoogle(): Promise<User> {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error('Firebase Auth not initialized');

        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    },

    // Logout
    async logout(): Promise<void> {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error('Firebase Auth not initialized');

        await signOut(auth);
    },

    // Send password reset email
    async sendPasswordReset(email: string): Promise<void> {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error('Firebase Auth not initialized');

        await sendPasswordResetEmail(auth, email);
    },

    // Delete current user account
    async deleteAccount(): Promise<void> {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error('Firebase Auth not initialized');

        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        await deleteUser(user);
    },

    // Get current user
    getCurrentUser(): User | null {
        const auth = getFirebaseAuth();
        if (!auth) return null;

        return auth.currentUser;
    },

    // Subscribe to auth state changes
    onAuthStateChanged(callback: (user: User | null) => void): () => void {
        const auth = getFirebaseAuth();
        if (!auth) {
            callback(null);
            return () => {};
        }

        return onAuthStateChanged(auth, callback);
    },
};
