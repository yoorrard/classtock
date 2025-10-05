import React, { useState } from 'react';
import { PopupNotice } from '../../types';
import PopupNoticeEditorModal from './PopupNoticeEditorModal';

interface PopupNoticeManagerProps {
    notices: PopupNotice[];
    onSave: (notice: PopupNotice) => void;
    onDelete: (noticeId: string) => void;
}

const PopupNoticeManager: React.FC<PopupNoticeManagerProps> = ({ notices, onSave, onDelete }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<PopupNotice | null>(null);

    const handleNew = () => {
        setEditingNotice(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (notice: PopupNotice) => {
        setEditingNotice(notice);
        setIsEditorOpen(true);
    };
    
    const handleSave = (noticeData: Omit<PopupNotice, 'id'>) => {
        const noticeToSave: PopupNotice = {
            id: editingNotice?.id || `PN${Date.now()}`,
            ...noticeData,
        };
        onSave(noticeToSave);
        setIsEditorOpen(false);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button onClick={handleNew} className="button" style={{ width: 'auto', padding: '0.5rem 1rem' }}>+ 새 팝업 공지 작성</button>
            </div>
            <ul className="data-list">
                {notices.map(notice => (
                    <li key={notice.id} className="data-list-item">
                        <div className="stock-info">
                            <span>{notice.title}</span>
                            <small>게시 기간: {notice.startDate} ~ {notice.endDate}</small>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                             <button onClick={() => onDelete(notice.id)} className="button button-danger" style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}}>삭제</button>
                             <button onClick={() => handleEdit(notice)} className="button button-secondary" style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}}>수정</button>
                        </div>
                    </li>
                ))}
            </ul>
            {isEditorOpen && (
                <PopupNoticeEditorModal 
                    notice={editingNotice}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default PopupNoticeManager;
