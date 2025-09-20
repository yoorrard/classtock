import React, { useState, useEffect, useRef } from 'react';
import { Notice } from '../../types';

interface NoticeEditorModalProps {
    notice: Notice | null;
    onClose: () => void;
    onSave: (data: Omit<Notice, 'id' | 'createdAt'>) => void;
}

type Attachment = { name: string; url: string; type: string; };

const NoticeEditorModal: React.FC<NoticeEditorModalProps> = ({ notice, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (notice) {
            setTitle(notice.title);
            setContent(notice.content);
            setAttachment(notice.attachment || null);
        }
    }, [notice]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setAttachment({
                        name: file.name,
                        url: event.target.result as string,
                        type: file.type,
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, content, attachment: attachment || undefined });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{notice ? '공지사항 수정' : '새 공지사항 작성'}</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="notice-title">제목</label>
                        <input
                            id="notice-title"
                            type="text"
                            className="input-field"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="notice-content">내용</label>
                        <textarea
                            id="notice-content"
                            className="textarea-field"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>파일 첨부 (선택 사항)</label>
                        <input type="file" id="file-upload" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                        <label htmlFor="file-upload" className="file-input-label">파일 선택</label>
                        {attachment && (
                            <div className="attached-file-info">
                                <span>{attachment.name}</span>
                                <button type="button" onClick={removeAttachment} className="button button-danger" style={{width: 'auto', fontSize:'0.8rem', padding: '0.2rem 0.5rem'}}>제거</button>
                            </div>
                        )}
                    </div>
                    <div className="action-buttons">
                        <button type="button" className="button button-secondary" onClick={onClose}>취소</button>
                        <button type="submit" className="button">저장하기</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NoticeEditorModal;