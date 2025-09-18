import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// --- DATA TYPES ---
type View = 'landing' | 'student_join' | 'student_register' | 'teacher_login' | 'teacher_dashboard' | 'class_detail' | 'student_dashboard';

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
    const [joiningClassId, setJoiningClassId] = useState<string | null>(null);
    const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
    
    // --- AUTO TIME SIMULATION (KST 4 PM) ---
    useEffect(() => {
        const lastUpdateTimestampStr = localStorage.getItem('classtock_lastUpdateTime');
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
        
        localStorage.setItem('classtock_lastUpdateTime', now.getTime().toString());
        
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
    
    const handleStudentJoinAttempt = (code: string): boolean => {
        const classToJoin = classes.find(c => `C${c.id.substring(c.id.length - 6)}`.toLowerCase() === code.toLowerCase().trim());
        if (classToJoin) {
            setJoiningClassId(classToJoin.id);
            setView('student_register');
            return true;
        }
        return false;
    };

    const handleStudentRegister = (nickname: string) => {
        if (!joiningClassId) return;
        const classInfo = classes.find(c => c.id === joiningClassId);
        if (!classInfo) return;

        const newStudent: StudentInfo = {
            id: `S${Date.now()}`, nickname, classId: joiningClassId, cash: classInfo.seedMoney, portfolio: [],
        };
        setStudents(prev => [...prev, newStudent]);
        setCurrentStudentId(newStudent.id);
        setJoiningClassId(null);
        setView('student_dashboard');
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

    const handleAwardBonus = (studentId: string, amount: number) => {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, cash: s.cash + amount } : s));
        const newTransaction: Transaction = {
            id: `T${Date.now()}`, studentId, stockCode: "BONUS", stockName: "학급 보너스", type: 'bonus', quantity: 1, price: amount, timestamp: Date.now()
        };
        setTransactions(prev => [newTransaction, ...prev]);
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
            case 'student_join': return <StudentJoinPortal onBack={() => setView('landing')} onCodeSubmit={handleStudentJoinAttempt} />;
            case 'student_register': return <StudentRegisterPortal onBack={() => setView('student_join')} onRegister={handleStudentRegister} />;
            case 'teacher_login': return <TeacherLoginPortal onBack={() => setView('landing')} onLoginSuccess={() => setView('teacher_dashboard')} />;
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
            default: return <LandingPage onSelectRole={setView} />;
        }
    };

    return <div className="app-container">{renderView()}</div>;
};

// --- COMPONENTS ---

interface LandingPageProps { onSelectRole: (role: View) => void; }
const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => { 
    return (
        <div className="container" style={{ position: 'relative' }}>
            <header className="header">
                <h1>클래스톡</h1>
                <p>선생님과 함께하는 즐거운 금융 교실</p>
            </header>
            <div className="role-selection">
                <div className="role-card" role="region" aria-labelledby="teacher_title">
                    <h2 id="teacher_title">교사용</h2>
                    <p>학급을 만들고 학생들의 투자를 관리하세요.</p>
                    <button className="button" onClick={() => onSelectRole('teacher_login')} aria-label="교사용으로 시작하기">
                        시작하기
                    </button>
                </div>
                <div className="role-card" role="region" aria-labelledby="student_title">
                    <h2 id="student_title">학생용</h2>
                    <p>참여 코드를 입력하고 모의투자를 시작하세요.</p>
                    <button className="button" onClick={() => onSelectRole('student_join')} aria-label="학생용으로 참여하기">
                        참여하기
                    </button>
                </div>
            </div>
            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}>
                <button
                    onClick={() => onSelectRole('teacher_dashboard')}
                    style={{ background: '#ffc107', color: 'black', border: 'none', borderRadius: '8px', width: '50px', height: '30px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', }}
                    title="개발자용 바로가기" aria-label="개발자용 대시보드 바로가기"
                > DEV </button>
            </div>
        </div>
    );
};
interface PortalProps { onBack: () => void; }
interface StudentJoinProps extends PortalProps { onCodeSubmit: (code: string) => boolean; }
const StudentJoinPortal: React.FC<StudentJoinProps> = ({ onBack, onCodeSubmit }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onCodeSubmit(code);
        if (!success) {
            setError('유효하지 않은 참여 코드입니다. 다시 확인해주세요.');
        }
    };
    
    return (
        <div className="container">
            <header className="header">
                <h1>학급 참여하기</h1>
                <p>선생님께 받은 참여 코드를 입력해주세요.</p>
            </header>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <input type="text" className="input-field" placeholder="학급 참여 코드" aria-label="학급 참여 코드" value={code} onChange={(e) => setCode(e.target.value)} required />
                </div>
                {error && <p className="error-message">{error}</p>}
                <div className="action-buttons">
                    <button type="button" className="button button-secondary" onClick={onBack}>뒤로가기</button>
                    <button type="submit" className="button">다음</button>
                </div>
            </form>
        </div>
    );
};
interface StudentRegisterProps extends PortalProps { onRegister: (nickname: string) => void; }
const StudentRegisterPortal: React.FC<StudentRegisterProps> = ({ onBack, onRegister }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const nickname = formData.get('nickname') as string;
        if (nickname) {
            onRegister(nickname);
        }
    };
    return (
        <div className="container">
            <header className="header"><h1>프로필 설정</h1><p>사용할 닉네임과 비밀번호를 입력해주세요.</p></header>
            <form onSubmit={handleSubmit}>
                <div className="input-group"><input type="text" name="nickname" className="input-field" placeholder="닉네임" aria-label="닉네임" required /></div>
                <div className="input-group"><input type="password" className="input-field" placeholder="비밀번호" aria-label="비밀번호" required /></div>
                <div className="action-buttons">
                    <button type="button" className="button button-secondary" onClick={onBack}>뒤로가기</button>
                    <button type="submit" className="button">참여 완료</button>
                </div>
            </form>
        </div>
    );
};
interface TeacherLoginPortalProps extends PortalProps { onLoginSuccess: () => void; }
const TeacherLoginPortal: React.FC<TeacherLoginPortalProps> = ({ onBack, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onLoginSuccess(); };
    return (
        <div className="container">
            <header className="header"><h1>{isLogin ? '교사 로그인' : '교사 회원가입'}</h1><p>서비스를 이용하시려면 {isLogin ? '로그인이' : '회원가입이'} 필요합니다.</p></header>
            <form onSubmit={handleSubmit}>
                <div className="input-group"><input type="email" className="input-field" placeholder="이메일 주소" aria-label="이메일 주소" required /></div>
                <div className="input-group"><input type="password" className="input-field" placeholder="비밀번호" aria-label="비밀번호" required /></div>
                <button type="submit" className="button" style={{ width: '100%', marginBottom: '1rem' }}>{isLogin ? '로그인' : '회원가입'}</button>
            </form>
            <p style={{ fontSize: '0.9rem', color: '#666', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>{isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}</p>
            <div className="action-buttons" style={{marginTop: 0}}><button type="button" className="button button-secondary" style={{width: '100%'}} onClick={onBack}>메인으로</button></div>
        </div>
    );
};
interface CreateClassModalProps { onClose: () => void; onCreate: (newClass: Omit<ClassInfo, 'id' | 'allowedStocks'>) => void; }
const CreateClassModal: React.FC<CreateClassModalProps> = ({ onClose, onCreate }) => { 
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newClass = { name: formData.get('className') as string, startDate: formData.get('startDate') as string, endDate: formData.get('endDate') as string, seedMoney: Number(formData.get('seedMoney')), };
        onCreate(newClass);
    };
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header"><h2>새 학급 만들기</h2><button onClick={onClose} className="close-button" aria-label="닫기">&times;</button></header>
                <form onSubmit={handleSubmit}>
                    <div className="input-group"><label htmlFor="className">학급 이름</label><input id="className" name="className" type="text" className="input-field" placeholder="예: 1학년 1반 금융 교실" required /></div>
                    <div className="input-group-row">
                        <div className="input-group"><label htmlFor="startDate">활동 시작일</label><input id="startDate" name="startDate" type="date" className="input-field" required /></div>
                        <div className="input-group"><label htmlFor="endDate">활동 종료일</label><input id="endDate" name="endDate" type="date" className="input-field" required /></div>
                    </div>
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
        <div>
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
    student: StudentInfo;
    onClose: () => void;
    onConfirm: (amount: number) => void;
}
const BonusModal: React.FC<BonusModalProps> = ({ student, onClose, onConfirm }) => {
    const [amount, setAmount] = useState<number>(10000);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount > 0) {
            onConfirm(amount);
        }
    };
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>보너스 지급</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <p style={{textAlign: 'left', marginTop: 0}}><strong>{student.nickname}</strong> 학생에게 보너스를 지급합니다.</p>
                    <div className="input-group">
                        <label htmlFor="bonus-amount">지급할 금액</label>
                        <input id="bonus-amount" type="number" min="1" step="1000" className="input-field" value={amount} onChange={e => setAmount(Number(e.target.value))} required />
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
    onAwardBonus: (studentId: string, amount: number) => void;
}
const ClassDetailView: React.FC<ClassDetailViewProps> = ({ onBack, classInfo, students, allStocks, onUpdateClassStocks, onAwardBonus }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [bonusStudent, setBonusStudent] = useState<(StudentInfo & { totalAssets: number }) | null>(null);
    const [viewingStudent, setViewingStudent] = useState<(StudentInfo & { totalAssets: number }) | null>(null);
    const joinCode = `C${classInfo.id.substring(classInfo.id.length - 6)}`;
    const copyCode = () => navigator.clipboard.writeText(joinCode).then(() => alert('참여 코드가 복사되었습니다!'));

    const handleConfirmBonus = (amount: number) => {
        if (bonusStudent) {
            onAwardBonus(bonusStudent.id, amount);
            setBonusStudent(null);
        }
    };
    
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
                {activeTab === 'info' && <div className="info-section"><div className="info-card"><h4>학급 참여 코드</h4><p>학생들에게 이 코드를 공유하여 학급에 참여하도록 하세요.</p><div className="join-code-box"><span>{joinCode}</span><button onClick={copyCode} className="button button-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>복사</button></div></div><div className="info-card"><h4>학급 정보</h4><p><strong>기간:</strong> {classInfo.startDate} ~ {classInfo.endDate}</p><p><strong>초기 시드머니:</strong> {classInfo.seedMoney.toLocaleString()}원</p></div></div>}
                {activeTab === 'students' && <div className="info-section">{students.length > 0 ? <ul className="data-list">{students.map(s => <li key={s.id} className="data-list-item student-list-item-clickable" onClick={() => setViewingStudent(s)}><span>{s.nickname}</span><span style={{color: '#555', fontSize: '0.9rem'}}>자산: {s.totalAssets.toLocaleString()}원</span><button onClick={(e) => { e.stopPropagation(); setBonusStudent(s); }} className="button button-bonus">+ 보너스</button></li>)}</ul> : <div className="info-card" style={{textAlign: 'center'}}><p>아직 참여한 학생이 없습니다.</p></div>}</div>}
                {activeTab === 'stocks' && <StockManager allowedStocks={classInfo.allowedStocks} allStocks={allStocks} onUpdate={onUpdateClassStocks} />}
                {activeTab === 'ranking' && <RankingBoard students={students} />}
            </div>
             <div className="action-buttons" style={{marginTop: '2rem'}}><button type="button" className="button button-secondary" style={{width: '100%'}} onClick={onBack}>대시보드로 돌아가기</button></div>
             {bonusStudent && <BonusModal student={bonusStudent} onClose={() => setBonusStudent(null)} onConfirm={handleConfirmBonus} />}
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
        const profitRate = (profit / (item.averagePrice * item.quantity)) * 100;
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
                                <div className="stock-info"><span style={{color: 'var(--bonus-color)'}}>{t.stockName}</span><small>{new Date(t.timestamp).toLocaleString()}</small></div>
                                <div style={{color: 'var(--bonus-color)', fontWeight: '700'}}>+{t.price.toLocaleString()}원</div>
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


const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}