import React, { useState } from 'react';

interface PasswordResetModalProps {
    onClose: () => void;
    onRequestReset: (email: string) => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ onClose, onRequestReset }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            onRequestReset(email);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>비밀번호 재설정</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <p style={{ marginTop: 0, marginBottom: '2rem' }}>
                    가입 시 사용한 이메일 주소를 입력하시면, 비밀번호를 재설정할 수 있는 이메일을 보내드립니다.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="reset-email">이메일 주소</label>
                        <input
                            id="reset-email"
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="이메일 주소"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="action-buttons">
                        <button type="button" className="button button-secondary" onClick={onClose}>취소</button>
                        <button type="submit" className="button">비밀번호 재설정 요청</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordResetModal;