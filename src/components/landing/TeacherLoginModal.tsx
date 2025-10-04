import React, { useState } from 'react';

interface TeacherLoginModalProps {
    onClose: () => void;
    onLoginSuccess: () => void;
    onSwitchToRegister: () => void;
    onForgotPassword: () => void;
}
const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({ onClose, onLoginSuccess, onSwitchToRegister, onForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        onLoginSuccess();
    };
    
    const handleGoogleAuth = () => {
        onLoginSuccess();
    };

    const EyeOpenIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    );

    const EyeClosedIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
    );
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>교사 로그인</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <p style={{marginTop:0, marginBottom: '1rem'}}>서비스를 이용하시려면 로그인이 필요합니다.</p>
                
                <button type="button" className="button button-google" onClick={handleGoogleAuth} style={{ width: '100%', marginBottom: '0.5rem' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '10px' }}>
                        <path d="M17.64 9.20455C17.64 8.56591 17.5827 7.95273 17.4764 7.36364H9V10.8455H13.8436C13.6345 11.9705 12.9982 12.9236 12.0664 13.5673V15.8264H15.0145C16.7127 14.2618 17.64 11.9545 17.64 9.20455Z" fill="#4285F4"></path>
                        <path d="M9 18C11.43 18 13.4673 17.1945 14.9564 15.8264L12.0082 13.5673C11.1927 14.1127 10.1564 14.44 9 14.44C6.65455 14.44 4.66364 12.9045 3.95 10.7773H0.954545V13.0455C2.45455 15.9091 5.48182 18 9 18Z" fill="#34A853"></path>
                        <path d="M3.95 10.7773C3.81 10.3573 3.73 9.91727 3.73 9.45C3.73 8.98273 3.81 8.54273 3.95 8.12273V5.85455H0.954545C0.347273 7.10909 0 8.25 0 9.45C0 10.65 0.347273 11.7909 0.954545 13.0455L3.95 10.7773Z" fill="#FBBC05"></path>
                        <path d="M9 3.54545C10.3227 3.54545 11.5073 4 12.44 4.89545L15.0145 2.32182C13.4636 0.886364 11.43 0 9 0C5.48182 0 2.45455 1.90909 0.954545 4.63636L3.95 6.90455C4.66364 4.77727 6.65455 3.54545 9 3.54545Z" fill="#EA4335"></path>
                    </svg>
                    Google 계정으로 로그인
                </button>
                <div className="divider"><span>또는</span></div>
                
                 <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <input 
                            type="email" 
                            className="input-field" 
                            placeholder="이메일 주소" 
                            aria-label="이메일 주소" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="input-group" style={{ position: 'relative' }}>
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            className="input-field" 
                            placeholder="비밀번호" 
                            aria-label="비밀번호" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required 
                        />
                         <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0, lineHeight: 1 }} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>
                            {showPassword ? EyeClosedIcon : EyeOpenIcon}
                        </button>
                    </div>
                    <div style={{ textAlign: 'right', width: '100%', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                        <button type="button" className="button-link" style={{ marginTop: 0 }} onClick={onForgotPassword}>
                            비밀번호를 잊으셨나요?
                        </button>
                    </div>
                    <button type="submit" className="button" style={{ width: '100%' }}>로그인</button>
                </form>

                <button type="button" className="button-link" onClick={onSwitchToRegister}>
                    계정이 없으신가요? 회원가입
                </button>
            </div>
        </div>
    );
};

export default TeacherLoginModal;