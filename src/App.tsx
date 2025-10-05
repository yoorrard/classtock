import React, { useState, useMemo, useEffect } from 'react';
import { View, Stock, ClassInfo, StudentInfo, Transaction, ToastMessage, Notice, QnAPost } from './types';
import { mockStockData, mockNotices, mockQandAPosts } from './data';

import LandingPage from './components/landing/LandingPage';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import ClassDetailView from './components/teacher/ClassDetailView';
import StudentDashboard from './components/student/StudentDashboard';
import NoticeBoard from './components/public/NoticeBoard';
import QnABoard from './components/public/QnABoard';
import AdminDashboard from './components/admin/AdminDashboard';
import { ToastContainer } from './components/shared/Toast';

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
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);
    const [currentTeacherEmail, setCurrentTeacherEmail] = useState<string | null>(null);
    
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
    
    // --- AUTO PRICE UPDATE (KST 16:10 Daily) ---
    useEffect(() => {
        const lastUpdateDateStr = localStorage.getItem('classstock_lastUpdateDate');
        
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
        const KST_OFFSET = 9 * 60 * 60 * 1000;
        const kstNow = new Date(utc + KST_OFFSET);
        
        const todayKSTString = kstNow.toISOString().split('T')[0];

        const isUpdateTimePassed = kstNow.getUTCHours() > 16 || (kstNow.getUTCHours() === 16 && kstNow.getUTCMinutes() >= 10);
        
        let needsUpdate = false;
        if (!lastUpdateDateStr) {
            // First time user. Update if it's past update time.
            needsUpdate = isUpdateTimePassed;
        } else {
            // Returning user. Update if last update was before today AND it's past update time.
            needsUpdate = (lastUpdateDateStr < todayKSTString) && isUpdateTimePassed;
        }

        if (needsUpdate) {
            setStocks(prevStocks => prevStocks.map(stock => {
                const changePercent = (Math.random() - 0.45) * 0.1; // -4.5% to +5.5% change
                const newPrice = Math.max(100, Math.round(stock.price * (1 + changePercent) / 100) * 100);
                return { ...stock, price: newPrice };
            }));
            localStorage.setItem('classstock_lastUpdateDate', todayKSTString);
        } else if (!lastUpdateDateStr) {
            // First time user, but before update time.
            // Set last update to yesterday so it can update later today if they reopen.
            const yesterdayKST = new Date(kstNow.getTime());
            yesterdayKST.setUTCDate(yesterdayKST.getUTCDate() - 1);
            localStorage.setItem('classstock_lastUpdateDate', yesterdayKST.toISOString().split('T')[0]);
        }
    }, []);


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
    const handleCreateClass = (newClassData: Omit<ClassInfo, 'id'>) => {
        if (classes.length >= 2) {
            addToast('학급은 최대 2개까지만 생성할 수 있습니다.', 'error');
            return;
        }
        const newClass: ClassInfo = { id: `C${Date.now()}`, ...newClassData };
        setClasses(prev => [...prev, newClass]);
        addToast(`'${newClass.name}' 학급이 생성되었습니다.`, 'success');
    };

    const handleDeleteClass = (classId: string) => {
        const studentIdsToDelete = students
            .filter(s => s.classId === classId)
            .map(s => s.id);

        setClasses(prev => prev.filter(c => c.id !== classId));
        setStudents(prev => prev.filter(s => s.classId !== classId));
        setTransactions(prev => prev.filter(t => !studentIdsToDelete.includes(t.studentId)));
        addToast('학급이 삭제되었습니다.', 'success');
    };

    const handleSelectClass = (classId: string) => {
        setSelectedClassId(classId);
        setView('class_detail');
    };
    
    const handleStudentJoin = (code: string, name: string) => {
        const classToJoin = classes.find(c => `C${c.id.substring(c.id.length - 6)}`.toLowerCase() === code.toLowerCase().trim());
        if (!classToJoin) {
            addToast('유효하지 않은 참여 코드입니다.', 'error');
            return;
        }
    
        const studentToLogin = students.find(s => 
            s.classId === classToJoin.id && 
            s.nickname.toLowerCase() === name.trim().toLowerCase()
        );
    
        if (studentToLogin) {
            setCurrentStudentId(studentToLogin.id);
            setView('student_dashboard');
            addToast(`'${classToJoin.name}'에 오신 것을 환영합니다!`, 'success');
        } else {
            addToast('학급에 등록된 이름이 아닙니다. 선생님께 확인해주세요.', 'error');
        }
    };
    
    const handleTeacherRegister = (email: string, password: string) => {
        // This is a placeholder for actual registration logic.
        // For this demo, we'll just log them in immediately after "registering".
        addToast('회원가입이 완료되었습니다. 자동으로 로그인됩니다.', 'success');
        setIsTeacherLoggedIn(true);
        setCurrentTeacherEmail(email);
        setView('teacher_dashboard');
    };

    const handleTeacherLogin = (email: string) => {
        setIsTeacherLoggedIn(true);
        setCurrentTeacherEmail(email); // In a real app, this would come from the login response
        setView('teacher_dashboard');
    };
    
    const handleBulkRegisterStudents = (classId: string, studentNames: string[]) => {
        const classInfo = classes.find(c => c.id === classId);
        if (!classInfo) return;
    
        const classStudents = students.filter(s => s.classId === classId);
        const existingNames = new Set(classStudents.map(s => s.nickname.toLowerCase()));
    
        const newStudents: StudentInfo[] = [];
        let duplicateCount = 0;
        
        studentNames.forEach(name => {
            const trimmedName = name.trim();
            if (trimmedName.length > 0 && !existingNames.has(trimmedName.toLowerCase())) {
                const newStudent: StudentInfo = {
                    id: `S${Date.now()}-${trimmedName}`,
                    nickname: trimmedName,
                    classId: classId,
                    cash: classInfo.seedMoney,
                    portfolio: [],
                };
                newStudents.push(newStudent);
                existingNames.add(trimmedName.toLowerCase());
            } else if (trimmedName.length > 0) {
                duplicateCount++;
            }
        });
    
        if (newStudents.length > 0) {
            setStudents(prev => [...prev, ...newStudents]);
        }
        
        let message = `${newStudents.length}명의 학생이 성공적으로 등록되었습니다.`;
        if (duplicateCount > 0) {
            message += ` (${duplicateCount}개의 중복된 이름은 제외)`;
        }
        addToast(message, 'success');
    };

    const handleDeleteStudent = (studentId: string) => {
        const studentToDelete = students.find(s => s.id === studentId);
        if (!studentToDelete) return;

        setStudents(prev => prev.filter(s => s.id !== studentId));
        setTransactions(prev => prev.filter(t => t.studentId !== studentId));
        addToast(`'${studentToDelete.nickname}' 학생이 학급에서 제외되었습니다.`, 'success');
    };

    const handleTrade = (studentId: string, stockCode: string, quantity: number, type: 'buy' | 'sell') => {
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
            commission = stock.price * quantity * (studentClass.commissionRate / 100);
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
    
        const updatedStudents = [...students];
        updatedStudents[studentIndex] = student;
        setStudents(updatedStudents);
    
        const newTransaction: Transaction = {
            id: `T${Date.now()}`, studentId, stockCode, stockName: stock.name, type, quantity, price: stock.price, timestamp: Date.now()
        };
        setTransactions(prev => [newTransaction, ...prev]);
        addToast(`'${stock.name}' ${type === 'buy' ? '매수' : '매도'} 주문이 체결되었습니다.`, 'success');
    };

    const handleAwardBonus = (studentIds: string[], amount: number, reason: string) => {
        setStudents(prev => 
            prev.map(s => 
                studentIds.includes(s.id) ? { ...s, cash: s.cash + amount } : s
            )
        );

        const newTransactions: Transaction[] = studentIds.map(studentId => ({
            id: `T${Date.now()}-${studentId}`,
            studentId,
            stockCode: "BONUS",
            stockName: "학급 보너스",
            type: 'bonus',
            quantity: 1,
            price: amount,
            timestamp: Date.now(),
            reason,
        }));
        
        setTransactions(prev => [...newTransactions, ...prev]);
        addToast(`${studentIds.length}명에게 보너스가 지급되었습니다.`, 'success');
    };
    
    const handleLogout = () => {
        setCurrentStudentId(null);
        setSelectedClassId(null);
        setIsTeacherLoggedIn(false);
        setCurrentTeacherEmail(null);
        setView('landing'); 
    };
    
    const handleAdminLogin = (password: string) => {
        if (password === 'admin') {
            setIsAdminLoggedIn(true);
            setView('admin_dashboard');
            addToast('관리자 모드로 로그인했습니다.', 'success');
        } else {
            addToast('비밀번호가 올바르지 않습니다.', 'error');
        }
    };
    
    const handleAdminLogout = () => {
        setIsAdminLoggedIn(false);
        setView('landing');
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
    
    // --- DERIVED STATE ---
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
                    classes={classes}
                    onCreateClass={handleCreateClass}
                    onSelectClass={handleSelectClass}
                    onDeleteClass={handleDeleteClass}
                    onNavigate={setView}
                    addToast={addToast}
                />;
            case 'class_detail':
                 if (!selectedClass) { setView('teacher_dashboard'); return null; }
                const classStudents = students
                    .filter(s => s.classId === selectedClass.id)
                    .map(s => {
                        const totalAssets = calculateTotalAssets(s, stocks);
                        const totalBonus = transactions
                            .filter(t => t.studentId === s.id && t.type === 'bonus')
                            .reduce((sum, t) => sum + t.price, 0);
                        const totalProfit = totalAssets - selectedClass.seedMoney - totalBonus;
                        const totalProfitRate = selectedClass.seedMoney > 0 ? (totalProfit / selectedClass.seedMoney) * 100 : 0;
                        return { ...s, totalAssets, totalProfit, totalProfitRate };
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
                        const totalBonus = transactions
                            .filter(t => t.studentId === s.id && t.type === 'bonus')
                            .reduce((sum, t) => sum + t.price, 0);
                        const totalProfit = totalAssets - studentClass.seedMoney - totalBonus;
                        const totalProfitRate = studentClass.seedMoney > 0 ? (totalProfit / studentClass.seedMoney) * 100 : 0;
                        return { ...s, totalAssets, totalProfit, totalProfitRate };
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
                    onSaveNotice={handleSaveNotice}
                    onDeleteNotice={handleDeleteNotice}
                    onAnswerQuestion={handleAnswerQuestion}
                    onDeleteQnAPost={handleDeleteQnAPost}
                    onLogout={handleAdminLogout}
                />;
            case 'landing':
            default: return <LandingPage
                notices={notices}
                onNavigate={setView}
                onStudentJoin={handleStudentJoin}
                onTeacherLogin={handleTeacherLogin}
                onTeacherRegister={handleTeacherRegister}
                onAdminLogin={handleAdminLogin}
                addToast={addToast}
            />;
        }
    };

    return <div className="app-container">
        {renderView()}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>;
};

export default App;