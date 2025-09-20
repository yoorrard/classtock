import React from 'react';

interface PolicyModalProps {
    title: string;
    content: string;
    onClose: () => void;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ title, content, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <div className="policy-content">
                    <pre>{content}</pre>
                </div>
                 <div className="action-buttons" style={{marginTop: '1.5rem'}}>
                    <button type="button" className="button" style={{width: '100%'}} onClick={onClose}>확인</button>
                </div>
            </div>
        </div>
    );
};

export default PolicyModal;
