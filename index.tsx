import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// --- DATA TYPES ---
type View = 'landing' | 'teacher_dashboard' | 'class_detail' | 'student_dashboard';

interface Stock { code: string; name: string; price: number; }
interface ClassInfo {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    seedMoney: number;
    allowedStocks: string[]; // Array of stock codes
}
interface PortfolioItem { stockCode: string; quantity: number; averagePrice: number; }
interface StudentInfo {
    id: string;
    nickname: string;
    password: string; // Added for login
    classId: string;
    cash: number;
    portfolio: PortfolioItem[];
}
interface Transaction {
    id: string;
    studentId: string;
    stockCode: string;
    stockName: string;
    type: 'buy' | 'sell' | 'bonus';
    quantity: number;
    price: number;
    timestamp: number;
    reason?: string;
}
type TradeType = 'buy' | 'sell';
interface TradeInfo { type: TradeType; stock: Stock; }


// --- MOCK DATA ---
const mockStockData: Stock[] = [
    { code: '005930', name: '삼성전자', price: 81000 },
    { code: '000660', name: 'SK하이닉스', price: 180000 },
    { code: '051910', name: 'LG화학', price: 450000 },
    { code: '005380', name: '현대차', price: 250000 },
    { code: '035420', name: 'NAVER', price: 190000 },
    { code: '035720', name: '카카오', price: 50000 },
    { code: '207940', name: '삼성바이오로직스', price: 800000 },
    { code: '068270', name: '셀트리온', price: 180000 },
    { code: '005490', name: 'POSCO홀딩스', price: 400000 },
    { code: '028260', name: '삼성물산', price: 130000 },
];

const App: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [view, setView] = useState<View>('landing');
    const [stocks, setStocks] = useState<Stock[]>(mockStockData);
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [students, setStudents] = useState<StudentInfo[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
    
    // --- AUTO TIME SIMULATION (KST 4 PM) ---
    useEffect(() => {
        const lastUpdateTimestampStr = localStorage.getItem('classstock_lastUpdateTime');
        const now = new Date();

        const calculateDaysToSimulate = (lastTime: number, currentTime: number): number => {
            const KST_OFFSET = 9 * 60 * 60 * 1000;
            const KST_UPDATE_HOUR = 16;
            
            const lastDate = new Date(lastTime);
            const currentDate = new Date(currentTime);
            
            const getUpdatePointFor = (date: Date): Date => {
                const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
                const kstTime = new Date(utc + KST_OFFSET);
                
                const updatePoint = new Date(kstTime);
                updatePoint.setHours(KST_UPDATE_HOUR, 0, 0, 0);

                if (kstTime < updatePoint) {
                    updatePoint.setDate(updatePoint.getDate() - 1);
                }
                return updatePoint;
            };

            const lastUpdatePoint = getUpdatePointFor(lastDate);
            const currentUpdatePoint = getUpdatePointFor(currentDate);

            lastUpdatePoint.setHours(12,0,0,0);
            currentUpdatePoint.setHours(12,0,0,0);

            const diffTime = currentUpdatePoint.getTime() - lastUpdatePoint.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            return Math.max(0, diffDays);
        };

        if (lastUpdateTimestampStr) {
            const lastUpdateTime = parseInt(lastUpdateTimestampStr, 10);
            const daysToSimulate = calculateDaysToSimulate(lastUpdateTime, now.getTime());

            if (daysToSimulate > 0) {
                let currentStocks = stocks;
                for (let i = 0; i < daysToSimulate; i++) {
                    currentStocks = currentStocks.map(stock => {
                        const changePercent = (Math.random() - 0.45) * 0.1; // -4.5% to +5.5% change
                        const newPrice = Math.max(100, Math.round(stock.price * (1 + changePercent) / 100) * 100);
                        return { ...stock, price: newPrice };
                    });
                }
                setStocks(currentStocks);
            }
        }
        
        localStorage.setItem('classstock_lastUpdateTime', now.getTime().toString());
        
    }, []);


    // --- HELPER FUNCTIONS ---
    const calculateTotalAssets = (student: StudentInfo, currentStocks: Stock[]): number => {
        const stockValue = student.portfolio.reduce((acc, item) => {
            const stock = currentStocks.find(s => s.code === item.stockCode);
            return acc + (stock ? stock.price * item.quantity : 0);
        }, 0);
        return student.cash + stockValue;
    };

    // --- HANDLER FUNCTIONS ---
    const handleCreateClass = (newClassData: Omit<ClassInfo, 'id' | 'allowedStocks'>) => {
        const newClass: ClassInfo = { id: `C${Date.now()}`, allowedStocks: [], ...newClassData, };
        setClasses(prev => [...prev, newClass]);
    };

    const handleSelectClass = (classId: string) => {
        setSelectedClassId(classId);
        setView('class_detail');
    };
    
    const handleStudentRegister = (code: string, nickname: string, password: string) => {
        const classToJoin = classes.find(c => `C${c.id.substring(c.id.length - 6)}`.toLowerCase() === code.toLowerCase().trim());
        if (!classToJoin) {
            alert('유효하지 않은 참여 코드입니다.');
            return;
        }

        const isNicknameTaken = students.some(s => s.classId === classToJoin.id && s.nickname.toLowerCase() === nickname.trim().toLowerCase());
        if (isNicknameTaken) {
            alert('해당 학급에서 이미 사용 중인 아이디입니다.');
            return;
        }
        
        const newStudent: StudentInfo = {
            id: `S${Date.now()}`,
            nickname: nickname.trim(),
            password,
            classId: classToJoin.id,
            cash: classToJoin.seedMoney,
            portfolio: [],
        };
        setStudents(prev => [...prev, newStudent]);
        setCurrentStudentId(newStudent.id);
        setView('student_dashboard');
    };

    const handleStudentLogin = (code: string, nickname: string, password: string) => {
        const classToLogin = classes.find(c => `C${c.id.substring(c.id.length - 6)}`.toLowerCase() === code.toLowerCase().trim());
         if (!classToLogin) {
            alert('학급 코드를 확인해주세요.');
            return;
        }
        
        const studentToLogin = students.find(s => 
            s.classId === classToLogin.id && 
            s.nickname.toLowerCase() === nickname.trim().toLowerCase() &&
            s.password === password
        );

        if (studentToLogin) {
            setCurrentStudentId(studentToLogin.id);
            setView('student_dashboard');
        } else {
            alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        }
    };


    const handleUpdateClassStocks = (classId: string, updatedStockCodes: string[]) => {
        setClasses(prev => prev.map(c => c.id === classId ? { ...c, allowedStocks: updatedStockCodes } : c));
    };

    const handleTrade = (studentId: string, stockCode: string, quantity: number, type: TradeType) => {
        const studentIndex = students.findIndex(s => s.id === studentId);
        const stock = stocks.find(s => s.code === stockCode);
        if (studentIndex === -1 || !stock) return;

        const updatedStudents = [...students];
        const student = { ...updatedStudents[studentIndex] };
        const commission = stock.price * quantity * 0.001;

        if (type === 'buy') {
            const totalCost = stock.price * quantity + commission;
            if (student.cash < totalCost) { alert('현금이 부족합니다.'); return; }
            
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
            const existingHolding = student.portfolio.find(p => p.stockCode === stockCode);
            if (!existingHolding || existingHolding.quantity < quantity) { alert('보유 수량이 부족합니다.'); return; }

            student.cash += (stock.price * quantity) - commission;
            existingHolding.quantity -= quantity;
            student.portfolio = student.portfolio.filter(p => p.quantity > 0);
        }

        updatedStudents[studentIndex] = student;
        setStudents(updatedStudents);

        const newTransaction: Transaction = {
            id: `T${Date.now()}`, studentId, stockCode, stockName: stock.name, type, quantity, price: stock.price, timestamp: Date.now()
        };
        setTransactions(prev => [newTransaction, ...prev]);
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
    };
    
    const handleLogout = () => {
        setCurrentStudentId(null);
        setSelectedClassId(null);
        setView('landing'); 
    };
    
    // --- DERIVED STATE ---
    const selectedClass = classes.find(c => c.id === selectedClassId);
    const currentStudent = students.find(s => s.id === currentStudentId);
    const studentClass = currentStudent ? classes.find(c => c.id === currentStudent.classId) : null;

    // --- RENDER LOGIC ---
    const renderView = () => {
        switch (view) {
            case 'teacher_dashboard':
                return <TeacherDashboard 
                    onBack={handleLogout} 
                    classes={classes}
                    onCreateClass={handleCreateClass}
                    onSelectClass={handleSelectClass}
                />;
            case 'class_detail':
                 if (!selectedClass) { setView('teacher_dashboard'); return null; }
                const classStudents = students
                    .filter(s => s.classId === selectedClass.id)
                    .map(s => ({ ...s, totalAssets: calculateTotalAssets(s, stocks) }));

                return <ClassDetailView 
                    classInfo={selectedClass} 
                    students={classStudents}
                    allStocks={stocks}
                    onUpdateClassStocks={(updated) => handleUpdateClassStocks(selectedClass.id, updated)}
                    onAwardBonus={handleAwardBonus}
                    onBack={() => { setSelectedClassId(null); setView('teacher_dashboard'); }} 
                />;
            case 'student_dashboard':
                if (!currentStudent || !studentClass) { setView('landing'); return null; }
                 const classStudentsForRanking = students
                    .filter(s => s.classId === studentClass.id)
                    .map(s => ({ ...s, totalAssets: calculateTotalAssets(s, stocks) }));
                const studentWithAssets = {...currentStudent, totalAssets: calculateTotalAssets(currentStudent, stocks)};

                return <StudentDashboard 
                    student={studentWithAssets}
                    classInfo={studentClass}
                    stocks={stocks}
                    transactions={transactions.filter(t => t.studentId === currentStudent.id)}
                    classRanking={classStudentsForRanking}
                    onTrade={handleTrade}
                    onLogout={handleLogout}
                />;
            case 'landing':
            default: return <LandingPage
                onSelectRole={setView} 
                onStudentRegister={handleStudentRegister}
                onStudentLogin={handleStudentLogin}
                onTeacherLogin={() => setView('teacher_dashboard')}
            />;
        }
    };

    return <div className="app-container">{renderView()}</div>;
};

// --- COMPONENTS ---

const PolicyModal: React.FC<{ title: string; content: string; onClose: () => void; }> = ({ title, content, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <div className="policy-content">
                    <pre>{content}</pre>
                </div>
                 <div className="action-buttons" style={{marginTop: '1.5rem'}}>
                    <button type="button" className="button" style={{width: '100%'}} onClick={onClose}>확인</button>
                </div>
            </div>
        </div>
    );
};

interface StudentLoginModalProps {
    onClose: () => void;
    onRegister: (code: string, nickname: string, password: string) => void;
    onLogin: (code: string, nickname: string, password: string) => void;
}
const StudentLoginModal: React.FC<StudentLoginModalProps> = ({ onClose, onRegister, onLogin }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [code, setCode] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoginMode) {
            onLogin(code, nickname, password);
        } else {
            onRegister(code, nickname, password);
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                 <header className="modal-header">
                    <h2>{isLoginMode ? '학급 로그인' : '학급 참여하기'}</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <p style={{marginTop:0, marginBottom: '2rem'}}>{isLoginMode ? '정보를 입력하여 활동을 이어가세요.' : '코드를 입력하고 프로필을 만들어 참여하세요.'}</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input type="text" value={code} onChange={e => setCode(e.target.value)} className="input-field" placeholder="학급 참여 코드" required />
                    </div>
                    <div className="input-group">
                        <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className="input-field" placeholder="아이디" required />
                    </div>
                    <div className="input-group">
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="비밀번호" required />
                    </div>
                    <button type="submit" className="button" style={{width: '100%'}}>{isLoginMode ? '로그인' : '참여 완료'}</button>
                </form>
                <button type="button" className="button-link" onClick={() => setIsLoginMode(!isLoginMode)}>
                    {isLoginMode ? '처음이신가요? 학급 참여하기' : '이미 참여했나요? 로그인'}
                </button>
                <div className="action-buttons" style={{marginTop: '1rem'}}>
                    <button type="button" className="button button-secondary" style={{width: '100%'}} onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
};

interface TeacherLoginModalProps {
    onClose: () => void;
    onLoginSuccess: () => void;
}
const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({ onClose, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [policyModal, setPolicyModal] = useState<{ title: string; content: string } | null>(null);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLoginSuccess();
    };
    
    const handleGoogleAuth = () => {
        if (isLogin) {
            onLoginSuccess();
        }
    };

    const openPolicy = (type: 'terms' | 'privacy') => {
        if (type === 'terms') {
            setPolicyModal({ title: '이용약관', content: termsOfService });
        } else {
            setPolicyModal({ title: '개인정보처리방침', content: privacyPolicy });
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{isLogin ? '교사 로그인' : '교사 회원가입'}</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <p style={{marginTop:0, marginBottom: '1rem'}}>서비스를 이용하시려면 {isLogin ? '로그인이' : '회원가입이'} 필요합니다.</p>
                
                <button type="button" className="button button-google" onClick={handleGoogleAuth} style={{ width: '100%', marginBottom: '0.5rem' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '10px' }}>
                        <path d="M17.64 9.20455C17.64 8.56591 17.5827 7.95273 17.4764 7.36364H9V10.8455H13.8436C13.6345 11.9705 12.9982 12.9236 12.0664 13.5673V15.8264H15.0145C16.7127 14.2618 17.64 11.9545 17.64 9.20455Z" fill="#4285F4"></path>
                        <path d="M9 18C11.43 18 13.4673 17.1945 14.9564 15.8264L12.0082 13.5673C11.1927 14.1127 10.1564 14.44 9 14.44C6.65455 14.44 4.66364 12.9045 3.95 10.7773H0.954545V13.0455C2.45455 15.9091 5.48182 18 9 18Z" fill="#34A853"></path>
                        <path d="M3.95 10.7773C3.81 10.3573 3.73 9.91727 3.73 9.45C3.73 8.98273 3.81 8.54273 3.95 8.12273V5.85455H0.954545C0.347273 7.10909 0 8.25 0 9.45C0 10.65 0.347273 11.7909 0.954545 13.0455L3.95 10.7773Z" fill="#FBBC05"></path>
                        <path d="M9 3.54545C10.3227 3.54545 11.5073 4 12.44 4.89545L15.0145 2.32182C13.4636 0.886364 11.43 0 9 0C5.48182 0 2.45455 1.90909 0.954545 4.63636L3.95 6.90455C4.66364 4.77727 6.65455 3.54545 9 3.54545Z" fill="#EA4335"></path>
                    </svg>
                    Google 계정으로 {isLogin ? '로그인' : '회원가입'}
                </button>
                <div className="divider"><span>또는</span></div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group"><input type="email" className="input-field" placeholder="이메일 주소" aria-label="이메일 주소" required /></div>
                    <div className="input-group"><input type="password" className="input-field" placeholder="비밀번호" aria-label="비밀번호" required /></div>
                    
                    {!isLogin && (
                        <p className="agreement-text" style={{textAlign: 'center', marginBottom: '1.5rem'}}>
                            계속하면 ClassStock의 <button type="button" className="inline-link" onClick={() => openPolicy('terms')}>이용약관</button> 및 <br/>
                            <button type="button" className="inline-link" onClick={() => openPolicy('privacy')}>개인정보처리방침</button>에 동의하는 것으로 간주됩니다.
                        </p>
                    )}
                    
                    <button type="submit" className="button" style={{ width: '100%', marginBottom: '1rem' }}>{isLogin ? '로그인' : '회원가입'}</button>
                </form>
                <p style={{ fontSize: '0.9rem', color: '#666', cursor: 'pointer', margin: 0 }} onClick={() => setIsLogin(!isLogin)}>{isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}</p>
                {policyModal && <PolicyModal title={policyModal.title} content={policyModal.content} onClose={() => setPolicyModal(null)} />}
            </div>
        </div>
    );
};


interface LandingPageProps {
    onSelectRole: (role: View) => void;
    onStudentRegister: (code: string, nickname: string, password: string) => void;
    onStudentLogin: (code: string, nickname: string, password: string) => void;
    onTeacherLogin: () => void;
}
const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole, onStudentRegister, onStudentLogin, onTeacherLogin }) => {
    const [policyModal, setPolicyModal] = useState<{ title: string; content: string } | null>(null);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [activeModal, setActiveModal] = useState<'student' | 'teacher' | null>(null);

    const openPolicy = (type: 'terms' | 'privacy') => {
        if (type === 'terms') {
            setPolicyModal({ title: '이용약관', content: termsOfService });
        } else {
            setPolicyModal({ title: '개인정보처리방침', content: privacyPolicy });
        }
    };
    
    const featuresData = [
      {
        icon: '📊',
        title: '실감 나는 모의투자',
        description: '실제 주식 데이터를 기반으로, 현실적인 투자 환경을 경험하며 경제 원리를 배웁니다.',
      },
      {
        icon: '👩‍🏫',
        title: '편리한 학급 관리',
        description: '교사용 대시보드를 통해 학생들의 포트폴리오와 랭킹을 한눈에 파악하고 지도합니다.',
      },
      {
        icon: '🎁',
        title: '동기부여 보상 시스템',
        description: '과제 수행, 적극적 참여 등 교육 활동에 대한 보상으로 추가 시드머니를 지급하여 학습 동기를 높일 수 있습니다.',
      },
      {
        icon: '⚙️',
        title: '자유로운 맞춤 설정',
        description: '활동 기간, 시드머니, 투자 종목을 자유롭게 설정하여 맞춤형 금융 교육을 설계합니다.',
      },
    ];

    const faqData = [
        { q: "학생들은 실제 돈으로 투자를 하나요?", a: "아니요, 'ClassStock'은 교육용 모의투자 서비스입니다. 모든 거래는 실제 금전적 가치가 없는 가상의 시드머니로 이루어집니다." },
        { q: "참여 코드를 잃어버렸어요.", a: "참여 코드는 학급을 개설하신 선생님께 다시 문의해주세요. 선생님은 교사 대시보드에서 언제든지 코드를 확인할 수 있습니다." },
        { q: "시드머니를 모두 사용하면 어떻게 되나요?", a: "기본적으로 초기 시드머니로만 활동하지만, 선생님께서 과제 보상이나 특별 활동 보너스로 추가 시드머니를 지급해주실 수 있습니다. 선생님과 상의해보세요." },
        { q: "데이터는 안전하게 보관되나요?", a: "현재 'ClassStock'은 데모 버전으로, 모든 데이터는 브라우저를 새로고침하거나 닫으면 사라집니다. 중요한 정보는 별도로 기록해주세요." }
    ];

    return (
        <div className="container" style={{ position: 'relative' }}>
            <header className="header">
                <h1>ClassStock</h1>
                <p>선생님과 함께하는 즐거운 금융 교실</p>
            </header>
            <div className="role-selection">
                <div className="role-card" role="region" aria-labelledby="teacher_title">
                    <h2 id="teacher_title">교사용</h2>
                    <p>학급을 만들고 학생들의 투자를 관리하세요.</p>
                    <button className="button" onClick={() => setActiveModal('teacher')} aria-label="교사용으로 시작하기">
                        시작하기
                    </button>
                </div>
                <div className="role-card" role="region" aria-labelledby="student_title">
                    <h2 id="student_title">학생용</h2>
                    <p>참여 코드를 입력하고 모의투자를 시작하세요.</p>
                    <button className="button" onClick={() => setActiveModal('student')} aria-label="학생용으로 참여하기">
                        참여하기
                    </button>
                </div>
            </div>

            <div className="info-sections-landing">
                 <div className="info-card-landing">
                    <h2 className="info-title-landing">주요 기능</h2>
                    <div className="features-grid">
                        {featuresData.map((feature, index) => (
                            <div className="feature-item" key={index}>
                                <div className="feature-icon">{feature.icon}</div>
                                <div className="feature-text">
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="info-card-landing">
                    <h2 className="info-title-landing">활용 가이드</h2>
                    <div className="guide-steps">
                        <div className="guide-step">
                            <span className="step-number">1</span>
                            <p><strong>학급 개설</strong><br/>새 학급을 만들어 활동 기간과 시드머니를 설정합니다.</p>
                        </div>
                        <div className="guide-step">
                            <span className="step-number">2</span>
                            <p><strong>코드 공유</strong><br/>생성된 '참여 코드'를 학생들에게 공유하여 참여시킵니다.</p>
                        </div>
                        <div className="guide-step">
                            <span className="step-number">3</span>
                            <p><strong>학습 시작</strong><br/>랭킹과 포트폴리오를 보며 즐거운 투자 학습을 진행합니다.</p>
                        </div>
                         <div className="guide-step">
                            <span className="step-number">4</span>
                            <p><strong>학습 독려</strong><br/>과제 보상 등 추가 시드머니를 지급하며 학생 참여를 독려합니다.</p>
                        </div>
                    </div>
                </div>
                <div className="info-card-landing">
                    <h2 className="info-title-landing">자주 묻는 질문</h2>
                    <div className="faq-list">
                    {faqData.map((item, index) => (
                        <div className="faq-item" key={index}>
                            <button className="faq-question" onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                                <span>{item.q}</span>
                                <span className="faq-icon">{activeFaq === index ? '−' : '+'}</span>
                            </button>
                            <div className={`faq-answer ${activeFaq === index ? 'open' : ''}`}>
                               <p>{item.a}</p>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </div>

             <footer className="footer">
                <button onClick={() => openPolicy('terms')} className="footer-link">이용약관</button>
                <button onClick={() => openPolicy('privacy')} className="footer-link">개인정보처리방침</button>
            </footer>
            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}>
                <button
                    onClick={() => onSelectRole('teacher_dashboard')}
                    style={{ background: '#ffc107', color: 'black', border: 'none', borderRadius: '8px', width: '50px', height: '30px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', }}
                    title="개발자용 바로가기" aria-label="개발자용 대시보드 바로가기"
                > DEV </button>
            </div>
            {policyModal && <PolicyModal title={policyModal.title} content={policyModal.content} onClose={() => setPolicyModal(null)} />}
            {activeModal === 'student' && <StudentLoginModal onClose={() => setActiveModal(null)} onRegister={onStudentRegister} onLogin={onStudentLogin} />}
            {activeModal === 'teacher' && <TeacherLoginModal onClose={() => setActiveModal(null)} onLoginSuccess={onTeacherLogin} />}
        </div>
    );
};

interface PortalProps { onBack: () => void; }

interface CreateClassModalProps { onClose: () => void; onCreate: (newClass: Omit<ClassInfo, 'id' | 'allowedStocks'>) => void; }
const CreateClassModal: React.FC<CreateClassModalProps> = ({ onClose, onCreate }) => {
    const [dateError, setDateError] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const startDate = formData.get('startDate') as string;
        const endDate = formData.get('endDate') as string;

        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            setDateError('종료일을 시작일 이후로 입력하세요.');
            return;
        }

        const newClass = {
            name: formData.get('className') as string,
            startDate,
            endDate,
            seedMoney: Number(formData.get('seedMoney')),
        };
        onCreate(newClass);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header"><h2>새 학급 만들기</h2><button onClick={onClose} className="close-button" aria-label="닫기">&times;</button></header>
                <form onSubmit={handleSubmit}>
                    <div className="input-group"><label htmlFor="className">학급 이름</label><input id="className" name="className" type="text" className="input-field" placeholder="예: 1학년 1반 금융 교실" required /></div>
                    <div className="input-group-row">
                        <div className="input-group"><label htmlFor="startDate">활동 시작일</label><input id="startDate" name="startDate" type="date" className="input-field" onChange={() => setDateError('')} required /></div>
                        <div className="input-group"><label htmlFor="endDate">활동 종료일</label><input id="endDate" name="endDate" type="date" className="input-field" onChange={() => setDateError('')} required /></div>
                    </div>
                    {dateError && <p className="error-message">{dateError}</p>}
                    <div className="input-group"><label htmlFor="seedMoney">초기 시드머니</label><input id="seedMoney" name="seedMoney" type="number" className="input-field" placeholder="예: 1000000" required /></div>
                    <div className="action-buttons"><button type="button" className="button button-secondary" onClick={onClose}>취소</button><button type="submit" className="button">생성하기</button></div>
                </form>
            </div>
        </div>
    );
};
const ClassCard: React.FC<{ classInfo: ClassInfo; onManage: () => void; }> = ({ classInfo, onManage }) => {
    return (
        <div className="class-card">
            <h3>{classInfo.name}</h3>
            <p><strong>기간:</strong> {classInfo.startDate} ~ {classInfo.endDate}</p>
            <p><strong>초기 시드머니:</strong> {classInfo.seedMoney.toLocaleString()}원</p>
            <button onClick={onManage} className="button" style={{width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', float: 'right'}}>학급 관리</button>
        </div>
    );
};
interface TeacherDashboardProps extends PortalProps { classes: ClassInfo[]; onCreateClass: (newClassData: Omit<ClassInfo, 'id' | 'allowedStocks'>) => void; onSelectClass: (classId: string) => void; }
const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBack, classes, onCreateClass, onSelectClass }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleCreate = (newClassData: Omit<ClassInfo, 'id' | 'allowedStocks'>) => { onCreateClass(newClassData); setIsModalOpen(false); };
    const hasClasses = classes.length > 0;
    return (
        <div className="container">
            <header className="header" style={{ marginBottom: '2rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>교사 대시보드</h1>
                        <p style={{ margin: '0.25rem 0 0 0' }}>{hasClasses ? '내 학급 목록입니다.' : '학급을 만들고 관리하세요.'}</p>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                        {hasClasses && (<button onClick={() => setIsModalOpen(true)} className="button" style={{ width: 'auto', padding: '0.5rem 1rem' }}>+ 새 학급</button>)}
                        <button onClick={onBack} className="button button-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>로그아웃</button>
                    </div>
                </div>
            </header>
            {hasClasses ? (
                <div className="class-list">{classes.map(c => <ClassCard key={c.id} classInfo={c} onManage={() => onSelectClass(c.id)} />)}</div>
            ) : (
                <div className="dashboard-content" style={{textAlign: 'center', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                     <p>아직 생성된 학급이 없습니다.</p><p style={{marginBottom: '2rem'}}>새 학급을 만들어 학생들을 초대해보세요!</p>
                     <button onClick={() => setIsModalOpen(true)} className="button" style={{width: 'auto', padding: '1rem 2rem', alignSelf: 'center'}}>+ 새 학급 만들기</button>
                </div>
            )}
            {isModalOpen && <CreateClassModal onClose={() => setIsModalOpen(false)} onCreate={handleCreate} />}
        </div>
    );
};

// --- UPDATED & NEW COMPONENTS ---

const StockManager: React.FC<{
    allowedStocks: string[];
    allStocks: Stock[];
    onUpdate: (updatedStockCodes: string[]) => void;
}> = ({ allowedStocks, allStocks, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const handleAdd = (code: string) => {
        if (allowedStocks.length < 10 && !allowedStocks.includes(code)) {
            onUpdate([...allowedStocks, code]);
        }
    };
    const handleRemove = (code: string) => onUpdate(allowedStocks.filter(c => c !== code));
    
    const searchResults = searchTerm ? allStocks.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.includes(searchTerm)) : [];
    const selectedStockDetails = allowedStocks.map(code => allStocks.find(s => s.code === code)).filter(Boolean) as Stock[];

    return (
        <div className="stock-manager-container">
            <div className="info-card">
                <h4>선택된 종목 ({allowedStocks.length}/10)</h4>
                {selectedStockDetails.length > 0 ? (
                    <ul className="data-list">{selectedStockDetails.map(stock => (
                        <li key={stock.code} className="data-list-item">
                            <div className="stock-info"><span>{stock.name}</span><small>{stock.code}</small></div>
                            <button onClick={() => handleRemove(stock.code)} className="button button-secondary" style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}}>제거</button>
                        </li>
                    ))}</ul>
                ) : <p>선택된 투자 종목이 없습니다.</p>}
            </div>
            <div className="info-card">
                <h4>종목 검색 및 추가</h4>
                <div className="input-group" style={{marginBottom: '1rem'}}><input type="text" className="input-field" placeholder="종목명 또는 코드 검색" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                {searchTerm && (
                    <ul className="data-list">{searchResults.map(stock => (
                        <li key={stock.code} className="data-list-item">
                           <div className="stock-info"><span>{stock.name}</span><small>{stock.code}</small></div>
                            <button onClick={() => handleAdd(stock.code)} disabled={allowedStocks.includes(stock.code) || allowedStocks.length >= 10} className="button" style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}}>추가</button>
                        </li>
                    ))}</ul>
                )}
            </div>
        </div>
    );
};

const RankingBoard: React.FC<{ students: (StudentInfo & { totalAssets: number })[]; }> = ({ students }) => {
    const sortedStudents = [...students].sort((a, b) => b.totalAssets - a.totalAssets);
    return (
        <div className="info-section">
            {sortedStudents.length > 0 ? (
                <ul className="data-list">{sortedStudents.map((student, index) => (
                    <li key={student.id} className="data-list-item ranking-list-item">
                        <span className="rank">{index + 1}</span>
                        <span style={{flex: 1, textAlign: 'left', marginLeft: '1rem'}}>{student.nickname}</span>
                        <span>{student.totalAssets.toLocaleString()}원</span>
                    </li>
                ))}</ul>
            ) : <div className="info-card" style={{textAlign: 'center'}}><p>아직 참여한 학생이 없습니다.</p></div>}
        </div>
    );
};

interface BonusModalProps {
    students: StudentInfo[];
    onClose: () => void;
    onConfirm: (amount: number, reason: string) => void;
}
const BonusModal: React.FC<BonusModalProps> = ({ students, onClose, onConfirm }) => {
    const [amount, setAmount] = useState<number>(10000);
    const [reason, setReason] = useState<string>('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount > 0 && amount <= 10000000) {
            onConfirm(amount, reason.trim());
        }
    };
    const recipientText = students.length === 1 ? students[0].nickname : `${students.length}명`;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>보너스 지급</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <p style={{textAlign: 'left', marginTop: 0}}><strong>{recipientText}</strong>에게 보너스를 지급합니다.</p>
                    <div className="input-group">
                        <label htmlFor="bonus-amount">지급할 금액 (1 ~ 10,000,000)</label>
                        <input id="bonus-amount" type="number" min="1" max="10000000" step="1" className="input-field" value={amount} onChange={e => setAmount(Number(e.target.value))} required />
                    </div>
                     <div className="input-group">
                        <label htmlFor="bonus-reason">지급 사유 (선택 사항)</label>
                        <input id="bonus-reason" type="text" className="input-field" value={reason} onChange={e => setReason(e.target.value)} placeholder="예: 우수 과제 제출" />
                    </div>
                    <div className="action-buttons">
                        <button type="button" className="button button-secondary" onClick={onClose}>취소</button>
                        <button type="submit" className="button">지급하기</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface StudentPortfolioModalProps {
    student: StudentInfo & { totalAssets: number };
    stocks: Stock[];
    onClose: () => void;
}
const StudentPortfolioModal: React.FC<StudentPortfolioModalProps> = ({ student, stocks, onClose }) => {
    const fullPortfolio = useMemo(() => student.portfolio.map(item => {
        const stock = stocks.find(s => s.code === item.stockCode);
        if (!stock) return null;
        const currentValue = stock.price * item.quantity;
        const profit = (stock.price - item.averagePrice) * item.quantity;
        const profitRate = item.averagePrice > 0 ? (profit / (item.averagePrice * item.quantity)) * 100 : 0;
        return { ...item, stock, currentValue, profit, profitRate };
    }).filter(Boolean), [student.portfolio, stocks]);
    
    const stockAssets = fullPortfolio.reduce((acc, item) => acc + (item?.currentValue ?? 0), 0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{student.nickname}님의 포트폴리오</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <div className="portfolio-summary">
                    <div className="summary-item"><span>총 자산</span><strong>{student.totalAssets.toLocaleString()}원</strong></div>
                    <div className="summary-item"><span>보유 현금</span><span>{student.cash.toLocaleString()}원</span></div>
                    <div className="summary-item"><span>주식 평가</span><span>{stockAssets.toLocaleString()}원</span></div>
                </div>
                <h4>보유 주식</h4>
                <div className="data-list" style={{ maxHeight: '250px' }}>
                    {fullPortfolio.length > 0 ? fullPortfolio.map(p => p && (
                        <div key={p.stockCode} className="portfolio-card">
                             <div className="portfolio-card-header">
                                <span>{p.stock.name} ({p.stock.price.toLocaleString()}원)</span>
                                <span className={p.profit > 0 ? 'price-info positive' : p.profit < 0 ? 'price-info negative' : 'price-info neutral'}>
                                    {p.profit.toLocaleString()}원 ({p.profitRate.toFixed(2)}%)
                                </span>
                            </div>
                            <div className="portfolio-card-body" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <span>평가액: {p.currentValue.toLocaleString()}원</span>
                                <span>보유수량: {p.quantity}주</span>
                                <span>매입가: {p.averagePrice.toLocaleString()}원</span>
                            </div>
                        </div>
                    )) : <p style={{ textAlign: 'center', color: '#666' }}>보유 주식이 없습니다.</p>}
                </div>
            </div>
        </div>
    );
};

interface ClassDetailViewProps extends PortalProps { 
    classInfo: ClassInfo; 
    students: (StudentInfo & { totalAssets: number })[]; 
    allStocks: Stock[]; 
    onUpdateClassStocks: (updated: string[]) => void; 
    onAwardBonus: (studentIds: string[], amount: number, reason: string) => void;
}
const ClassDetailView: React.FC<ClassDetailViewProps> = ({ onBack, classInfo, students, allStocks, onUpdateClassStocks, onAwardBonus }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
    const [bonusRecipients, setBonusRecipients] = useState<(StudentInfo & { totalAssets: number })[]>([]);
    const [viewingStudent, setViewingStudent] = useState<(StudentInfo & { totalAssets: number }) | null>(null);
    const joinCode = `C${classInfo.id.substring(classInfo.id.length - 6)}`;
    const copyCode = () => navigator.clipboard.writeText(joinCode).then(() => alert('참여 코드가 복사되었습니다!'));

    const handleSelectStudent = (studentId: string) => {
        setSelectedStudentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedStudentIds(new Set(students.map(s => s.id)));
        } else {
            setSelectedStudentIds(new Set());
        }
    };

    const openBonusModal = (recipients: (StudentInfo & { totalAssets: number })[]) => {
        if (recipients.length > 0) {
            setBonusRecipients(recipients);
            setIsBonusModalOpen(true);
        }
    };

    const handleConfirmBonus = (amount: number, reason: string) => {
        if (bonusRecipients.length > 0) {
            onAwardBonus(bonusRecipients.map(s => s.id), amount, reason);
            setIsBonusModalOpen(false);
            setBonusRecipients([]);
            setSelectedStudentIds(new Set());
        }
    };

    const selectedStudents = students.filter(s => selectedStudentIds.has(s.id));
    const allStudentsSelected = students.length > 0 && selectedStudentIds.size === students.length;
    
    return (
        <div className="container">
            <header className="header" style={{ marginBottom: '1rem', textAlign: 'left' }}><h1 style={{ fontSize: '1.8rem', margin: 0 }}>{classInfo.name}</h1><p style={{ margin: '0.25rem 0 0 0' }}>학급 관리</p></header>
            <div className="tabs">
                <button className={`tab-button ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>기본 정보</button>
                <button className={`tab-button ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>학생 관리 ({students.length})</button>
                <button className={`tab-button ${activeTab === 'stocks' ? 'active' : ''}`} onClick={() => setActiveTab('stocks')}>종목 관리</button>
                <button className={`tab-button ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>랭킹 보드</button>
            </div>
            <div className="tab-content">
                {activeTab === 'info' && <div className="info-section info-section-grid"><div className="info-card"><h4>학급 참여 코드</h4><p>학생들에게 이 코드를 공유하여 학급에 참여하도록 하세요.</p><div className="join-code-box"><span>{joinCode}</span><button onClick={copyCode} className="button button-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>복사</button></div></div><div className="info-card"><h4>학급 정보</h4><p><strong>기간:</strong> {classInfo.startDate} ~ {classInfo.endDate}</p><p><strong>초기 시드머니:</strong> {classInfo.seedMoney.toLocaleString()}원</p></div></div>}
                {activeTab === 'students' && <div className="info-section">{students.length > 0 ? (
                    <>
                        <div className="student-management-bar">
                            <div className="select-all-group">
                                <input type="checkbox" id="select-all-students" checked={allStudentsSelected} onChange={handleSelectAll} disabled={students.length === 0} />
                                <label htmlFor="select-all-students">전체 선택 ({selectedStudentIds.size}/{students.length})</label>
                            </div>
                            <div className="action-buttons-group">
                                <button onClick={() => openBonusModal(selectedStudents)} disabled={selectedStudentIds.size === 0} className="button button-bonus">선택 학생 보너스</button>
                                <button onClick={() => openBonusModal(students)} disabled={students.length === 0} className="button button-bonus">전체 학생 보너스</button>
                            </div>
                        </div>
                        <ul className="data-list">{students.map(s => (
                            <li key={s.id} className="data-list-item student-list-item-clickable" onClick={() => setViewingStudent(s)}>
                                <div className="student-select-info">
                                    <input type="checkbox" checked={selectedStudentIds.has(s.id)} onChange={() => handleSelectStudent(s.id)} onClick={(e) => e.stopPropagation()} />
                                    <span>{s.nickname}</span>
                                </div>
                                <span style={{color: '#555', fontSize: '0.9rem'}}>자산: {s.totalAssets.toLocaleString()}원</span>
                            </li>
                        ))}</ul>
                    </>
                ) : <div className="info-card" style={{textAlign: 'center'}}><p>아직 참여한 학생이 없습니다.</p></div>}</div>}
                {activeTab === 'stocks' && <StockManager allowedStocks={classInfo.allowedStocks} allStocks={allStocks} onUpdate={onUpdateClassStocks} />}
                {activeTab === 'ranking' && <RankingBoard students={students} />}
            </div>
             <div className="action-buttons" style={{marginTop: '2rem'}}><button type="button" className="button button-secondary" style={{width: '100%'}} onClick={onBack}>대시보드로 돌아가기</button></div>
             {isBonusModalOpen && <BonusModal students={bonusRecipients} onClose={() => setIsBonusModalOpen(false)} onConfirm={handleConfirmBonus} />}
             {viewingStudent && <StudentPortfolioModal student={viewingStudent} stocks={allStocks} onClose={() => setViewingStudent(null)} />}
        </div>
    );
};

const TradeModal: React.FC<{
    tradeInfo: TradeInfo;
    student: StudentInfo;
    onClose: () => void;
    onConfirm: (quantity: number) => void;
}> = ({ tradeInfo, student, onClose, onConfirm }) => {
    const { type, stock } = tradeInfo;
    const [quantity, setQuantity] = useState(1);
    const maxBuy = Math.floor(student.cash / (stock.price * 1.001));
    const maxSell = student.portfolio.find(p => p.stockCode === stock.code)?.quantity || 0;
    const maxQuantity = type === 'buy' ? maxBuy : maxSell;

    const total = stock.price * quantity;
    const commission = total * 0.001;
    const finalAmount = type === 'buy' ? total + commission : total - commission;
    const isConfirmDisabled = quantity <= 0 || quantity > maxQuantity;

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onConfirm(quantity); };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header"><h2 style={{color: type === 'buy' ? 'var(--positive-color)' : 'var(--negative-color)'}}>{stock.name} {type === 'buy' ? '매수' : '매도'}</h2><button onClick={onClose} className="close-button" aria-label="닫기">&times;</button></header>
                <form onSubmit={handleSubmit}>
                    <div className="input-group"><label>현재가: {stock.price.toLocaleString()}원</label></div>
                    <div className="input-group">
                        <label htmlFor="quantity">수량 (최대: {maxQuantity.toLocaleString()}주)</label>
                        <input id="quantity" name="quantity" type="number" min="1" max={maxQuantity} className="input-field" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
                    </div>
                    <div className="trade-summary">
                        <p><span>주문금액</span><span>{total.toLocaleString()}원</span></p>
                        <p><span>수수료 (0.1%)</span><span>{commission.toLocaleString()}원</span></p>
                        <p><strong>{type === 'buy' ? '총 매수금액' : '총 매도금액'}</strong><strong>{finalAmount.toLocaleString()}원</strong></p>
                    </div>
                    <div className="action-buttons"><button type="button" className="button button-secondary" onClick={onClose}>취소</button><button type="submit" className={`button ${type === 'buy' ? 'button-buy' : 'button-sell'}`} disabled={isConfirmDisabled}>확인</button></div>
                </form>
            </div>
        </div>
    );
};


interface StudentDashboardProps {
    student: StudentInfo & { totalAssets: number };
    classInfo: ClassInfo;
    stocks: Stock[];
    transactions: Transaction[];
    classRanking: (StudentInfo & { totalAssets: number })[];
    onTrade: (studentId: string, stockCode: string, quantity: number, type: TradeType) => void;
    onLogout: () => void;
}
const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, classInfo, stocks, transactions, classRanking, onTrade, onLogout }) => {
    const [activeTab, setActiveTab] = useState('portfolio');
    const [tradeInfo, setTradeInfo] = useState<TradeInfo | null>(null);
    const { totalAssets, cash, portfolio } = student;
    const stockAssets = totalAssets - cash;

    const fullPortfolio = useMemo(() => portfolio.map(item => {
        const stock = stocks.find(s => s.code === item.stockCode);
        if (!stock) return null;
        const currentValue = stock.price * item.quantity;
        const profit = (stock.price - item.averagePrice) * item.quantity;
        const profitRate = item.averagePrice > 0 ? (profit / (item.averagePrice * item.quantity)) * 100 : 0;
        return { ...item, stock, currentValue, profit, profitRate };
    }).filter(Boolean), [portfolio, stocks]);

    const allowedStocks = classInfo.allowedStocks.map(code => stocks.find(s => s.code === code)).filter(Boolean) as Stock[];

    const handleConfirmTrade = (quantity: number) => {
        if (tradeInfo) {
            onTrade(student.id, tradeInfo.stock.code, quantity, tradeInfo.type);
            setTradeInfo(null);
        }
    };

    return (
        <div className="container">
            <header className="dashboard-header">
                <div><h1 style={{ fontSize: '1.8rem', margin: 0 }}>{student.nickname}님</h1><p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>'{classInfo.name}'</p></div>
                <div>
                     <button onClick={onLogout} className="button button-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>로그아웃</button>
                </div>
            </header>
            <div className="asset-summary"><h2>총 자산</h2><p>{totalAssets.toLocaleString()}원</p>
                 <div className="asset-details">
                    <span>보유 현금: {cash.toLocaleString()}원</span>
                    <span>주식 평가: {stockAssets.toLocaleString()}원</span>
                 </div>
            </div>
            <div className="tabs">
                <button className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>포트폴리오</button>
                <button className={`tab-button ${activeTab === 'market' ? 'active' : ''}`} onClick={() => setActiveTab('market')}>마켓</button>
                <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>거래 내역</button>
                <button className={`tab-button ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>랭킹</button>
            </div>
            <div className="tab-content" style={{minHeight: '200px'}}>
                {activeTab === 'portfolio' && (
                    <div className="info-section">{fullPortfolio.length > 0 ? fullPortfolio.map(p => p && (
                        <div key={p.stockCode} className="portfolio-card">
                            <div className="portfolio-card-header"><span>{p.stock.name} ({p.stock.price.toLocaleString()}원)</span><span className={p.profit > 0 ? 'price-info positive' : p.profit < 0 ? 'price-info negative' : 'price-info neutral'}>{p.profit.toLocaleString()}원 ({p.profitRate.toFixed(2)}%)</span></div>
                            <div className="portfolio-card-body">
                                <span>평가액: {p.currentValue.toLocaleString()}원</span><span>보유수량: {p.quantity}주</span>
                                <span>매입가: {p.averagePrice.toLocaleString()}원</span><span><button onClick={() => setTradeInfo({ type: 'sell', stock: p.stock })} className="button button-sell" style={{width: 'auto', padding: '0.2rem 0.6rem', fontSize:'0.8rem'}}>매도</button></span>
                            </div>
                        </div>
                    )) : <div className="info-card" style={{textAlign: 'center'}}><p>현재 보유 주식이 없습니다.</p></div>}</div>
                )}
                {activeTab === 'market' && <ul className="data-list">{allowedStocks.map(stock => (
                    <li key={stock.code} className="data-list-item">
                        <div className="stock-info"><span>{stock.name}</span><small>{stock.code}</small></div>
                        <div className="price-info"><span>{stock.price.toLocaleString()}원</span></div>
                        <button onClick={() => setTradeInfo({ type: 'buy', stock })} className="button button-buy" style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}}>매수</button>
                    </li>
                ))}</ul>}
                {activeTab === 'history' && <ul className="data-list">{transactions.length > 0 ? transactions.map(t => (
                    <li key={t.id} className="data-list-item">
                         {t.type === 'bonus' ? (
                            <>
                                <div className="stock-info">
                                    <span style={{color: 'var(--bonus-color)'}}>{t.stockName}</span>
                                    <small>{new Date(t.timestamp).toLocaleString()}</small>
                                    {t.reason && <small className="transaction-reason">사유: {t.reason}</small>}
                                </div>
                                <div style={{color: 'var(--bonus-color)', fontWeight: '700', textAlign: 'right'}}>+{t.price.toLocaleString()}원</div>
                            </>
                        ) : (
                            <>
                                <div className="stock-info"><span style={{color: t.type === 'buy' ? 'var(--positive-color)' : 'var(--negative-color)'}}>{t.type === 'buy' ? '매수' : '매도'}</span><small>{new Date(t.timestamp).toLocaleString()}</small></div>
                                <div>{t.stockName} {t.quantity}주</div><div>{t.price.toLocaleString()}원</div>
                            </>
                        )}
                    </li>
                )) : <div className="info-card" style={{textAlign: 'center'}}><p>거래 내역이 없습니다.</p></div>}</ul>}
                {activeTab === 'ranking' && <RankingBoard students={classRanking} />}
            </div>
            {tradeInfo && <TradeModal tradeInfo={tradeInfo} student={student} onClose={() => setTradeInfo(null)} onConfirm={handleConfirmTrade} />}
        </div>
    );
};

const termsOfService = `ClassStock 이용약관

제1조 (목적)
이 약관은 ClassStock(이하 "회사")이 제공하는 모의투자 교육 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
1. 서비스: 구현되는 단말기와 상관없이 회원이 이용할 수 있는 ClassStock 및 관련 제반 서비스를 의미합니다.
2. 회원: 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말하며, 교사 회원과 학생 회원으로 구분됩니다.
3. 교사 회원: 학급을 개설하고 학생 회원을 관리하며 교육 활동을 진행하는 회원입니다.
4. 학생 회원: 교사 회원이 개설한 학급에 참여하여 모의투자 활동을 하는 회원입니다.
5. 학급 참여 코드: 교사 회원이 학급을 생성할 때 발급되는 고유한 문자 및 숫자의 조합으로, 학생 회원이 학급에 참여하기 위해 사용됩니다.
6. 아이디: 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.
7. 비밀번호: 회원이 부여받은 아이디와 일치되는 회원임을 확인하고 비밀보호를 위해 회원 자신이 정한 문자 또는 숫자의 조합을 의미합니다.

제3조 (약관의 게시와 개정)
1. 회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
2. 회사는 "약관의 규제에 관한 법률", "정보통신망 이용촉진 및 정보보호 등에 관한 법률(이하 "정보통신망법")" 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
3. 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 제1항의 방식에 따라 그 개정약관의 적용일자 7일 전부터 적용일자 전일까지 공지합니다.

제4조 (서비스의 제공 및 변경)
1. 회사는 다음과 같은 업무를 수행합니다.
   - 교사 회원을 위한 학급 개설 및 관리 기능 제공
   - 학생 회원을 위한 모의투자 환경 제공
   - 투자 관련 학습 콘텐츠 제공
   - 기타 회사가 정하는 업무
2. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.
3. 현재 제공되는 서비스는 정식 버전이 아닌 데모(DEMO) 버전으로, 기능의 추가, 수정, 삭제가 수시로 발생할 수 있으며 데이터가 영구적으로 보관되지 않을 수 있습니다.

제5조 (회원의 의무)
1. 회원은 다음 행위를 하여서는 안 됩니다.
   - 신청 또는 변경 시 허위 내용의 등록
   - 타인의 정보 도용
   - 공공질서 및 미풍양속에 위반되는 내용의 정보, 문장, 도형, 음성 등을 타인에게 유포하는 행위
   - 회사의 사전 승낙 없이 서비스를 이용하여 영리활동을 하는 행위
2. 회원은 관계법, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.

제6조 (면책조항)
1. 본 서비스에서 제공하는 모든 정보와 데이터는 실제 금융 시장을 반영한 모의 데이터이며, 어떠한 경우에도 실제 금전적 가치를 가지지 않습니다.
2. 본 서비스는 교육적 목적을 위해 제작되었으며, 실제 주식 투자를 권유하거나 자문하는 서비스가 아닙니다. 서비스 이용을 통해 얻은 정보를 바탕으로 한 실제 투자 결정에 대해 회사는 어떠한 책임도 지지 않습니다.
3. 현재 데모 버전의 서비스에서는 사용자의 데이터(학급 정보, 학생 정보, 거래 내역 등)가 브라우저 세션에 임시로 저장되며, 브라우저를 새로고침하거나 종료할 경우 모든 데이터는 소멸됩니다. 데이터 유실에 대해 회사는 책임지지 않습니다.
4. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.

제7조 (준거법 및 재판관할)
1. 회사와 회원 간에 발생한 분쟁에 대하여는 대한민국법을 준거법으로 합니다.
2. 회사와 회원 간 발생한 분쟁에 관한 소송은 민사소송법 상의 관할법원에 제소합니다.

부칙
이 약관은 2024년 1월 1일부터 시행됩니다.`;

const privacyPolicy = `ClassStock 개인정보처리방침

ClassStock(이하 "회사")은 개인정보보호법 등 관련 법령상의 개인정보보호 규정을 준수하며, 관련 법령에 의거한 개인정보처리방침을 정하여 이용자 권익 보호에 최선을 다하고 있습니다.

1. 개인정보의 수집 항목 및 이용 목적
회사는 서비스 제공을 위해 필요한 최소한의 범위 내에서 다음과 같은 개인정보를 수집하고 있습니다.

가. 교사 회원
- 수집 항목: 이메일 주소, 비밀번호
- 이용 목적: 회원 식별, 학급 관리 기능 제공, 공지사항 전달, 민원 처리

나. 학생 회원
- 수집 항목: 아이디(닉네임), 비밀번호, 학급 참여 코드
- 이용 목적: 회원 식별, 학급 참여 및 모의투자 활동 데이터 관리

다. 자동 생성 정보
- 수집 항목: 접속 로그, 쿠키, 서비스 이용 기록
- 이용 목적: 서비스 품질 개선, 부정 이용 방지

2. 개인정보의 처리 및 보유 기간
회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리 및 보유합니다.

- **[중요] 현재 데모(DEMO) 버전의 경우, 모든 회원 정보 및 활동 데이터는 사용자의 브라우저 세션(메모리)에만 임시로 저장됩니다. 브라우저를 새로고침하거나 종료하는 경우, 수집된 모든 정보는 즉시 파기되며 서버에 영구적으로 저장되지 않습니다.**
- 향후 정식 서비스 전환 시, 회원 탈퇴 시까지 개인정보를 보유하며, 탈퇴 요청 시 지체 없이 파기합니다.

3. 개인정보의 제3자 제공
회사는 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다. 현재 회사는 수집된 개인정보를 제3자에게 제공하고 있지 않습니다.

4. 개인정보의 파기절차 및 방법
회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다. 파기절차 및 방법은 다음과 같습니다.

- 파기절차: 이용자가 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장된 후 파기됩니다.
- 파기방법: 전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.

5. 정보주체와 법정대리인의 권리·무 및 그 행사방법
이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입해지를 요청할 수도 있습니다.
(단, 현재 데모 버전에서는 데이터가 영구 저장되지 않으므로 해당 기능이 제공되지 않습니다.)

6. 개인정보의 안전성 확보 조치
회사는 이용자의 개인정보를 처리함에 있어 개인정보가 분실, 도난, 유출, 변조 또는 훼손되지 않도록 안전성 확보를 위하여 다음과 같은 기술적/관리적 대책을 강구하고 있습니다. (정식 서비스 기준)
- 비밀번호 암호화
- 해킹 등에 대비한 기술적 대책
- 처리 직원의 최소화 및 교육

7. 개인정보 보호책임자
- 이름: OOO
- 직책: 개인정보 보호책임자
- 연락처: contact@classstock.com
(※ 개인정보 보호 관련 문의는 위 연락처로 해주시기 바랍니다.)

8. 고지의 의무
현 개인정보처리방침 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일전부터 서비스 내 '공지사항'을 통해 고지할 것입니다.

- 공고일자: 2024년 1월 1일
- 시행일자: 2024년 1월 1일`;


const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}