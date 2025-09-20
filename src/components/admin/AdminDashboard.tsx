import React, { useState } from 'react';
import { Notice, QnAPost } from '../../types';
import NoticeManager from './NoticeManager';
import QnAManager from './QnAManager';

interface AdminDashboardProps {
    notices: Notice[];
    qnaPosts: QnAPost[];
    onSaveNotice: (notice: Notice) => void;
    onDeleteNotice: (noticeId: string) => void;
    onAnswerQuestion: (qnaId: string, answer: string) => void;
    onDeleteQnAPost: (qnaId: string) => void;
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ notices, qnaPosts, onSaveNotice, onDeleteNotice, onAnswerQuestion, onDeleteQnAPost, onLogout }) => {
    const [activeTab, setActiveTab] = useState('notices');

    return (
        <div className="container">
            <header className="header" style={{ marginBottom: '1rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>관리자 대시보드</h1>
                        <p style={{ margin: '0.25rem 0 0 0' }}>콘텐츠 관리</p>
                    </div>
                    <button onClick={onLogout} className="button button-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>로그아웃</button>
                </div>
            </header>
            <div className="tabs">
                <button className={`tab-button ${activeTab === 'notices' ? 'active' : ''}`} onClick={() => setActiveTab('notices')}>
                    공지사항 관리 ({notices.length})
                </button>
                <button className={`tab-button ${activeTab === 'qna' ? 'active' : ''}`} onClick={() => setActiveTab('qna')}>
                    Q&A 관리 ({qnaPosts.length})
                </button>
            </div>
            <div className="tab-content">
                {activeTab === 'notices' && (
                    <NoticeManager 
                        notices={notices}
                        onSave={onSaveNotice}
                        onDelete={onDeleteNotice}
                    />
                )}
                {activeTab === 'qna' && (
                    <QnAManager 
                        posts={qnaPosts}
                        onAnswer={onAnswerQuestion}
                        onDelete={onDeleteQnAPost}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;