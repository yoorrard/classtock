import React, { useState } from 'react';
import { Notice } from '../../types';
import NoticeEditorModal from './NoticeEditorModal';

interface NoticeManagerProps {
    notices: Notice[];
    onSave: (notice: Notice) => void;
    onDelete: (noticeId: string) => void;
}

const NoticeManager: React.FC<NoticeManagerProps> = ({ notices, onSave, onDelete }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

    const handleNew = () => {
        setEditingNotice(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (notice: Notice) => {
        setEditingNotice(notice);
        setIsEditorOpen(true);
    };
    
    const handleSave = (noticeData: Omit<Notice, 'id' | 'createdAt'>) => {
        const noticeToSave: Notice = {
            id: editingNotice?.id || `N${Date.now()}`,
            createdAt: editingNotice?.createdAt || Date.now(),
            ...noticeData,
        };
        onSave(noticeToSave);
        setIsEditorOpen(false);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button onClick={handleNew} className="button" style={{ width: 'auto', padding: '0.5rem 1rem' }}>+ 새 공지사항 작성</button>
            </div>
            <ul className="data-list">
                {notices.map(notice => (
                    <li key={notice.id} className="data-list-item">
                        <div className="stock-info">
                            <span>{notice.title}</span>
                            <small>{new Date(notice.createdAt).toLocaleString()}</small>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                             <button onClick={() => onDelete(notice.id)} className="button button-danger" style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}}>삭제</button>
                             <button onClick={() => handleEdit(notice)} className="button button-secondary" style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}}>수정</button>
                        </div>
                    </li>
                ))}
            </ul>
            {isEditorOpen && (
                <NoticeEditorModal 
                    notice={editingNotice}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default NoticeManager;
