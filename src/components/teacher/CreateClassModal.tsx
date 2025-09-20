import React, { useState } from 'react';
import { ClassInfo } from '../../types';

interface CreateClassModalProps {
    onClose: () => void;
    onCreate: (newClass: Omit<ClassInfo, 'id' | 'allowedStocks'>) => void;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({ onClose, onCreate }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dateError, setDateError] = useState('');
    const [applyCommission, setApplyCommission] = useState(true);
    const [commissionRate, setCommissionRate] = useState('0.1');
    const today = new Date().toISOString().split('T')[0];

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        setDateError('');
        if (endDate && newStartDate > endDate) {
            setEndDate('');
        }
    };
    
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
        setDateError('');
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            setDateError('종료일을 시작일 이후로 입력하세요.');
            return;
        }

        const newClass = {
            name: formData.get('className') as string,
            startDate,
            endDate,
            seedMoney: Number(formData.get('seedMoney')),
            hasCommission: applyCommission,
            commissionRate: applyCommission ? Number(commissionRate) : 0,
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
                        <div className="input-group">
                            <label htmlFor="startDate">활동 시작일</label>
                            <input id="startDate" name="startDate" type="date" className="input-field" min={today} value={startDate} onChange={handleStartDateChange} required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="endDate">활동 종료일</label>
                            <input id="endDate" name="endDate" type="date" className="input-field" min={startDate || today} value={endDate} onChange={handleEndDateChange} required />
                        </div>
                    </div>
                    {dateError && <p className="error-message">{dateError}</p>}
                    <div className="input-group"><label htmlFor="seedMoney">초기 시드머니</label><input id="seedMoney" name="seedMoney" type="number" className="input-field" placeholder="예: 1000000" required /></div>
                    
                    <div className="input-group">
                        <label>거래 수수료 설정</label>
                        <div className="checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f7f9fc', padding: '0.75rem', borderRadius: '8px' }}>
                            <input id="applyCommission" name="applyCommission" type="checkbox" style={{width: '16px', height: '16px'}} checked={applyCommission} onChange={e => setApplyCommission(e.target.checked)} />
                            <label htmlFor="applyCommission" style={{ marginBottom: 0, fontWeight: 'normal' }}>거래 수수료 적용</label>
                        </div>
                    </div>

                    {applyCommission && (
                        <div className="input-group">
                            <label htmlFor="commissionRate">거래 수수료율 (%)</label>
                            <input id="commissionRate" name="commissionRate" type="text" inputMode="decimal" className="input-field" placeholder="예: 0.1" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} required />
                        </div>
                    )}

                    <div className="action-buttons"><button type="button" className="button button-secondary" onClick={onClose}>취소</button><button type="submit" className="button">생성하기</button></div>
                </form>
            </div>
        </div>
    );
};

export default CreateClassModal;
