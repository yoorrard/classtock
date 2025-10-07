import React, { useState, useMemo } from 'react';
import { ClassInfo, StudentInfo, Stock, ToastMessage, Transaction } from '../../types';
import RankingBoard from '../shared/RankingBoard';
import BonusModal from './BonusModal';
import StudentPortfolioModal from './StudentPortfolioModal';
import BulkRegisterModal from './BulkRegisterModal';
import DeleteStudentConfirmationModal from './DeleteStudentConfirmationModal';

type ExtendedStudentInfo = StudentInfo & {
    totalAssets: number;
    totalProfit: number;
    totalProfitRate: number;
    investmentProfit: number;
    investmentProfitRate: number;
};

interface ClassDetailViewProps {
    onBack: () => void;
    classInfo: ClassInfo;
    students: ExtendedStudentInfo[];
    stocks: Stock[];
    transactions: Transaction[];
    onAwardBonus: (studentIds: string[], amount: number, reason: string) => void;
    addToast: (message: string, type?: ToastMessage['type']) => void;
    onBulkRegister: (classId: string, studentNames: string[]) => void;
    onDeleteStudent: (studentId: string) => void;
}
const ClassDetailView: React.FC<ClassDetailViewProps> = ({ onBack, classInfo, students, stocks, transactions, onAwardBonus, addToast, onBulkRegister, onDeleteStudent }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
    const [isBulkRegisterModalOpen, setIsBulkRegisterModalOpen] = useState(false);
    const [bonusRecipients, setBonusRecipients] = useState<ExtendedStudentInfo[]>([]);
    const [viewingStudent, setViewingStudent] = useState<ExtendedStudentInfo | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<ExtendedStudentInfo | null>(null);
    const [rankingSortBy, setRankingSortBy] = useState<'totalAssets' | 'profitRate'>('totalAssets');

    const joinCode = `C${classInfo.id.substring(classInfo.id.length - 6)}`;
    const copyCode = () => navigator.clipboard.writeText(joinCode).then(() => addToast('참여 코드가 복사되었습니다!', 'success'));

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

    const openBonusModal = (recipients: ExtendedStudentInfo[]) => {
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

    const handleConfirmBulkRegister = (names: string[]) => {
        onBulkRegister(classInfo.id, names);
        setIsBulkRegisterModalOpen(false);
    };

    const handleConfirmDeleteStudent = () => {
        if (studentToDelete) {
            onDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
        }
    };

    const selectedStudents = students.filter(s => selectedStudentIds.has(s.id));
    const allStudentsSelected = students.length > 0 && selectedStudentIds.size === students.length;

    const sortedStudentsForRanking = useMemo(() => {
        return [...students].sort((a, b) => {
            if (rankingSortBy === 'profitRate') {
                return b.investmentProfitRate - a.investmentProfitRate;
            }
            return b.totalAssets - a.totalAssets; // default to totalAssets
        });
    }, [students, rankingSortBy]);
    
    return (
        <div className="container">
            <header className="header" style={{ marginBottom: '1rem', textAlign: 'left' }}><h1 style={{ fontSize: '1.8rem', margin: 0 }}>{classInfo.name}</h1><p style={{ margin: '0.25rem 0 0 0' }}>학급 관리</p></header>
            <div className="tabs">
                <button className={`tab-button ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>기본 정보</button>
                <button className={`tab-button ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>학생 관리 ({students.length})</button>
                <button className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>포트폴리오</button>
                <button className={`tab-button ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>랭킹 보드</button>
            </div>
            <div className="tab-content">
                {activeTab === 'info' && <div className="info-section info-section-grid"><div className="info-card"><h4>학급 참여 코드</h4><p>학생들에게 이 코드를 공유하여 학급에 참여하도록 하세요.</p><div className="join-code-box"><span>{joinCode}</span><button onClick={copyCode} className="button button-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>복사</button></div></div><div className="info-card"><h4>학급 정보</h4><p><strong>기간:</strong> {classInfo.startDate} ~ {classInfo.endDate}</p><p><strong>초기 시드머니:</strong> {classInfo.seedMoney.toLocaleString()}원</p><p><strong>거래 수수료:</strong> {classInfo.hasCommission ? `${classInfo.commissionRate}%` : '없음'}</p></div></div>}
                {activeTab === 'students' && <div className="info-section">{students.length > 0 ? (
                    <>
                        <div className="student-management-bar">
                             <div className="select-all-group">
                                <input type="checkbox" id="select-all-students" checked={allStudentsSelected} onChange={handleSelectAll} disabled={students.length === 0} />
                                <label htmlFor="select-all-students">전체 선택 ({selectedStudentIds.size}/{students.length})</label>
                            </div>
                            <div className="action-buttons-group">
                                <button onClick={() => setIsBulkRegisterModalOpen(true)} className="button">학생 일괄 등록</button>
                                <button onClick={() => openBonusModal(selectedStudents)} disabled={selectedStudentIds.size === 0} className="button button-bonus">선택 학생 보너스</button>
                                <button onClick={() => openBonusModal(students)} disabled={students.length === 0} className="button button-bonus">전체 학생 보너스</button>
                            </div>
                        </div>
                        <ul className="data-list">{students.map(s => (
                            <li key={s.id} className="data-list-item">
                                <div className="student-select-info">
                                    <input type="checkbox" checked={selectedStudentIds.has(s.id)} onChange={() => handleSelectStudent(s.id)} onClick={(e) => e.stopPropagation()} />
                                    <span>{s.nickname}</span>
                                </div>
                                <div>
                                    <button onClick={() => setStudentToDelete(s)} className="button button-danger" style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}}>삭제</button>
                                </div>
                            </li>
                        ))}</ul>
                    </>
                ) : (
                <>
                    <div className="info-card" style={{textAlign: 'center'}}><p>아직 참여한 학생이 없습니다.</p></div>
                    <div style={{textAlign: 'center', marginTop: '2rem'}}>
                        <button onClick={() => setIsBulkRegisterModalOpen(true)} className="button">학생 명단 등록하기</button>
                    </div>
                </>
                )}</div>}
                {activeTab === 'portfolio' && (
                    <div className="info-section">
                        {students.length > 0 ? (
                            <div className="portfolio-grid class-list">
                                {students.map(student => {
                                    const profitClass = student.investmentProfit > 0 ? 'positive' : student.investmentProfit < 0 ? 'negative' : 'neutral';
                                    return (
                                        <div key={student.id} className="class-card" style={{cursor: 'pointer'}} onClick={() => setViewingStudent(student)}>
                                            <h3 style={{marginBottom: '1rem'}}>{student.nickname}</h3>
                                            <p><strong>총 자산:</strong> {student.totalAssets.toLocaleString()}원</p>
                                            <p className={profitClass}>
                                                <strong>투자 수익금(률):</strong>{' '}
                                                {student.investmentProfit !== 0 && (
                                                    <span style={{marginRight: '0.25rem'}}>
                                                        {student.investmentProfit > 0 ? '▲' : '▼'}
                                                    </span>
                                                )}
                                                {Math.abs(student.investmentProfit).toLocaleString()}원 ({student.investmentProfitRate.toFixed(2)}%)
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : <div className="info-card" style={{textAlign: 'center'}}><p>아직 포트폴리오를 분석할 학생이 없습니다.</p></div>}
                    </div>
                )}
                {activeTab === 'ranking' && (
                    <div className="info-section">
                        <div className="student-management-bar">
                             <span>정렬 기준:</span>
                             <div className="action-buttons-group">
                                 <button 
                                     onClick={() => setRankingSortBy('totalAssets')} 
                                     className={`button ${rankingSortBy === 'totalAssets' ? '' : 'button-secondary'}`}
                                 >
                                     총 자산
                                 </button>
                                 <button 
                                     onClick={() => setRankingSortBy('profitRate')} 
                                     className={`button ${rankingSortBy === 'profitRate' ? '' : 'button-secondary'}`}
                                 >
                                     투자 수익률
                                 </button>
                             </div>
                        </div>
                        <RankingBoard students={sortedStudentsForRanking} sortBy={rankingSortBy} />
                    </div>
                )}
            </div>
             <div className="action-buttons" style={{marginTop: '2rem'}}><button type="button" className="button button-secondary" style={{width: '100%'}} onClick={onBack}>대시보드로 돌아가기</button></div>
             {isBulkRegisterModalOpen && <BulkRegisterModal onClose={() => setIsBulkRegisterModalOpen(false)} onConfirm={handleConfirmBulkRegister} />}
             {isBonusModalOpen && <BonusModal students={bonusRecipients} onClose={() => setIsBonusModalOpen(false)} onConfirm={handleConfirmBonus} />}
             {viewingStudent && <StudentPortfolioModal 
                student={viewingStudent} 
                stocks={stocks} 
                onClose={() => setViewingStudent(null)}
                transactions={transactions.filter(t => t.studentId === viewingStudent.id)}
             />}
             {studentToDelete && <DeleteStudentConfirmationModal student={studentToDelete} onClose={() => setStudentToDelete(null)} onConfirm={handleConfirmDeleteStudent} />}
        </div>
    );
};

export default ClassDetailView;