import React, { useState } from 'react';

interface AdminLoginModalProps {
    onClose: () => void;
    onLogin: (password: string) => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onLogin }) => {
    const [password, setPassword] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(password);
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                 <header className="modal-header">
                    <h2>관리자 로그인</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="admin-password">비밀번호</label>
                        <input 
                            id="admin-password"
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="input-field" 
                            placeholder="관리자 비밀번호를 입력하세요."
                            required 
                            autoFocus
                        />
                    </div>
                    <div className="action-buttons">
                        <button type="button" className="button button-secondary" onClick={onClose}>취소</button>
                        <button type="submit" className="button">로그인</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginModal;
