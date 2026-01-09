import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
} from 'firebase/firestore';
import { getFirebaseDb } from '../index';
import { Teacher } from '../../types';

const COLLECTION_NAME = 'teachers';

export const teacherService = {
    // Create a new teacher
    async create(teacher: Teacher): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await setDoc(doc(db, COLLECTION_NAME, teacher.id), teacher);
    },

    // Get teacher by ID
    async getById(id: string): Promise<Teacher | null> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as Teacher;
        }
        return null;
    },

    // Get teacher by email
    async getByEmail(email: string): Promise<Teacher | null> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const q = query(
            collection(db, COLLECTION_NAME),
            where('email', '==', email.toLowerCase())
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as Teacher;
        }
        return null;
    },

    // Get all teachers
    async getAll(): Promise<Teacher[]> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => doc.data() as Teacher);
    },

    // Delete teacher
    async delete(id: string): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await deleteDoc(doc(db, COLLECTION_NAME, id));
    },

    // Check if email exists
    async emailExists(email: string): Promise<boolean> {
        const teacher = await this.getByEmail(email);
        return teacher !== null;
    },
};
