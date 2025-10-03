import React, { useState } from 'react';
import { ClassInfo, StudentInfo, Stock, ToastMessage } from '../../types';
import StockManager from './StockManager';
import RankingBoard from '../shared/RankingBoard';
import BonusModal from './BonusModal';
import StudentPortfolioModal from './StudentPortfolioModal';
import BulkRegisterModal from './BulkRegisterModal';

interface ClassDetailViewProps { 
    onBack: () => void;
    classInfo: ClassInfo; 
    students: (StudentInfo & { totalAssets: number })[]; 
    allStocks: Stock[]; 
    onUpdateClassStocks: (updated: string[]) => void; 
    onAwardBonus: (studentIds: string[], amount: number, reason: string) => void;
    addToast: (message: string, type?: ToastMessage['type']) => void;
    onBulkRegister: (classId: string, studentNames: string[]) => void;
}
const ClassDetailView: React.FC<ClassDetailViewProps> = ({ onBack, classInfo, students, allStocks, onUpdateClassStocks, onAwardBonus, addToast, onBulkRegister }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
    const [isBulkRegisterModalOpen, setIsBulkRegisterModalOpen] = useState(false);
    const [bonusRecipients, setBonusRecipients] = useState<(StudentInfo & { totalAssets: number })[]>([]);
    const [viewingStudent, setViewingStudent] = useState<(StudentInfo & { totalAssets: number }) | null>(null);
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
    
    const handleConfirmBulkRegister = (names: string[]) => {
        onBulkRegister(classInfo.id, names);
        setIsBulkRegisterModalOpen(false);
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
                {activeTab === 'info' && <div className="info-section info-section-grid"><div className="info-card"><h4>학급 참여 코드</h4><p>학생들에게 이 코드를 공유하여 학급에 참여하도록 하세요.</p><div className="join-code-box"><span>{joinCode}</span><button onClick={copyCode} className="button button-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>복사</button></div></div><div className="info-card"><h4>학급 정보</h4><p><strong>기간:</strong> {classInfo.startDate} ~ {classInfo.endDate}</p><p><strong>초기 시드머니:</strong> {classInfo.seedMoney.toLocaleString()}원</p><p><strong>거래 수수료:</strong> {classInfo.hasCommission ? `${classInfo.commissionRate}%` : '없음'}</p></div></div>}
                {activeTab === 'students' && <div className="info-section">{students.length > 0 ? (
                    <>
                        <div className="student-management-bar">
                            <div className="select-all-group">
                                <input type="checkbox" id="select-all-students" checked={allStudentsSelected} onChange={handleSelectAll} disabled={students.length === 0} />
                                <label htmlFor="select-all-students">전체 선택 ({selectedStudentIds.size}/{students.length})</label>
                            </div>
                            <div className="action-buttons-group">
                                <button onClick={() => setIsBulkRegisterModalOpen(true)} className="button" style={{padding: '0.3rem 0.8rem', fontSize: '0.8rem'}}>학생 일괄 등록</button>
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
                ) : (
                <>
                    <div className="info-card" style={{textAlign: 'center'}}><p>아직 참여한 학생이 없습니다.</p></div>
                    <div style={{textAlign: 'center', marginTop: '2rem'}}>
                        <button onClick={() => setIsBulkRegisterModalOpen(true)} className="button">학생 명단 등록하기</button>
                    </div>
                </>
                )}</div>}
                {activeTab === 'stocks' && <StockManager allowedStocks={classInfo.allowedStocks} allStocks={allStocks} onSave={onUpdateClassStocks} />}
                {activeTab === 'ranking' && <RankingBoard students={students} />}
            </div>
             <div className="action-buttons" style={{marginTop: '2rem'}}><button type="button" className="button button-secondary" style={{width: '100%'}} onClick={onBack}>대시보드로 돌아가기</button></div>
             {isBulkRegisterModalOpen && <BulkRegisterModal onClose={() => setIsBulkRegisterModalOpen(false)} onConfirm={handleConfirmBulkRegister} />}
             {isBonusModalOpen && <BonusModal students={bonusRecipients} onClose={() => setIsBonusModalOpen(false)} onConfirm={handleConfirmBonus} />}
             {viewingStudent && <StudentPortfolioModal student={viewingStudent} stocks={allStocks} onClose={() => setViewingStudent(null)} />}
        </div>
    );
};

export default ClassDetailView;