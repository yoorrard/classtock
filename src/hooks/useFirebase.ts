import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { initializeFirebase, isFirebaseAvailable } from '../firebase';
import { authService } from '../firebase/auth';
import {
    teacherService,
    classService,
    studentService,
    transactionService,
    noticeService,
    qnaService,
    popupNoticeService,
} from '../firebase/services';
import {
    Teacher,
    ClassInfo,
    StudentInfo,
    Transaction,
    Notice,
    QnAPost,
    PopupNotice,
} from '../types';

interface FirebaseState {
    isInitialized: boolean;
    isAvailable: boolean;
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;
}

export const useFirebase = () => {
    const [state, setState] = useState<FirebaseState>({
        isInitialized: false,
        isAvailable: false,
        currentUser: null,
        isLoading: true,
        error: null,
    });

    // Initialize Firebase on mount
    useEffect(() => {
        const initialized = initializeFirebase();
        setState(prev => ({
            ...prev,
            isInitialized: true,
            isAvailable: initialized,
            isLoading: initialized, // Keep loading if Firebase is available (waiting for auth)
        }));

        if (initialized) {
            // Listen for auth state changes
            const unsubscribe = authService.onAuthStateChanged((user) => {
                setState(prev => ({
                    ...prev,
                    currentUser: user,
                    isLoading: false,
                }));
            });

            return () => unsubscribe();
        } else {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    // Auth methods
    const register = useCallback(async (email: string, password: string): Promise<User | null> => {
        if (!state.isAvailable) return null;

        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            const user = await authService.register(email, password);

            // Create teacher record in Firestore
            const teacher: Teacher = {
                id: user.uid,
                email: user.email || email,
                password: '', // Not stored in Firestore when using Firebase Auth
                createdAt: Date.now(),
            };
            await teacherService.create(teacher);

            setState(prev => ({ ...prev, isLoading: false }));
            return user;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            setState(prev => ({ ...prev, isLoading: false, error: message }));
            throw error;
        }
    }, [state.isAvailable]);

    const login = useCallback(async (email: string, password: string): Promise<User | null> => {
        if (!state.isAvailable) return null;

        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            const user = await authService.login(email, password);
            setState(prev => ({ ...prev, isLoading: false }));
            return user;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Login failed';
            setState(prev => ({ ...prev, isLoading: false, error: message }));
            throw error;
        }
    }, [state.isAvailable]);

    const loginWithGoogle = useCallback(async (): Promise<User | null> => {
        if (!state.isAvailable) return null;

        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            const user = await authService.loginWithGoogle();

            // Check if teacher record exists, create if not
            const existingTeacher = await teacherService.getByEmail(user.email || '');
            if (!existingTeacher) {
                const teacher: Teacher = {
                    id: user.uid,
                    email: user.email || '',
                    password: '',
                    createdAt: Date.now(),
                };
                await teacherService.create(teacher);
            }

            setState(prev => ({ ...prev, isLoading: false }));
            return user;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Google login failed';
            setState(prev => ({ ...prev, isLoading: false, error: message }));
            throw error;
        }
    }, [state.isAvailable]);

    const logout = useCallback(async (): Promise<void> => {
        if (!state.isAvailable) return;

        try {
            await authService.logout();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Logout failed';
            setState(prev => ({ ...prev, error: message }));
            throw error;
        }
    }, [state.isAvailable]);

    const sendPasswordReset = useCallback(async (email: string): Promise<void> => {
        if (!state.isAvailable) return;

        try {
            await authService.sendPasswordReset(email);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Password reset failed';
            setState(prev => ({ ...prev, error: message }));
            throw error;
        }
    }, [state.isAvailable]);

    const deleteAccount = useCallback(async (): Promise<void> => {
        if (!state.isAvailable || !state.currentUser) return;

        try {
            const email = state.currentUser.email || '';

            // Delete all user data from Firestore
            const classes = await classService.getByTeacherEmail(email);
            for (const classInfo of classes) {
                const students = await studentService.getByClassId(classInfo.id);
                const studentIds = students.map(s => s.id);

                // Delete transactions
                await transactionService.deleteByStudentIds(studentIds);

                // Delete students
                await studentService.deleteByClassId(classInfo.id);

                // Delete class
                await classService.delete(classInfo.id);
            }

            // Delete teacher record
            await teacherService.delete(state.currentUser.uid);

            // Delete auth account
            await authService.deleteAccount();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Account deletion failed';
            setState(prev => ({ ...prev, error: message }));
            throw error;
        }
    }, [state.isAvailable, state.currentUser]);

    // Data fetching methods
    const fetchClasses = useCallback(async (email: string): Promise<ClassInfo[]> => {
        if (!state.isAvailable) return [];
        return classService.getByTeacherEmail(email);
    }, [state.isAvailable]);

    const fetchStudents = useCallback(async (classIds: string[]): Promise<StudentInfo[]> => {
        if (!state.isAvailable) return [];
        const allStudents: StudentInfo[] = [];
        for (const classId of classIds) {
            const students = await studentService.getByClassId(classId);
            allStudents.push(...students);
        }
        return allStudents;
    }, [state.isAvailable]);

    const fetchTransactions = useCallback(async (studentIds: string[]): Promise<Transaction[]> => {
        if (!state.isAvailable) return [];
        const allTransactions: Transaction[] = [];
        for (const studentId of studentIds) {
            const transactions = await transactionService.getByStudentId(studentId);
            allTransactions.push(...transactions);
        }
        return allTransactions;
    }, [state.isAvailable]);

    const fetchNotices = useCallback(async (): Promise<Notice[]> => {
        if (!state.isAvailable) return [];
        return noticeService.getAll();
    }, [state.isAvailable]);

    const fetchQnAPosts = useCallback(async (): Promise<QnAPost[]> => {
        if (!state.isAvailable) return [];
        return qnaService.getAll();
    }, [state.isAvailable]);

    const fetchPopupNotices = useCallback(async (): Promise<PopupNotice[]> => {
        if (!state.isAvailable) return [];
        return popupNoticeService.getAll();
    }, [state.isAvailable]);

    // Data mutation methods
    const saveClass = useCallback(async (classInfo: ClassInfo): Promise<void> => {
        if (!state.isAvailable) return;
        await classService.create(classInfo);
    }, [state.isAvailable]);

    const deleteClass = useCallback(async (classId: string): Promise<void> => {
        if (!state.isAvailable) return;
        await classService.delete(classId);
    }, [state.isAvailable]);

    const saveStudents = useCallback(async (students: StudentInfo[]): Promise<void> => {
        if (!state.isAvailable) return;
        await studentService.bulkCreate(students);
    }, [state.isAvailable]);

    const updateStudent = useCallback(async (id: string, data: Partial<StudentInfo>): Promise<void> => {
        if (!state.isAvailable) return;
        await studentService.update(id, data);
    }, [state.isAvailable]);

    const deleteStudent = useCallback(async (id: string): Promise<void> => {
        if (!state.isAvailable) return;
        await studentService.delete(id);
    }, [state.isAvailable]);

    const saveTransaction = useCallback(async (transaction: Transaction): Promise<void> => {
        if (!state.isAvailable) return;
        await transactionService.create(transaction);
    }, [state.isAvailable]);

    const saveNotice = useCallback(async (notice: Notice): Promise<void> => {
        if (!state.isAvailable) return;
        await noticeService.create(notice);
    }, [state.isAvailable]);

    const deleteNotice = useCallback(async (id: string): Promise<void> => {
        if (!state.isAvailable) return;
        await noticeService.delete(id);
    }, [state.isAvailable]);

    const saveQnAPost = useCallback(async (post: QnAPost): Promise<void> => {
        if (!state.isAvailable) return;
        await qnaService.create(post);
    }, [state.isAvailable]);

    const deleteQnAPost = useCallback(async (id: string): Promise<void> => {
        if (!state.isAvailable) return;
        await qnaService.delete(id);
    }, [state.isAvailable]);

    const savePopupNotice = useCallback(async (notice: PopupNotice): Promise<void> => {
        if (!state.isAvailable) return;
        await popupNoticeService.create(notice);
    }, [state.isAvailable]);

    const deletePopupNotice = useCallback(async (id: string): Promise<void> => {
        if (!state.isAvailable) return;
        await popupNoticeService.delete(id);
    }, [state.isAvailable]);

    return {
        // State
        ...state,

        // Auth methods
        register,
        login,
        loginWithGoogle,
        logout,
        sendPasswordReset,
        deleteAccount,

        // Data fetching
        fetchClasses,
        fetchStudents,
        fetchTransactions,
        fetchNotices,
        fetchQnAPosts,
        fetchPopupNotices,

        // Data mutations
        saveClass,
        deleteClass,
        saveStudents,
        updateStudent,
        deleteStudent,
        saveTransaction,
        saveNotice,
        deleteNotice,
        saveQnAPost,
        deleteQnAPost,
        savePopupNotice,
        deletePopupNotice,
    };
};
