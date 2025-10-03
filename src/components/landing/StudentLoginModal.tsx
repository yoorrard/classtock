import React, { useState } from 'react';

interface StudentLoginModalProps {
    onClose: () => void;
    onJoin: (code: string, name: string) => void;
}
const StudentLoginModal: React.FC<StudentLoginModalProps> = ({ onClose, onJoin }) => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onJoin(code, name);
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                 <header className="modal-header">
                    <h2>학급 참여하기</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <p style={{marginTop:0, marginBottom: '2rem'}}>선생님께 받은 참여 코드와 이름을 입력하세요.</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input type="text" value={code} onChange={e => setCode(e.target.value)} className="input-field" placeholder="학급 참여 코드" required />
                    </div>
                    <div className="input-group">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="이름" required />
                    </div>
                    <button type="submit" className="button" style={{width: '100%'}}>참여하기</button>
                </form>
                <div className="action-buttons" style={{marginTop: '1rem'}}>
                    <button type="button" className="button button-secondary" style={{width: '100%'}} onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
};

export default StudentLoginModal;