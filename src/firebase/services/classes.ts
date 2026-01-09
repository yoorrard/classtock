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
import { ClassInfo } from '../../types';

const COLLECTION_NAME = 'classes';

export const classService = {
    // Create a new class
    async create(classInfo: ClassInfo): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await setDoc(doc(db, COLLECTION_NAME, classInfo.id), classInfo);
    },

    // Get class by ID
    async getById(id: string): Promise<ClassInfo | null> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as ClassInfo;
        }
        return null;
    },

    // Get classes by teacher email
    async getByTeacherEmail(email: string): Promise<ClassInfo[]> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const q = query(
            collection(db, COLLECTION_NAME),
            where('teacherEmail', '==', email)
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => doc.data() as ClassInfo);
    },

    // Get all classes
    async getAll(): Promise<ClassInfo[]> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => doc.data() as ClassInfo);
    },

    // Delete class
    async delete(id: string): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await deleteDoc(doc(db, COLLECTION_NAME, id));
    },

    // Delete all classes by teacher email
    async deleteByTeacherEmail(email: string): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const classes = await this.getByTeacherEmail(email);
        await Promise.all(classes.map(c => this.delete(c.id)));
    },

    // Count classes by teacher email
    async countByTeacherEmail(email: string): Promise<number> {
        const classes = await this.getByTeacherEmail(email);
        return classes.length;
    },
};
