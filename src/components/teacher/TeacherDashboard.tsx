import React, { useState } from 'react';
import { ClassInfo } from '../../types';
import CreateClassModal from './CreateClassModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const ClassCard: React.FC<{ classInfo: ClassInfo; onManage: () => void; onDelete: () => void; }> = ({ classInfo, onManage, onDelete }) => {
    return (
        <div className="class-card">
            <h3>{classInfo.name}</h3>
            <p><strong>기간:</strong> {classInfo.startDate} ~ {classInfo.endDate}</p>
            <p><strong>초기 시드머니:</strong> {classInfo.seedMoney.toLocaleString()}원</p>
            <p><strong>거래 수수료:</strong> {classInfo.hasCommission ? `${classInfo.commissionRate}%` : '없음'}</p>
            <div className="class-card-actions">
                <button onClick={onDelete} className="button button-danger" style={{width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem'}}>삭제</button>
                <button onClick={onManage} className="button button-manage" style={{width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem'}}>학급 관리</button>
            </div>
        </div>
    );
};
interface TeacherDashboardProps {
    onBack: () => void;
    classes: ClassInfo[];
    onCreateClass: (newClassData: Omit<ClassInfo, 'id' | 'allowedStocks'>) => void;
    onSelectClass: (classId: string) => void;
    onDeleteClass: (classId: string) => void;
}
const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBack, classes, onCreateClass, onSelectClass, onDeleteClass }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState<ClassInfo | null>(null);

    const handleCreate = (newClassData: Omit<ClassInfo, 'id' | 'allowedStocks'>) => { onCreateClass(newClassData); setIsModalOpen(false); };
    
    const handleDeleteConfirm = () => {
        if (classToDelete) {
            onDeleteClass(classToDelete.id);
            setClassToDelete(null);
        }
    };
    
    const hasClasses = classes.length > 0;
    const isClassLimitReached = classes.length >= 2;

    return (
        <div className="container">
            <header className="header" style={{ marginBottom: '2rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', margin: 0, color: '#0B6623', background: 'none', WebkitBackgroundClip: 'initial', WebkitTextFillColor: 'initial' }}>교사 대시보드</h1>
                        <p style={{ margin: '0.25rem 0 0 0' }}>{hasClasses ? '내 학급 목록입니다.' : '학급을 만들고 관리하세요.'}</p>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                        {hasClasses && (<button 
                            onClick={() => setIsModalOpen(true)} 
                            className="button" 
                            style={{ width: 'auto', padding: '0.5rem 1rem' }}
                            disabled={isClassLimitReached}
                            title={isClassLimitReached ? '학급은 최대 2개까지 생성할 수 있습니다.' : '새로운 학급을 만듭니다.'}
                        >
                            + 새 학급
                        </button>)}
                        <button onClick={onBack} className="button button-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>로그아웃</button>
                    </div>
                </div>
            </header>
            {hasClasses ? (
                <div className="class-list">
                    {classes.map(c => 
                        <ClassCard 
                            key={c.id} 
                            classInfo={c} 
                            onManage={() => onSelectClass(c.id)}
                            onDelete={() => setClassToDelete(c)}
                        />
                    )}
                </div>
            ) : (
                <div className="dashboard-content" style={{textAlign: 'center', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                     <p>아직 생성된 학급이 없습니다.</p><p style={{marginBottom: '2rem'}}>새 학급을 만들어 학생들을 초대해보세요!</p>
                     <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="button" 
                        style={{width: 'auto', padding: '1rem 2rem', alignSelf: 'center'}}
                        disabled={isClassLimitReached}
                        title={isClassLimitReached ? '학급은 최대 2개까지 생성할 수 있습니다.' : '새로운 학급을 만듭니다.'}
                    >
                        + 새 학급 만들기
                    </button>
                </div>
            )}
            {isModalOpen && <CreateClassModal onClose={() => setIsModalOpen(false)} onCreate={handleCreate} />}
            {classToDelete && <DeleteConfirmationModal classInfo={classToDelete} onClose={() => setClassToDelete(null)} onConfirm={handleDeleteConfirm} />}
        </div>
    );
};

export default TeacherDashboard;