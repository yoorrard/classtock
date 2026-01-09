import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    writeBatch,
} from 'firebase/firestore';
import { getFirebaseDb } from '../index';
import { StudentInfo } from '../../types';

const COLLECTION_NAME = 'students';

export const studentService = {
    // Create a new student
    async create(student: StudentInfo): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await setDoc(doc(db, COLLECTION_NAME, student.id), student);
    },

    // Bulk create students
    async bulkCreate(students: StudentInfo[]): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const batch = writeBatch(db);
        students.forEach(student => {
            const docRef = doc(db, COLLECTION_NAME, student.id);
            batch.set(docRef, student);
        });
        await batch.commit();
    },

    // Get student by ID
    async getById(id: string): Promise<StudentInfo | null> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as StudentInfo;
        }
        return null;
    },

    // Get students by class ID
    async getByClassId(classId: string): Promise<StudentInfo[]> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const q = query(
            collection(db, COLLECTION_NAME),
            where('classId', '==', classId)
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => doc.data() as StudentInfo);
    },

    // Get all students
    async getAll(): Promise<StudentInfo[]> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => doc.data() as StudentInfo);
    },

    // Update student
    async update(id: string, data: Partial<StudentInfo>): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await updateDoc(doc(db, COLLECTION_NAME, id), data);
    },

    // Delete student
    async delete(id: string): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await deleteDoc(doc(db, COLLECTION_NAME, id));
    },

    // Delete all students by class ID
    async deleteByClassId(classId: string): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const students = await this.getByClassId(classId);
        const batch = writeBatch(db);
        students.forEach(student => {
            batch.delete(doc(db, COLLECTION_NAME, student.id));
        });
        await batch.commit();
    },

    // Find student by class ID and nickname
    async findByClassAndNickname(classId: string, nickname: string): Promise<StudentInfo | null> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const q = query(
            collection(db, COLLECTION_NAME),
            where('classId', '==', classId),
            where('nickname', '==', nickname)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as StudentInfo;
        }
        return null;
    },
};
