import React, { useState } from 'react';
import { QnAPost, View } from '../../types';
import LandingHeader from '../landing/LandingHeader';

interface QnABoardProps {
    posts: QnAPost[];
    onAskQuestion: (data: { title: string; question: string; isSecret: boolean; }) => void;
    onBack: () => void;
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    onNavigate: (view: View) => void;
    context?: 'landing' | 'teacher';
    currentUserEmail?: string | null;
}

const AskQuestionModal: React.FC<{
    onClose: () => void;
    onConfirm: (data: { title: string, question: string, isSecret: boolean }) => void;
}> = ({ onClose, onConfirm }) => {
    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [isSecret, setIsSecret] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim() && title.trim()) {
            onConfirm({
                title: title.trim(),
                question: question.trim(),
                isSecret,
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
                        <label htmlFor="question-title">제목</label>
                        <input
                            id="question-title"
                            type="text"
                            className="input-field"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="질문 제목을 입력하세요."
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
                    <div className="action-buttons">
                        <button type="button" className="button button-secondary" onClick={onClose}>취소</button>
                        <button type="submit" className="button">등록하기</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const QnABoard: React.FC<QnABoardProps> = ({ posts, onAskQuestion, onBack, addToast, onNavigate, context = 'landing', currentUserEmail }) => {
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const togglePost = (post: QnAPost) => {
        if (expandedPostId === post.id) {
            setExpandedPostId(null);
        } else {
            const canView = !post.isSecret || (post.authorEmail === currentUserEmail);
            if (canView) {
                setExpandedPostId(post.id);
            } else {
                addToast('비밀글은 작성자만 조회할 수 있습니다.', 'info');
            }
        }
    };
    
    const maskAuthor = (author: string) => {
        if (!author) return '';
        if (author.length <= 2) {
            return author;
        }
        return author.substring(0, 2) + '*'.repeat(author.length - 2);
    };

    const handleConfirmQuestion = (data: { title: string; question: string; isSecret: boolean; }) => {
        onAskQuestion(data);
        setIsModalOpen(false);
    };

    return (
        <>
            <LandingHeader context={context} onGoHome={onBack} onNavigate={onNavigate} addToast={addToast} />
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
                                WebkitTextFillColor: 'initial',
                                alignItems: 'flex-start'
                            }}>
                                Q&amp;A 게시판
                            </h1>
                            <p style={{ margin: '0.25rem 0 0 0' }}>
                                {context === 'teacher' ? '서비스 이용 중 궁금한 점을 질문하세요.' : '자주 묻는 질문과 답변을 확인하세요.'}
                            </p>
                        </div>
                        {context === 'teacher' && (
                            <button className="button" style={{width: 'auto', padding: '0.5rem 1rem'}} onClick={() => setIsModalOpen(true)}>질문하기</button>
                        )}
                    </div>
                </header>

                {posts.length > 0 ? (
                    <>
                        <div className="qna-list-header">
                            <div className="qna-col-title">제목</div>
                            <div className="qna-col-author">작성자</div>
                            <div className="qna-col-date">작성일</div>
                            <div className="qna-col-status">답변 여부</div>
                        </div>
                        <ul className="board-list">
                            {posts.map(post => {
                                const isMyPost = post.authorEmail === currentUserEmail;
                                return (
                                    <li key={post.id} className="board-item">
                                        <div 
                                            className={`qna-list-row ${isMyPost ? 'my-post-highlight' : ''}`} 
                                            onClick={() => togglePost(post)}
                                        >
                                            <div className="qna-col-title post-title">
                                                {post.isSecret && '🔒 '}
                                                {post.title}
                                            </div>
                                            <div className="qna-col-author">{maskAuthor(post.author)}</div>
                                            <div className="qna-col-date">{new Date(post.createdAt).toLocaleDateString()}</div>
                                            <div className="qna-col-status">
                                                <span className={`qna-status ${post.answer ? 'qna-status-answered' : 'qna-status-pending'}`}>
                                                    {post.answer ? '답변 완료' : '답변 대기'}
                                                </span>
                                            </div>
                                        </div>
                                        {expandedPostId === post.id && (
                                            <div className="board-item-content">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <p style={{ flexGrow: 1, margin: 0 }}><b>Q.</b> {post.question}</p>
                                                </div>
                                                <small style={{color: '#666', display: 'block', marginTop: '0.5rem'}}>작성자: {maskAuthor(post.author)} / 작성일: {new Date(post.createdAt).toLocaleDateString()}</small>
                                                {post.answer && (
                                                    <div className="qna-answer">
                                                        <p className="qna-answer-header">A. 관리자 답변</p>
                                                        <p>{post.answer}</p>
                                                        {post.answeredAt && <small style={{color: '#666'}}>답변일: {new Date(post.answeredAt).toLocaleDateString()}</small>}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </>
                ) : (
                    <div className="info-card" style={{ textAlign: 'center' }}>
                        <p>등록된 질문이 없습니다. 궁금한 점을 질문해보세요.</p>
                    </div>
                )}
                
                <div className="action-buttons" style={{ marginTop: '2rem' }}>
                    <button type="button" className="button button-secondary" style={{ width: '100%' }} onClick={onBack}>
                        {context === 'teacher' ? '대시보드로 돌아가기' : '메인으로 돌아가기'}
                    </button>
                </div>
                {isModalOpen && <AskQuestionModal onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmQuestion} />}
            </div>
        </>
    );
};

export default QnABoard;
