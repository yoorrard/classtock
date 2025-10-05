import React, { useState } from 'react';
import { Notice, View, ToastMessage } from '../../types';
import LandingHeader from '../landing/LandingHeader';

interface NoticeBoardProps {
    notices: Notice[];
    onBack: () => void;
    onNavigate: (view: View) => void;
    addToast: (message: string, type?: ToastMessage['type']) => void;
    context?: 'landing' | 'teacher';
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices, onBack, onNavigate, addToast, context = 'landing' }) => {
    const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

    const toggleNotice = (id: string) => {
        setExpandedNoticeId(prevId => (prevId === id ? null : id));
    };

    return (
        <>
            <LandingHeader context={context} onGoHome={onBack} onNavigate={onNavigate} addToast={addToast} />
            <div className="container">
                <header className="header" style={{ marginBottom: '2rem', textAlign: 'left' }}>
                    <h1 style={{ 
                        fontSize: '1.8rem', 
                        margin: 0,
                        color: '#0B6623',
                        background: 'none',
                        WebkitBackgroundClip: 'initial',
                        WebkitTextFillColor: 'initial'
                    }}>공지사항</h1>
                    <p style={{ margin: '0.25rem 0 0 0' }}>ClassStock의 새로운 소식을 확인하세요.</p>
                </header>

                {notices.length > 0 ? (
                    <ul className="board-list">
                        {notices.map(notice => (
                            <li key={notice.id} className="board-item">
                                <div className="board-item-header" onClick={() => toggleNotice(notice.id)}>
                                    <h2 className="board-item-title">{notice.title}</h2>
                                    <span className="board-item-meta">{new Date(notice.createdAt).toLocaleDateString()}</span>
                                </div>
                                {expandedNoticeId === notice.id && (
                                    <div className="board-item-content">
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
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="info-card" style={{ textAlign: 'center' }}>
                        <p>등록된 공지사항이 없습니다.</p>
                    </div>
                )}
                
                <div className="action-buttons" style={{ marginTop: '2rem' }}>
                    <button type="button" className="button button-secondary" style={{ width: '100%' }} onClick={onBack}>
                        {context === 'teacher' ? '대시보드로 돌아가기' : '메인으로 돌아가기'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default NoticeBoard;