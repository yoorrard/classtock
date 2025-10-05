import React from 'react';
import { PopupNotice } from '../../types';

interface PopupNoticeModalProps {
    notice: PopupNotice;
    onClose: () => void;
}

const PopupNoticeModal: React.FC<PopupNoticeModalProps> = ({ notice, onClose }) => {

    const handleCloseForToday = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        localStorage.setItem(`classstock_popup_dismissed_${notice.id}`, todayStr);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ textAlign: 'left' }}>
                <header className="modal-header">
                    <h2>{notice.title}</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <div className="board-item-content" style={{ padding: '0 0 1.5rem 0', border: 'none', maxHeight: '50vh', overflowY: 'auto' }}>
                    {notice.content}
                    {notice.attachment && (
                        <div className="attachment-section">
                            {notice.attachment.type.startsWith('image/') && (
                                <img 
                                    src={notice.attachment.url} 
                                    alt={notice.attachment.name} 
                                    className="attachment-preview"
                                />
                            )}
                            <p>
                                <strong>첨부파일: </strong>
                                <a 
                                    href={notice.attachment.url} 
                                    download={notice.attachment.name}
                                    className="attachment-link"
                                >
                                    {notice.attachment.name}
                                </a>
                            </p>
                        </div>
                    )}
                </div>
                <div className="action-buttons" style={{ marginTop: 0 }}>
                    <button type="button" className="button button-secondary" onClick={handleCloseForToday}>오늘 하루 닫기</button>
                    <button type="button" className="button" onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
};

export default PopupNoticeModal;
