import React, { useState } from 'react';
import { QnAPost } from '../../types';
import QnAAnswerModal from './QnAAnswerModal';

interface QnAManagerProps {
    posts: QnAPost[];
    onAnswer: (qnaId: string, answer: string) => void;
    onDelete: (qnaId: string) => void;
}

const QnAManager: React.FC<QnAManagerProps> = ({ posts, onAnswer, onDelete }) => {
    const [answeringPost, setAnsweringPost] = useState<QnAPost | null>(null);

    const handleSaveAnswer = (answer: string) => {
        if (answeringPost) {
            onAnswer(answeringPost.id, answer);
            setAnsweringPost(null);
        }
    };

    const handleDeleteClick = (postId: string) => {
        if (window.confirm('이 질문을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            onDelete(postId);
        }
    };
    
    return (
        <div>
            <ul className="data-list">
                {posts.map(post => (
                    <li key={post.id} className="data-list-item">
                        <div className="stock-info">
                            <span className={post.isSecret ? 'board-item-title-secret' : ''}>
                                {post.isSecret && '🔒'}
                                {post.question}
                            </span>
                            <small>작성자: {post.author} / {new Date(post.createdAt).toLocaleString()}</small>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className={`qna-status ${post.answer ? 'qna-status-answered' : 'qna-status-pending'}`}>
                                {post.answer ? '답변 완료' : '답변 대기'}
                            </span>
                             <button 
                                onClick={() => handleDeleteClick(post.id)} 
                                className="button button-danger" 
                                style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}}
                            >
                                삭제
                            </button>
                            <button 
                                onClick={() => setAnsweringPost(post)} 
                                className="button button-secondary" 
                                style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}}
                            >
                                {post.answer ? '답변 수정' : '답변하기'}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            {answeringPost && (
                <QnAAnswerModal
                    post={answeringPost}
                    onClose={() => setAnsweringPost(null)}
                    onSave={handleSaveAnswer}
                />
            )}
        </div>
    );
};

export default QnAManager;