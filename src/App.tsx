import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { View, Stock, ClassInfo, StudentInfo, Transaction, ToastMessage, Notice, QnAPost, PopupNotice, Teacher } from './types';
import { mockStockData, mockNotices, mockQandAPosts, mockPopupNotices } from './data';
import { getStockData, getDataSourceInfo } from './services/stockService';
import { initializeFirebase, isFirebaseAvailable } from './firebase';
import { isFirebaseConfigured } from './firebase/config';
import { authService } from './firebase/auth';
import { adminService, teacherService, classService, studentService, transactionService } from './firebase/services';
import { ToastContainer } from './components/shared/Toast';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { setupGlobalErrorHandler, logError } from './services/errorService';

// Lazy load page components for better performance
const LandingPage = lazy(() => import('./components/landing/LandingPage'));
const TeacherDashboard = lazy(() => import('./components/teacher/TeacherDashboard'));
const ClassDetailView = lazy(() => import('./components/teacher/ClassDetailView'));
const StudentDashboard = lazy(() => import('./components/student/StudentDashboard'));
const NoticeBoard = lazy(() => import('./components/public/NoticeBoard'));
const QnABoard = lazy(() => import('./components/public/QnABoard'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

// Loading spinner component
const LoadingSpinner = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
    }}>
        <div>로딩 중...</div>
    </div>
);

const App: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [view, setView] = useState<View>('landing');
    const [stocks, setStocks] = useState<Stock[]>(mockStockData);
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [students, setStudents] = useState<StudentInfo[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [notices, setNotices] = useState<Notice[]>(mockNotices);
    const [qnaPosts, setQnaPosts] = useState<QnAPost[]>(mockQandAPosts);
    const [popupNotices, setPopupNotices] = useState<PopupNotice[]>(mockPopupNotices);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);
    const [currentTeacherEmail, setCurrentTeacherEmail] = useState<string | null>(null);
    const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(null);

    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
    const [dataSource, setDataSource] = useState<{ source: 'kis' | 'mock'; isLive: boolean }>({ source: 'mock', isLive: false });

    // Firebase 상태
    const [firebaseReady, setFirebaseReady] = useState(false);
    const [firebaseError, setFirebaseError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- STOCK DATA FETCHING ---
    const fetchStockData = useCallback(async () => {
        try {
            const stockData = await getStockData();
            setStocks(stockData);
            setDataSource(getDataSourceInfo());
        } catch (error) {
            logError(error instanceof Error ? error : new Error(String(error)), {
                type: 'stock_data_fetch',
                additionalInfo: { source: getDataSourceInfo().source }
            });
        }
    }, []);

    // Setup global error handler on mount
    useEffect(() => {
        setupGlobalErrorHandler();
    }, []);

    // Firebase 초기화 및 인증 상태 감시
    useEffect(() => {
        const initApp = async () => {
            // Firebase 설정 확인
            if (!isFirebaseConfigured()) {
                setFirebaseError('Firebase 설정이 필요합니다. .env 파일에 Firebase 구성 값을 설정해주세요.');
                setIsLoading(false);
                return;
            }

            try {
                // Firebase 초기화
                initializeFirebase();

                if (!isFirebaseAvailable()) {
                    setFirebaseError('Firebase를 초기화할 수 없습니다. 설정을 확인해주세요.');
                    setIsLoading(false);
                    return;
                }

                setFirebaseReady(true);

                // 인증 상태 변화 감지
                const unsubscribe = authService.onAuthStateChanged(async (user) => {
                    if (user) {
                        // 로그인된 상태
                        setCurrentTeacherEmail(user.email);
                        setCurrentTeacherId(user.uid);

                        // 관리자 확인
                        const isAdmin = await adminService.isAdmin(user.email || '');
                        if (isAdmin) {
                            setIsAdminLoggedIn(true);
                            setIsTeacherLoggedIn(false);
                            setView('admin_dashboard');
                        } else {
                            setIsAdminLoggedIn(false);
                            setIsTeacherLoggedIn(true);

                            // 교사 데이터 및 학급 데이터 로드
                            await loadTeacherData(user.uid, user.email || '');
                            setView('teacher_dashboard');
                        }
                    } else {
                        // 로그아웃 상태
                        setCurrentTeacherEmail(null);
                        setCurrentTeacherId(null);
                        setIsTeacherLoggedIn(false);
                        setIsAdminLoggedIn(false);
                        setClasses([]);
                        setStudents([]);
                        setTransactions([]);
                    }
                    setIsLoading(false);
                });

                return () => unsubscribe();
            } catch (error) {
                logError(error instanceof Error ? error : new Error(String(error)), {
                    type: 'firebase_init',
                    additionalInfo: { message: 'Firebase 초기화 실패' }
                });
                setFirebaseError('Firebase 초기화 중 오류가 발생했습니다.');
                setIsLoading(false);
            }
        };

        initApp();
    }, []);

    // 교사 데이터 로드 함수
    const loadTeacherData = async (teacherId: string, teacherEmail: string) => {
        try {
            // 교사의 학급 목록 로드
            const teacherClasses = await classService.getByTeacherEmail(teacherEmail);
            setClasses(teacherClasses);

            // 각 학급의 학생 및 거래 데이터 로드
            const allStudents: StudentInfo[] = [];
            const allTransactions: Transaction[] = [];

            for (const classInfo of teacherClasses) {
                const classStudents = await studentService.getByClassId(classInfo.id);
                allStudents.push(...classStudents);

                for (const student of classStudents) {
                    const studentTransactions = await transactionService.getByStudentId(student.id);
                    allTransactions.push(...studentTransactions);
                }
            }

            setStudents(allStudents);
            setTransactions(allTransactions);
        } catch (error) {
            logError(error instanceof Error ? error : new Error(String(error)), {
                type: 'data_load',
                additionalInfo: { teacherId, teacherEmail }
            });
            addToast('데이터를 불러오는 중 오류가 발생했습니다.', 'error');
        }
    };

    // Initial fetch and periodic updates
    useEffect(() => {
        // Initial fetch
        fetchStockData();

        // Update every minute if using real data, every 5 minutes otherwise
        const info = getDataSourceInfo();
        const interval = info.source === 'kis' && info.isLive ? 60000 : 300000;

        const timer = setInterval(fetchStockData, interval);
        return () => clearInterval(timer);
    }, [fetchStockData]);


    // --- HELPER FUNCTIONS ---
    const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const dismissToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const isActivityActive = (classInfo: ClassInfo | null): boolean => {
        if (!classInfo || !classInfo.startDate || !classInfo.endDate) return false;
        
        const now = new Date();
        const startDate = new Date(`${classInfo.startDate}T00:00:00+09:00`); 
        const endDate = new Date(`${classInfo.endDate}T23:59:59+09:00`); 
        
        return now >= startDate && now <= endDate;
    };

    const calculateTotalAssets = (student: StudentInfo, currentStocks: Stock[]): number => {
        const stockValue = student.portfolio.reduce((acc, item) => {
            const stock = currentStocks.find(s => s.code === item.stockCode);
            return acc + (stock ? stock.price * item.quantity : 0);
        }, 0);
        return student.cash + stockValue;
    };

    // --- HANDLER FUNCTIONS ---
    const handleCreateClass = async (newClassData: Omit<ClassInfo, 'id' | 'teacherEmail'>) => {
        if (!currentTeacherEmail) {
            addToast('로그인이 필요합니다.', 'error');
            return;
        }

        // Count classes owned by current teacher
        const teacherClassList = classes.filter(c => c.teacherEmail === currentTeacherEmail);
        if (teacherClassList.length >= 2) {
            addToast('학급은 최대 2개까지만 생성할 수 있습니다.', 'error');
            return;
        }

        try {
            const newClass: ClassInfo = {
                id: `C${Date.now()}`,
                ...newClassData,
                teacherEmail: currentTeacherEmail
            };

            // Firestore에 저장
            await classService.create(newClass);
            setClasses(prev => [...prev, newClass]);
            addToast(`'${newClass.name}' 학급이 생성되었습니다.`, 'success');
        } catch (error) {
            logError(error instanceof Error ? error : new Error(String(error)), {
                type: 'class_create',
                additionalInfo: { teacherEmail: currentTeacherEmail }
            });
            addToast('학급 생성 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleDeleteClass = async (classId: string) => {
        try {
            const classStudents = students.filter(s => s.classId === classId);

            // 학급 내 학생들의 거래 내역 삭제
            for (const student of classStudents) {
                const studentTransactions = transactions.filter(t => t.studentId === student.id);
                for (const tx of studentTransactions) {
                    await transactionService.delete(tx.id);
                }
                // 학생 삭제
                await studentService.delete(student.id);
            }

            // 학급 삭제
            await classService.delete(classId);

            // 로컬 상태 업데이트
            const studentIdsToDelete = classStudents.map(s => s.id);
            setClasses(prev => prev.filter(c => c.id !== classId));
            setStudents(prev => prev.filter(s => s.classId !== classId));
            setTransactions(prev => prev.filter(t => !studentIdsToDelete.includes(t.studentId)));

            addToast('학급이 삭제되었습니다.', 'success');
        } catch (error) {
            logError(error instanceof Error ? error : new Error(String(error)), {
                type: 'class_delete',
                additionalInfo: { classId }
            });
            addToast('학급 삭제 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleSelectClass = (classId: string) => {
        setSelectedClassId(classId);
        setView('class_detail');
    };
    
    const handleStudentJoin = async (code: string, name: string) => {
        try {
            // 모든 학급에서 코드로 검색
            const allClasses = await classService.getAll();
            const classToJoin = allClasses.find(c =>
                `C${c.id.substring(c.id.length - 6)}`.toLowerCase() === code.toLowerCase().trim()
            );

            if (!classToJoin) {
                addToast('유효하지 않은 참여 코드입니다.', 'error');
                return;
            }

            // 학급의 학생 목록 로드
            const classStudents = await studentService.getByClassId(classToJoin.id);
            const studentToLogin = classStudents.find(s =>
                s.nickname.toLowerCase() === name.trim().toLowerCase()
            );

            if (studentToLogin) {
                // 학생의 거래 내역 로드
                const studentTransactions = await transactionService.getByStudentId(studentToLogin.id);

                // 로컬 상태 업데이트
                setClasses([classToJoin]);
                setStudents(classStudents);
                setTransactions(studentTransactions);
                setCurrentStudentId(studentToLogin.id);
                setView('student_dashboard');

                addToast(`'${classToJoin.name}'에 오신 것을 환영합니다!`, 'success');
            } else {
                addToast('학급에 등록된 이름이 아닙니다. 선생님께 확인해주세요.', 'error');
            }
        } catch (error) {
            logError(error instanceof Error ? error : new Error(String(error)), {
                type: 'student_join',
                additionalInfo: { code }
            });
            addToast('학급 참여 중 오류가 발생했습니다.', 'error');
        }
    };
    
    const handleTeacherRegister = async (email: string, password: string) => {
        if (!firebaseReady) {
            addToast('서비스가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.', 'error');
            return;
        }

        try {
            // Firebase Auth로 회원가입
            const user = await authService.register(email, password);

            // Firestore에 교사 정보 저장
            await teacherService.create({
                id: user.uid,
                email: user.email || email,
                createdAt: Date.now()
            });

            addToast('회원가입이 완료되었습니다.', 'success');
            // onAuthStateChanged에서 자동으로 로그인 처리됨
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.';

            // Firebase Auth 에러 메시지 한글화
            let koreanMessage = errorMessage;
            if (errorMessage.includes('email-already-in-use')) {
                koreanMessage = '이미 등록된 이메일입니다.';
            } else if (errorMessage.includes('weak-password')) {
                koreanMessage = '비밀번호는 6자 이상이어야 합니다.';
            } else if (errorMessage.includes('invalid-email')) {
                koreanMessage = '유효하지 않은 이메일 형식입니다.';
            }

            logError(error instanceof Error ? error : new Error(String(error)), {
                type: 'auth_register',
                additionalInfo: { email }
            });
            addToast(koreanMessage, 'error');
        }
    };

    const handleTeacherLogin = async (email: string, password: string) => {
        if (!firebaseReady) {
            addToast('서비스가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.', 'error');
            return;
        }

        try {
            // Firebase Auth로 로그인
            await authService.login(email, password);
            // onAuthStateChanged에서 자동으로 로그인 후 처리됨
            addToast('로그인 성공!', 'success');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';

            // Firebase Auth 에러 메시지 한글화
            let koreanMessage = errorMessage;
            if (errorMessage.includes('user-not-found')) {
                koreanMessage = '등록되지 않은 이메일입니다.';
            } else if (errorMessage.includes('wrong-password') || errorMessage.includes('invalid-credential')) {
                koreanMessage = '이메일 또는 비밀번호가 일치하지 않습니다.';
            } else if (errorMessage.includes('invalid-email')) {
                koreanMessage = '유효하지 않은 이메일 형식입니다.';
            } else if (errorMessage.includes('too-many-requests')) {
                koreanMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
            }

            logError(error instanceof Error ? error : new Error(String(error)), {
                type: 'auth_login',
                additionalInfo: { email }
            });
            addToast(koreanMessage, 'error');
        }
    };

    const handleTeacherWithdraw = async () => {
        if (!currentTeacherEmail || !currentTeacherId) return;

        try {
            // 교사의 학급 목록 가져오기
            const teacherClassIds = classes
                .filter(c => c.teacherEmail === currentTeacherEmail)
                .map(c => c.id);

            // 각 학급의 학생과 거래 데이터 삭제
            for (const classId of teacherClassIds) {
                const classStudents = students.filter(s => s.classId === classId);
                for (const student of classStudents) {
                    // 학생의 거래 내역 삭제
                    const studentTransactions = await transactionService.getByStudentId(student.id);
                    for (const tx of studentTransactions) {
                        await transactionService.delete(tx.id);
                    }
                    // 학생 삭제
                    await studentService.delete(student.id);
                }
                // 학급 삭제
                await classService.delete(classId);
            }

            // 교사 정보 삭제
            await teacherService.delete(currentTeacherId);

            // Firebase Auth 계정 삭제
            await authService.deleteAccount();

            // 로컬 상태 초기화
            setClasses([]);
            setStudents([]);
            setTransactions([]);
            setIsTeacherLoggedIn(false);
            setCurrentTeacherEmail(null);
            setCurrentTeacherId(null);
            setView('landing');

            addToast('회원 탈퇴가 완료되었습니다.', 'success');
        } catch (error: unknown) {
            logError(error instanceof Error ? error : new Error(String(error)), {
                type: 'teacher_withdraw',
                additionalInfo: { email: currentTeacherEmail }
            });
            addToast('회원 탈퇴 중 오류가 발생했습니다.', 'error');
        }
    };
    
    const handleBulkRegisterStudents = async (classId: string, studentNames: string[]) => {
        const classInfo = classes.find(c => c.id === classId);
        if (!classInfo) return;

        try {
            const classStudents = students.filter(s => s.classId === classId);
            const existingNames = new Set(classStudents.map(s => s.nickname.toLowerCase()));

            const newStudents: StudentInfo[] = [];
            let duplicateCount = 0;

            for (const name of studentNames) {
                const trimmedName = name.trim();
                if (trimmedName.length > 0 && !existingNames.has(trimmedName.toLowerCase())) {
                    const newStudent: StudentInfo = {
                        id: `S${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        nickname: trimmedName,
                        classId: classId,
                        cash: classInfo.seedMoney,
                        portfolio: [],
                    };

                    // Firestore에 저장
                    await studentService.create(newStudent);
                    newStudents.push(newStudent);
                    existingNames.add(trimmedName.toLowerCase());
                } else if (trimmedName.length > 0) {
                    duplicateCount++;
                }
            }

            if (newStudents.length > 0) {
                setStudents(prev => [...prev, ...newStudents]);
            }

            let message = `${newStudents.length}명의 학생이 성공적으로 등록되었습니다.`;
            if (duplicateCount > 0) {
                message += ` (${duplicateCount}개의 중복된 이름은 제외)`;
            }
            addToast(message, 'success');
        } catch (error) {
            logError(error instanceof Error ? error : new Error(String(error)), {
                type: 'student_bulk_register',
                additionalInfo: { classId, count: studentNames.length }
            });
            addToast('학생 등록 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleDeleteStudent = async (studentId: string) => {
        const studentToDelete = students.find(s => s.id === studentId);
        if (!studentToDelete) return;

        try {
            // 학생의 거래 내역 삭제
            const studentTransactions = transactions.filter(t => t.studentId === studentId);
            for (const tx of studentTransactions) {
                await transactionService.delete(tx.id);
            }

            // 학생 삭제
            await studentService.delete(studentId);

            // 로컬 상태 업데이트
            setStudents(prev => prev.filter(s => s.id !== studentId));
            setTransactions(prev => prev.filter(t => t.studentId !== studentId));

            addToast(`'${studentToDelete.nickname}' 학생이 학급에서 제외되었습니다.`, 'success');
        } catch (error) {
            logError(error instanceof Error ? error : new Error(String(error)), {
                type: 'student_delete',
                additionalInfo: { studentId }
            });
            addToast('학생 삭제 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleTrade = async (studentId: string, stockCode: string, quantity: number, type: 'buy' | 'sell') => {
        const studentIndex = students.findIndex(s => s.id === studentId);
        const stock = stocks.find(s => s.code === stockCode);
        if (studentIndex === -1 || !stock) return;

        const originalStudent = students[studentIndex];
        const studentClass = classes.find(c => c.id === originalStudent.classId);

        if (!isActivityActive(studentClass)) {
            addToast('현재는 활동 기간이 아닙니다.', 'error');
            return;
        }

        const student = { ...originalStudent, portfolio: [...originalStudent.portfolio] };

        let commission = 0;
        if (studentClass && studentClass.hasCommission) {
            commission = Math.trunc(stock.price * quantity * (studentClass.commissionRate / 100));
        }

        if (type === 'buy') {
            const totalCost = stock.price * quantity + commission;
            if (student.cash < totalCost) {
                addToast('현금이 부족합니다.', 'error');
                return;
            }

            student.cash -= totalCost;
            const existingHoldingIndex = student.portfolio.findIndex(p => p.stockCode === stockCode);
            if (existingHoldingIndex > -1) {
                const existing = student.portfolio[existingHoldingIndex];
                const totalQuantity = existing.quantity + quantity;
                const newAveragePrice = ((existing.averagePrice * existing.quantity) + (stock.price * quantity)) / totalQuantity;
                student.portfolio[existingHoldingIndex] = { ...existing, quantity: totalQuantity, averagePrice: newAveragePrice };
            } else {
                student.portfolio.push({ stockCode, quantity, averagePrice: stock.price });
            }
        } else { // sell
            const existingHoldingIndex = student.portfolio.findIndex(p => p.stockCode === stockCode);
            const existingHolding = existingHoldingIndex > -1 ? student.portfolio[existingHoldingIndex] : null;
            if (!existingHolding || existingHolding.quantity < quantity) {
                addToast('보유 수량이 부족합니다.', 'error');
                return;
            }

            student.cash += (stock.price * quantity) - commission;
            const newQuantity = existingHolding.quantity - quantity;

            if (newQuantity > 0) {
                student.portfolio[existingHoldingIndex] = { ...existingHolding, quantity: newQuantity };
            } else {
                student.portfolio = student.portfolio.filter(p => p.stockCode !== stockCode);
            }
        }

        try {
            // Firestore에 학생 정보 업데이트
            await studentService.update(studentId, {
                cash: student.cash,
                portfolio: student.portfolio
            });

            // 거래 내역 저장
            const newTransaction: Transaction = {
                id: `T${Date.now()}`,
                studentId,
                stockCode,
                stockName: stock.name,
                type,
                quantity,
                price: stock.price,
                timestamp: Date.now()
            };
            await transactionService.create(newTransaction);

            // 로컬 상태 업데이트
            const updatedStudents = [...students];
            updatedStudents[studentIndex] = student;
            setStudents(updatedStudents);
            setTransactions(prev => [newTransaction, ...prev]);

            addToast(`'${stock.name}' ${type === 'buy' ? '매수' : '매도'} 주문이 체결되었습니다.`, 'success');
        } catch (error) {
            logError(error instanceof Error ? error : new Error(String(error)), {
                type: 'trade',
                additionalInfo: { studentId, stockCode, type, quantity }
            });
            addToast('거래 처리 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleAwardBonus = async (studentIds: string[], amount: number, reason: string) => {
        try {
            const newTransactions: Transaction[] = [];

            for (const studentId of studentIds) {
                const student = students.find(s => s.id === studentId);
                if (!student) continue;

                // 학생 현금 업데이트
                const newCash = student.cash + amount;
                await studentService.update(studentId, { cash: newCash });

                // 보너스 거래 내역 생성
                const newTransaction: Transaction = {
                    id: `T${Date.now()}-${studentId}`,
                    studentId,
                    stockCode: "BONUS",
                    stockName: "학급 보너스",
                    type: 'bonus',
                    quantity: 1,
                    price: amount,
                    timestamp: Date.now(),
                    reason,
                };
                await transactionService.create(newTransaction);
                newTransactions.push(newTransaction);
            }

            // 로컬 상태 업데이트
            setStudents(prev =>
                prev.map(s =>
                    studentIds.includes(s.id) ? { ...s, cash: s.cash + amount } : s
                )
            );
            setTransactions(prev => [...newTransactions, ...prev]);

            addToast(`${studentIds.length}명에게 보너스가 지급되었습니다.`, 'success');
        } catch (error) {
            logError(error instanceof Error ? error : new Error(String(error)), {
                type: 'bonus_award',
                additionalInfo: { studentIds, amount, reason }
            });
            addToast('보너스 지급 중 오류가 발생했습니다.', 'error');
        }
    };
    
    const handleLogout = async () => {
        try {
            // 학생 로그아웃 (인증 필요 없음)
            if (currentStudentId) {
                setCurrentStudentId(null);
                setView('landing');
                return;
            }

            // 교사/관리자 Firebase Auth 로그아웃
            await authService.logout();

            // 로컬 상태 초기화 (onAuthStateChanged에서도 처리되지만 명시적으로)
            setSelectedClassId(null);
            setIsTeacherLoggedIn(false);
            setIsAdminLoggedIn(false);
            setCurrentTeacherEmail(null);
            setCurrentTeacherId(null);
            setClasses([]);
            setStudents([]);
            setTransactions([]);
            setView('landing');
        } catch (error) {
            logError(error instanceof Error ? error : new Error(String(error)), {
                type: 'logout',
                additionalInfo: {}
            });
            addToast('로그아웃 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleAdminLogout = async () => {
        await handleLogout();
    };

    const handleSaveNotice = (notice: Notice) => {
        setNotices(prev => {
            const index = prev.findIndex(n => n.id === notice.id);
            if (index > -1) {
                const updated = [...prev];
                updated[index] = notice;
                return updated.sort((a,b) => b.createdAt - a.createdAt);
            } else {
                return [notice, ...prev].sort((a,b) => b.createdAt - a.createdAt);
            }
        });
        addToast('공지사항이 저장되었습니다.', 'success');
    };

    const handleDeleteNotice = (noticeId: string) => {
        setNotices(prev => prev.filter(n => n.id !== noticeId));
        addToast('공지사항이 삭제되었습니다.', 'success');
    };

    const handleAskQuestion = (postData: { title: string; question: string; isSecret: boolean; }) => {
        if (!isTeacherLoggedIn || !currentTeacherEmail) {
            addToast('질문을 등록하려면 로그인이 필요합니다.', 'error');
            return;
        }

        const newPost: QnAPost = {
            id: `Q${Date.now()}`,
            createdAt: Date.now(),
            author: currentTeacherEmail.split('@')[0],
            authorEmail: currentTeacherEmail,
            ...postData
        };
        setQnaPosts(prev => [newPost, ...prev].sort((a,b) => b.createdAt - a.createdAt));
        addToast('질문이 등록되었습니다. 관리자가 확인 후 답변을 드릴 예정입니다.', 'success');
    };
    
    const handleAnswerQuestion = (qnaId: string, answer: string) => {
        setQnaPosts(prev => prev.map(p => p.id === qnaId ? { ...p, answer, answeredAt: Date.now() } : p));
        addToast('답변이 저장되었습니다.', 'success');
    };

    const handleDeleteQnAPost = (qnaId: string) => {
        setQnaPosts(prev => prev.filter(p => p.id !== qnaId));
        addToast('Q&A 게시글이 삭제되었습니다.', 'success');
    };

    const handleSavePopupNotice = (notice: PopupNotice) => {
        setPopupNotices(prev => {
            const index = prev.findIndex(n => n.id === notice.id);
            if (index > -1) {
                const updated = [...prev];
                updated[index] = notice;
                return updated;
            } else {
                return [notice, ...prev];
            }
        });
        addToast('팝업 공지가 저장되었습니다.', 'success');
    };

    const handleDeletePopupNotice = (noticeId: string) => {
        setPopupNotices(prev => prev.filter(n => n.id !== noticeId));
        addToast('팝업 공지가 삭제되었습니다.', 'success');
    };
    
    // --- DERIVED STATE ---
    const teacherClasses = currentTeacherEmail
        ? classes.filter(c => c.teacherEmail === currentTeacherEmail)
        : [];
    const selectedClass = classes.find(c => c.id === selectedClassId);
    const currentStudent = students.find(s => s.id === currentStudentId);
    const studentClass = currentStudent ? classes.find(c => c.id === currentStudent.classId) : null;

    // --- RENDER LOGIC ---
    const renderView = () => {
        const teacherContextBack = () => setView('teacher_dashboard');
        const landingContextBack = () => setView('landing');

        switch (view) {
            case 'teacher_dashboard':
                return <TeacherDashboard
                    onBack={handleLogout}
                    classes={teacherClasses}
                    onCreateClass={handleCreateClass}
                    onSelectClass={handleSelectClass}
                    onDeleteClass={handleDeleteClass}
                    onNavigate={setView}
                    addToast={addToast}
                    currentTeacherEmail={currentTeacherEmail}
                    onWithdraw={handleTeacherWithdraw}
                />;
            case 'class_detail':
                 if (!selectedClass) { setView('teacher_dashboard'); return null; }
                const classStudents = students
                    .filter(s => s.classId === selectedClass.id)
                    .map(s => {
                        const totalAssets = calculateTotalAssets(s, stocks);
                        const totalProfit = Math.trunc(totalAssets - selectedClass.seedMoney);
                        const totalProfitRate = selectedClass.seedMoney > 0 ? (totalProfit / selectedClass.seedMoney) * 100 : 0;
                        
                        const studentTransactions = transactions.filter(t => t.studentId === s.id);
                        const totalBonus = studentTransactions
                            .filter(t => t.type === 'bonus')
                            .reduce((acc, t) => acc + t.price, 0);

                        const investmentProfit = totalProfit - totalBonus;
                        const investmentProfitRate = selectedClass.seedMoney > 0 ? (investmentProfit / selectedClass.seedMoney) * 100 : 0;

                        return { ...s, totalAssets, totalProfit, totalProfitRate, investmentProfit, investmentProfitRate };
                    });

                return <ClassDetailView 
                    classInfo={selectedClass} 
                    students={classStudents}
                    stocks={stocks}
                    transactions={transactions}
                    onAwardBonus={handleAwardBonus}
                    onBack={() => { setSelectedClassId(null); setView('teacher_dashboard'); }}
                    addToast={addToast}
                    onBulkRegister={handleBulkRegisterStudents}
                    onDeleteStudent={handleDeleteStudent}
                />;
            case 'student_dashboard':
                if (!currentStudent || !studentClass) { setView('landing'); return null; }
                 const classStudentsForRanking = students
                    .filter(s => s.classId === studentClass.id)
                    .map(s => {
                        const totalAssets = calculateTotalAssets(s, stocks);
                        const totalProfit = Math.trunc(totalAssets - studentClass.seedMoney);
                        const totalProfitRate = studentClass.seedMoney > 0 ? (totalProfit / studentClass.seedMoney) * 100 : 0;
                        
                        const studentTransactions = transactions.filter(t => t.studentId === s.id);
                        const totalBonus = studentTransactions
                            .filter(t => t.type === 'bonus')
                            .reduce((acc, t) => acc + t.price, 0);

                        const investmentProfit = totalProfit - totalBonus;
                        const investmentProfitRate = studentClass.seedMoney > 0 ? (investmentProfit / studentClass.seedMoney) * 100 : 0;

                        return { ...s, totalAssets, totalProfit, totalProfitRate, investmentProfit, investmentProfitRate };
                    });
                const studentWithAssets = {...currentStudent, totalAssets: calculateTotalAssets(currentStudent, stocks)};

                return <StudentDashboard 
                    student={studentWithAssets}
                    classInfo={studentClass}
                    stocks={stocks}
                    transactions={transactions.filter(t => t.studentId === currentStudent.id)}
                    classRanking={classStudentsForRanking}
                    onTrade={handleTrade}
                    onLogout={handleLogout}
                    isTradingActive={isActivityActive(studentClass)}
                />;
            case 'notice_board':
                return <NoticeBoard 
                    notices={notices} 
                    onBack={isTeacherLoggedIn ? teacherContextBack : landingContextBack} 
                    onNavigate={setView}
                    addToast={addToast}
                    context={isTeacherLoggedIn ? 'teacher' : 'landing'}
                />;
            case 'qna_board':
                return <QnABoard 
                    posts={qnaPosts} 
                    onAskQuestion={handleAskQuestion} 
                    onBack={isTeacherLoggedIn ? teacherContextBack : landingContextBack} 
                    addToast={addToast} 
                    onNavigate={setView}
                    context={isTeacherLoggedIn ? 'teacher' : 'landing'}
                    currentUserEmail={currentTeacherEmail}
                />;
            case 'admin_dashboard':
                if (!isAdminLoggedIn) { setView('landing'); return null; }
                return <AdminDashboard 
                    notices={notices}
                    qnaPosts={qnaPosts}
                    popupNotices={popupNotices}
                    onSaveNotice={handleSaveNotice}
                    onDeleteNotice={handleDeleteNotice}
                    onAnswerQuestion={handleAnswerQuestion}
                    onDeleteQnAPost={handleDeleteQnAPost}
                    onSavePopupNotice={handleSavePopupNotice}
                    onDeletePopupNotice={handleDeletePopupNotice}
                    onLogout={handleAdminLogout}
                />;
            case 'landing':
            default: return <LandingPage
                notices={notices}
                popupNotices={popupNotices}
                onNavigate={setView}
                onStudentJoin={handleStudentJoin}
                onTeacherLogin={handleTeacherLogin}
                onTeacherRegister={handleTeacherRegister}
                addToast={addToast}
            />;
        }
    };

    // Firebase 에러 화면
    if (firebaseError) {
        return (
            <ErrorBoundary>
                <div className="app-container">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        padding: '2rem',
                        textAlign: 'center',
                        backgroundColor: '#f8f9fa'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '3rem',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            maxWidth: '500px'
                        }}>
                            <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>서비스 설정 필요</h1>
                            <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
                                {firebaseError}
                            </p>
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                textAlign: 'left',
                                fontSize: '0.9rem'
                            }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>설정 방법:</p>
                                <ol style={{ paddingLeft: '1.2rem', margin: 0, lineHeight: '1.8' }}>
                                    <li>Firebase 콘솔에서 프로젝트 생성</li>
                                    <li>웹 앱 등록 및 설정 값 복사</li>
                                    <li>.env 파일 생성 후 설정 값 입력</li>
                                    <li>앱 재시작</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        );
    }

    // 로딩 중
    if (isLoading) {
        return (
            <ErrorBoundary>
                <div className="app-container">
                    <LoadingSpinner />
                </div>
            </ErrorBoundary>
        );
    }

    return (
        <ErrorBoundary>
            <div className="app-container">
                <Suspense fallback={<LoadingSpinner />}>
                    {renderView()}
                </Suspense>
                <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            </div>
        </ErrorBoundary>
    );
};

export default App;