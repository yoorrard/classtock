import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    writeBatch,
} from 'firebase/firestore';
import { getFirebaseDb } from '../index';
import { Transaction } from '../../types';

const COLLECTION_NAME = 'transactions';

export const transactionService = {
    // Create a new transaction
    async create(transaction: Transaction): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await setDoc(doc(db, COLLECTION_NAME, transaction.id), transaction);
    },

    // Bulk create transactions
    async bulkCreate(transactions: Transaction[]): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const batch = writeBatch(db);
        transactions.forEach(transaction => {
            const docRef = doc(db, COLLECTION_NAME, transaction.id);
            batch.set(docRef, transaction);
        });
        await batch.commit();
    },

    // Get transactions by student ID
    async getByStudentId(studentId: string): Promise<Transaction[]> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const q = query(
            collection(db, COLLECTION_NAME),
            where('studentId', '==', studentId),
            orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => doc.data() as Transaction);
    },

    // Get all transactions
    async getAll(): Promise<Transaction[]> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => doc.data() as Transaction);
    },

    // Delete transaction
    async delete(id: string): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await deleteDoc(doc(db, COLLECTION_NAME, id));
    },

    // Delete all transactions by student ID
    async deleteByStudentId(studentId: string): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const transactions = await this.getByStudentId(studentId);
        const batch = writeBatch(db);
        transactions.forEach(transaction => {
            batch.delete(doc(db, COLLECTION_NAME, transaction.id));
        });
        await batch.commit();
    },

    // Delete transactions by multiple student IDs
    async deleteByStudentIds(studentIds: string[]): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        // Process in batches of 10 due to Firestore 'in' query limitation
        const batchSize = 10;
        for (let i = 0; i < studentIds.length; i += batchSize) {
            const batchIds = studentIds.slice(i, i + batchSize);
            const q = query(
                collection(db, COLLECTION_NAME),
                where('studentId', 'in', batchIds)
            );
            const querySnapshot = await getDocs(q);

            const batch = writeBatch(db);
            querySnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }
    },
};
