import React, { useState } from 'react';

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

export default StudentLoginModal;
