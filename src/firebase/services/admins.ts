import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
} from 'firebase/firestore';
import { getFirebaseDb } from '../index';

const COLLECTION_NAME = 'admins';

export interface AdminUser {
    email: string;
    createdAt: number;
    createdBy: string; // Email of the admin who added this admin
}

export const adminService = {
    // Check if an email is an admin
    async isAdmin(email: string): Promise<boolean> {
        const db = getFirebaseDb();
        if (!db) {
            // Fallback to hardcoded admin when Firebase is not configured
            return email.toLowerCase() === 'admin@classstock.com';
        }

        try {
            const docRef = doc(db, COLLECTION_NAME, email.toLowerCase());
            const docSnap = await getDoc(docRef);
            return docSnap.exists();
        } catch (error) {
            console.error('Failed to check admin status:', error);
            // Fallback to hardcoded admin on error
            return email.toLowerCase() === 'admin@classstock.com';
        }
    },

    // Add a new admin
    async addAdmin(email: string, addedBy: string): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const adminUser: AdminUser = {
            email: email.toLowerCase(),
            createdAt: Date.now(),
            createdBy: addedBy,
        };

        await setDoc(doc(db, COLLECTION_NAME, email.toLowerCase()), adminUser);
    },

    // Remove an admin
    async removeAdmin(email: string): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await deleteDoc(doc(db, COLLECTION_NAME, email.toLowerCase()));
    },

    // Get all admins
    async getAllAdmins(): Promise<AdminUser[]> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => doc.data() as AdminUser);
    },

    // Initialize default admin (for first-time setup)
    async initializeDefaultAdmin(): Promise<void> {
        const db = getFirebaseDb();
        if (!db) return;

        const defaultAdminEmail = 'admin@classstock.com';
        const isExisting = await this.isAdmin(defaultAdminEmail);

        if (!isExisting) {
            await this.addAdmin(defaultAdminEmail, 'system');
            console.log('Default admin initialized');
        }
    },
};
