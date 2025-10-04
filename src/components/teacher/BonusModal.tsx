import React, { useState } from 'react';
import { StudentInfo } from '../../types';

interface BonusModalProps {
    students: StudentInfo[];
    onClose: () => void;
    onConfirm: (amount: number, reason: string) => void;
}
const BonusModal: React.FC<BonusModalProps> = ({ students, onClose, onConfirm }) => {
    const [amount, setAmount] = useState<string>('10000');
    const [reason, setReason] = useState<string>('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = Number(amount);
        if (numericAmount > 0 && numericAmount <= 10000000) {
            onConfirm(numericAmount, reason.trim());
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setAmount(value);
        }
    };

    const recipientText = students.length === 1 ? students[0].nickname : `${students.length}명`;
    const numericAmountForCheck = Number(amount);
    const isConfirmDisabled = !(numericAmountForCheck > 0 && numericAmountForCheck <= 10000000);

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
                        <input id="bonus-amount" type="number" min="1" max="10000000" step="1" className="input-field" value={amount} onChange={handleAmountChange} required />
                    </div>
                     <div className="input-group">
                        <label htmlFor="bonus-reason">지급 사유 (선택 사항)</label>
                        <input id="bonus-reason" type="text" className="input-field" value={reason} onChange={e => setReason(e.target.value)} placeholder="예: 우수 과제 제출" />
                    </div>
                    <div className="action-buttons">
                        <button type="button" className="button button-secondary" onClick={onClose}>취소</button>
                        <button type="submit" className="button" disabled={isConfirmDisabled}>지급하기</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BonusModal;