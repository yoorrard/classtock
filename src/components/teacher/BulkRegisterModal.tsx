import React, { useState } from 'react';

interface BulkRegisterModalProps {
    onClose: () => void;
    onConfirm: (studentNames: string[]) => void;
}

const BulkRegisterModal: React.FC<BulkRegisterModalProps> = ({ onClose, onConfirm }) => {
    const [namesText, setNamesText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const names = namesText.split('\n').filter(name => name.trim() !== '');
        if (names.length > 0) {
            onConfirm(names);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>학생 일괄 등록</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="student-names">학생들의 이름을 한 줄에 한 명씩 입력해주세요.<br/>(이미 등록된 이름은 제외됩니다.)</label>
                        <textarea
                            id="student-names"
                            className="textarea-field"
                            style={{ minHeight: '200px' }}
                            value={namesText}
                            onChange={(e) => setNamesText(e.target.value)}
                            placeholder={'홍길동\n이순신\n세종대왕'}
                            required
                        />
                    </div>
                    <div className="action-buttons">
                        <button type="button" className="button button-secondary" onClick={onClose}>취소</button>
                        <button type="submit" className="button">등록하기</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkRegisterModal;