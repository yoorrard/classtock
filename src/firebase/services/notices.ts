import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    orderBy,
} from 'firebase/firestore';
import { getFirebaseDb } from '../index';
import { Notice, QnAPost, PopupNotice } from '../../types';

// --- NOTICES ---
const NOTICES_COLLECTION = 'notices';

export const noticeService = {
    async create(notice: Notice): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await setDoc(doc(db, NOTICES_COLLECTION, notice.id), notice);
    },

    async getById(id: string): Promise<Notice | null> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const docRef = doc(db, NOTICES_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as Notice;
        }
        return null;
    },

    async getAll(): Promise<Notice[]> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const q = query(
            collection(db, NOTICES_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => doc.data() as Notice);
    },

    async update(notice: Notice): Promise<void> {
        await this.create(notice); // setDoc with merge
    },

    async delete(id: string): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await deleteDoc(doc(db, NOTICES_COLLECTION, id));
    },
};

// --- Q&A POSTS ---
const QNA_COLLECTION = 'qnaPosts';

export const qnaService = {
    async create(post: QnAPost): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await setDoc(doc(db, QNA_COLLECTION, post.id), post);
    },

    async getById(id: string): Promise<QnAPost | null> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const docRef = doc(db, QNA_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as QnAPost;
        }
        return null;
    },

    async getAll(): Promise<QnAPost[]> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const q = query(
            collection(db, QNA_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => doc.data() as QnAPost);
    },

    async update(post: QnAPost): Promise<void> {
        await this.create(post);
    },

    async delete(id: string): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await deleteDoc(doc(db, QNA_COLLECTION, id));
    },
};

// --- POPUP NOTICES ---
const POPUP_COLLECTION = 'popupNotices';

export const popupNoticeService = {
    async create(notice: PopupNotice): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await setDoc(doc(db, POPUP_COLLECTION, notice.id), notice);
    },

    async getById(id: string): Promise<PopupNotice | null> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const docRef = doc(db, POPUP_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as PopupNotice;
        }
        return null;
    },

    async getAll(): Promise<PopupNotice[]> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        const querySnapshot = await getDocs(collection(db, POPUP_COLLECTION));
        return querySnapshot.docs.map(doc => doc.data() as PopupNotice);
    },

    async update(notice: PopupNotice): Promise<void> {
        await this.create(notice);
    },

    async delete(id: string): Promise<void> {
        const db = getFirebaseDb();
        if (!db) throw new Error('Firebase not initialized');

        await deleteDoc(doc(db, POPUP_COLLECTION, id));
    },
};
