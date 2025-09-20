import React, { useState, useEffect } from 'react';
import { QnAPost } from '../../types';

interface QnAAnswerModalProps {
    post: QnAPost;
    onClose: () => void;
    onSave: (answer: string) => void;
}

const QnAAnswerModal: React.FC<QnAAnswerModalProps> = ({ post, onClose, onSave }) => {
    const [answer, setAnswer] = useState('');

    useEffect(() => {
        if (post.answer) {
            setAnswer(post.answer);
        }
    }, [post]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(answer);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>답변하기</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                 <div className="info-card" style={{marginBottom: '1.5rem'}}>
                    <h4>질문 내용</h4>
                    <p>{post.question}</p>
                    <small style={{color: '#666'}}>작성자: {post.author} / 작성일: {new Date(post.createdAt).toLocaleString()}</small>
                 </div>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="answer-content">답변 내용</label>
                        <textarea
                            id="answer-content"
                            className="textarea-field"
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            required
                        />
                    </div>
                    <div className="action-buttons">
                        <button type="button" className="button button-secondary" onClick={onClose}>취소</button>
                        <button type="submit" className="button">답변 저장</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QnAAnswerModal;