import React, { useState } from 'react';
import { QnAPost, View } from '../../types';
import LandingHeader from '../landing/LandingHeader';

interface QnABoardProps {
    posts: QnAPost[];
    onAskQuestion: (data: Omit<QnAPost, 'id' | 'createdAt'>) => void;
    onBack: () => void;
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    onNavigate: (view: View) => void;
}

const PasswordPromptModal: React.FC<{
    onClose: () => void;
    onConfirm: (password: string) => void;
}> = ({ onClose, onConfirm }) => {
    const [password, setPassword] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(password);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>비밀번호 확인</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="secret-password">게시글 작성 시 설정한 4자리 비밀번호를 입력하세요.</label>
                        <input
                            id="secret-password"
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="action-buttons">
                        <button type="button" className="button button-secondary" onClick={onClose}>취소</button>
                        <button type="submit" className="button">확인</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AskQuestionModal: React.FC<{
    onClose: () => void;
    onConfirm: (data: Omit<QnAPost, 'id' | 'createdAt' | 'answeredAt' | 'answer'>) => void;
}> = ({ onClose, onConfirm }) => {
    const [question, setQuestion] = useState('');
    const [author, setAuthor] = useState('');
    const [isSecret, setIsSecret] = useState(false);
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim() && author.trim()) {
            onConfirm({
                question: question.trim(),
                author: author.trim(),
                isSecret,
                password: isSecret ? password : undefined,
            });
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>질문하기</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="question-author">작성자</label>
                        <input
                            id="question-author"
                            type="text"
                            className="input-field"
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                            placeholder="작성자명을 입력하세요."
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="question-content">궁금한 점을 남겨주세요.</label>
                        <textarea
                            id="question-content"
                            className="textarea-field"
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="서비스 이용 중 궁금한 점이나 불편한 점을 자세히 적어주세요."
                            required
                        />
                    </div>
                    <div className="agreement-group" style={{background: '#f7f9fc', padding: '0.75rem', borderRadius: '8px'}}>
                        <input type="checkbox" id="secret-post" checked={isSecret} onChange={e => setIsSecret(e.target.checked)} />
                        <label htmlFor="secret-post">비밀글로 설정하기</label>
                    </div>
                    {isSecret && (
                        <div className="input-group">
                            <label htmlFor="question-password">비밀번호 (4자리 숫자)</label>
                            <input
                                id="question-password"
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                className="input-field"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="비밀번호 4자리를 입력하세요."
                                required
                            />
                        </div>
                    )}
                    <div className="action-buttons">
                        <button type="button" className="button button-secondary" onClick={onClose}>취소</button>
                        <button type="submit" className="button">등록하기</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const QnABoard: React.FC<QnABoardProps> = ({ posts, onAskQuestion, onBack, addToast, onNavigate }) => {
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [postToVerify, setPostToVerify] = useState<QnAPost | null>(null);
    const [unlockedPosts, setUnlockedPosts] = useState<Set<string>>(new Set());

    const handlePasswordConfirm = (passwordInput: string) => {
        if (postToVerify && postToVerify.password === passwordInput) {
            setUnlockedPosts(prev => new Set(prev).add(postToVerify.id));
            setExpandedPostId(postToVerify.id);
            setPostToVerify(null);
        } else {
            addToast('비밀번호가 일치하지 않습니다.', 'error');
        }
    };

    const togglePost = (post: QnAPost) => {
        if (expandedPostId === post.id) {
            setExpandedPostId(null);
        } else if (post.isSecret && !unlockedPosts.has(post.id)) {
            setPostToVerify(post);
        } else {
            setExpandedPostId(post.id);
        }
    };

    const handleConfirmQuestion = (data: Omit<QnAPost, 'id' | 'createdAt'>) => {
        onAskQuestion(data);
        setIsModalOpen(false);
    };

    return (
        <>
            <LandingHeader onGoHome={onBack} onNavigate={onNavigate} addToast={addToast} />
            <div className="container">
                <header className="header" style={{ marginBottom: '2rem', textAlign: 'left' }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
                        <div>
                            <h1 style={{ 
                                fontSize: '1.8rem', 
                                margin: 0, 
                                color: '#0B6623',
                                background: 'none',
                                WebkitBackgroundClip: 'initial',
                                WebkitTextFillColor: 'initial' 
                            }}>
                                Q&amp;A 게시판
                            </h1>
                            <p style={{ margin: '0.25rem 0 0 0' }}>무엇이든 물어보세요.</p>
                        </div>
                        <button className="button" style={{width: 'auto', padding: '0.5rem 1rem'}} onClick={() => setIsModalOpen(true)}>질문하기</button>
                    </div>
                </header>

                {posts.length > 0 ? (
                    <ul className="board-list">
                        {posts.map(post => {
                            const isUnlocked = post.isSecret && unlockedPosts.has(post.id);
                            return (
                                <li key={post.id} className="board-item">
                                    <div className="board-item-header" onClick={() => togglePost(post)}>
                                        {post.isSecret ? (
                                            <h2 className="board-item-title board-item-title-secret">
                                                🔒 비밀글입니다
                                            </h2>
                                        ) : (
                                            <h2 className="board-item-title">{post.question}</h2>
                                        )}
                                        <span className={`qna-status ${post.answer ? 'qna-status-answered' : 'qna-status-pending'}`}>
                                            {post.answer ? '답변 완료' : '답변 대기'}
                                        </span>
                                    </div>
                                    {expandedPostId === post.id && (
                                        <div className="board-item-content">
                                            <p><b>Q.</b> {post.question}</p>
                                            <small style={{color: '#666'}}>작성자: {isUnlocked || !post.isSecret ? post.author : '비공개'} / 작성일: {new Date(post.createdAt).toLocaleDateString()}</small>
                                            {post.answer && (
                                                <div className="qna-answer">
                                                    <p className="qna-answer-header">A. 관리자 답변</p>
                                                    <p>{post.answer}</p>
                                                    <small style={{color: '#666'}}>답변일: {new Date(post.answeredAt!).toLocaleDateString()}</small>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <div className="info-card" style={{ textAlign: 'center' }}>
                        <p>등록된 질문이 없습니다. 궁금한 점을 질문해보세요.</p>
                    </div>
                )}
                
                <div className="action-buttons" style={{ marginTop: '2rem' }}>
                    <button type="button" className="button button-secondary" style={{ width: '100%' }} onClick={onBack}>
                        메인으로 돌아가기
                    </button>
                </div>
                {isModalOpen && <AskQuestionModal onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmQuestion} />}
                {postToVerify && <PasswordPromptModal onClose={() => setPostToVerify(null)} onConfirm={handlePasswordConfirm} />}
            </div>
        </>
    );
};

export default QnABoard;