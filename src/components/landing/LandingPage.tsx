import React, { useState } from 'react';
import { View, Notice, ToastMessage } from '../../types';
import { termsOfService, privacyPolicy } from '../../data';
import PolicyModal from '../shared/PolicyModal';
import StudentLoginModal from './StudentLoginModal';
import TeacherLoginModal from './TeacherLoginModal';
import TeacherRegisterModal from './TeacherRegisterModal';
import AdminLoginModal from '../admin/AdminLoginModal';
import PasswordResetModal from './PasswordResetModal';

const LandingHeader: React.FC = () => {
    return (
        <header className="main-header">
            <div className="logo-container">
                <img 
                    src="data:image/png;base64,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" 
                    alt="ClassStock Logo" 
                    width="40" 
                    height="40" 
                    style={{flexShrink: 0}}
                />
                <span className="logo-text">ClassStock</span>
            </div>
            <nav className="main-nav">
                <button className="nav-button">홈</button>
                <button className="nav-button">사용법</button>
                <button className="nav-button">커뮤니티</button>
                <button className="nav-button">관련 앱</button>
            </nav>
        </header>
    );
};

interface LandingPageProps {
    notices: Notice[];
    onNavigate: (view: View) => void;
    onStudentJoin: (code: string, name: string) => void;
    onTeacherLogin: () => void;
    onTeacherRegister: (email: string, password: string) => void;
    onAdminLogin: (password: string) => void;
    addToast: (message: string, type?: ToastMessage['type']) => void;
}
const LandingPage: React.FC<LandingPageProps> = ({ notices, onNavigate, onStudentJoin, onTeacherLogin, onTeacherRegister, onAdminLogin, addToast }) => {
    const [policyModal, setPolicyModal] = useState<{ title: string; content: string } | null>(null);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [activeModal, setActiveModal] = useState<'student' | 'teacherLogin' | 'teacherRegister' | 'admin' | 'passwordReset' | null>(null);
    const latestNotices = notices.slice(0, 3);

    const openPolicy = (type: 'terms' | 'privacy') => {
        if (type === 'terms') {
            setPolicyModal({ title: '이용약관', content: termsOfService });
        } else {
            setPolicyModal({ title: '개인정보처리방침', content: privacyPolicy });
        }
    };
    
    const handleFooterLinkClick = (e: React.MouseEvent, type: 'notice' | 'qna') => {
        e.preventDefault();
        onNavigate(type === 'notice' ? 'notice_board' : 'qna_board');
    }
    
    const handleTeacherRegisterSuccess = (email: string, password: string) => {
        onTeacherRegister(email, password);
        setActiveModal(null);
    };
    
    const handlePasswordResetRequest = (email: string) => {
        // In a real app, this would call an API (e.g., Supabase Auth)
        // For this demo, we just simulate success.
        addToast(`'${email}'(으)로 비밀번호 재설정 이메일을 발송했습니다.`, 'success');
        setActiveModal(null);
    };

    const featuresData = [
      {
        icon: '📊',
        title: '실감 나는 모의투자',
        description: '실제 주식 데이터를 기반으로, 현실적인 투자 환경을 경험하며 경제 원리를 배웁니다.',
      },
      {
        icon: '👩‍🏫',
        title: '편리한 학급 관리',
        description: '교사용 대시보드를 통해 학생들의 포트폴리오와 랭킹을 한눈에 파악하고 지도합니다.',
      },
      {
        icon: '🎁',
        title: '동기부여 보상 시스템',
        description: '과제 수행, 적극적 참여 등 교육 활동에 대한 보상으로 추가 시드머니를 지급하여 학습 동기를 높일 수 있습니다.',
      },
      {
        icon: '⚙️',
        title: '자유로운 맞춤 설정',
        description: '활동 기간, 시드머니, 투자 종목을 자유롭게 설정하여 맞춤형 금융 교육을 설계합니다.',
      },
    ];
    
    const faqData = [
        { q: "학생들은 실제 돈으로 투자를 하나요?", a: "아니요, 'ClassStock'은 교육용 모의투자 서비스입니다. 모든 거래는 실제 금전적 가치가 없는 가상의 시드머니로 이루어집니다." },
        { q: "참여 코드를 잃어버렸어요.", a: "참여 코드는 학급을 개설하신 선생님께 다시 문의해주세요. 선생님은 교사 대시보드에서 언제든지 코드를 확인할 수 있습니다." },
        { q: "시드머니를 모두 사용하면 어떻게 되나요?", a: "기본적으로 초기 시드머니로만 활동하지만, 선생님께서 과제 보상이나 특별 활동 보너스로 추가 시드머니를 지급해주실 수 있습니다. 선생님과 상의해보세요." },
        { q: "데이터는 안전하게 보관되나요?", a: "네, 'ClassStock'은 클라우드 데이터베이스(Supabase)를 사용하여 모든 사용자 데이터를 안전하게 관리합니다. 회원님의 정보와 투자 기록은 암호화되어 서버에 저장되며, 정기적으로 백업됩니다." }
    ];

    return (
        <>
            <LandingHeader />
            <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
                <header className="header">
                    <h1>ClassStock</h1>
                    <p>선생님과 함께하는 즐거운 금융 교실</p>
                </header>
                <div className="role-selection">
                    <div className="role-card" role="region" aria-labelledby="teacher_title">
                        <h2 id="teacher_title">교사용</h2>
                        <p>학급을 만들고 학생들의 투자를 관리하세요.</p>
                        <div className="role-card-button-group">
                            <button className="button button-secondary" onClick={() => setActiveModal('teacherRegister')} aria-label="교사용 회원가입">
                                회원가입
                            </button>
                            <button className="button" onClick={() => setActiveModal('teacherLogin')} aria-label="교사용 로그인">
                                로그인
                            </button>
                        </div>
                    </div>
                    <div className="role-card" role="region" aria-labelledby="student_title">
                        <h2 id="student_title">학생용</h2>
                        <p>참여 코드를 입력하고 모의투자를 시작하세요.</p>
                        <button className="button" onClick={() => setActiveModal('student')} aria-label="학생용으로 참여하기">
                            참여하기
                        </button>
                    </div>
                </div>

                <div className="info-sections-landing">
                     <div className="info-card-landing">
                        <h2 className="info-title-landing">주요 기능</h2>
                        <div className="features-grid">
                            {featuresData.map((feature, index) => (
                                <div className="feature-item" key={index}>
                                    <div className="feature-icon">{feature.icon}</div>
                                    <div className="feature-text">
                                        <h3>{feature.title}</h3>
                                        <p>{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="info-card-landing">
                        <h2 className="info-title-landing">활용 가이드</h2>
                        <div className="guide-steps">
                            <div className="guide-step">
                                <span className="step-number">1</span>
                                <p><strong>학급 개설</strong><br/>새 학급을 만들어 활동 기간과 시드머니을 설정합니다.</p>
                            </div>
                            <div className="guide-step">
                                <span className="step-number">2</span>
                                <p><strong>코드 공유</strong><br/>생성된 '참여 코드'를 학생들에게 공유하여 참여시킵니다.</p>
                            </div>
                            <div className="guide-step">
                                <span className="step-number">3</span>
                                <p><strong>학습 시작</strong><br/>랭킹과 포트폴리오를 보며 즐거운 투자 학습을 진행합니다.</p>
                            </div>
                             <div className="guide-step">
                                <span className="step-number">4</span>
                                <p><strong>학습 독려</strong><br/>과제 보상 등 추가 시드머니를 지급하며 학생 참여를 독려합니다.</p>
                            </div>
                        </div>
                    </div>
                    <div className="info-card-landing">
                        <h2 className="info-title-landing">
                            <span>새로운 소식</span>
                            <button className="button-more" onClick={() => onNavigate('notice_board')}>더보기</button>
                        </h2>
                        <div className="faq-list" style={{border: 'none'}}>
                           {latestNotices.map(notice => (
                               <div key={notice.id} className="faq-item" style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', alignItems: 'center'}}>
                                   <span style={{
                                       textOverflow: 'ellipsis',
                                       whiteSpace: 'nowrap',
                                       overflow: 'hidden',
                                       cursor: 'pointer'
                                   }} onClick={() => onNavigate('notice_board')}>{notice.title}</span>
                                   <span style={{fontSize: '0.85rem', color: '#666', flexShrink: 0, marginLeft: '1rem'}}>{new Date(notice.createdAt).toLocaleDateString()}</span>
                               </div>
                           ))}
                        </div>
                    </div>
                    <div className="info-card-landing">
                        <h2 className="info-title-landing">
                            <span>자주 묻는 질문</span>
                            <button className="button-more" onClick={() => onNavigate('qna_board')}>Q&A</button>
                        </h2>
                        <div className="faq-list">
                        {faqData.map((item, index) => (
                            <div className="faq-item" key={index}>
                                <button className="faq-question" onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                                    <span>{item.q}</span>
                                    <span className="faq-icon">{activeFaq === index ? '−' : '+'}</span>
                                </button>
                                <div className={`faq-answer ${activeFaq === index ? 'open' : ''}`}>
                                   <p>{item.a}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>

                 <footer className="footer">
                    <button onClick={() => openPolicy('terms')} className="footer-link">이용약관</button>
                    <button onClick={() => openPolicy('privacy')} className="footer-link">개인정보처리방침</button>
                    <button onClick={(e) => handleFooterLinkClick(e, 'notice')} className="footer-link">공지사항</button>
                    <button onClick={(e) => handleFooterLinkClick(e, 'qna')} className="footer-link">Q&A 게시판</button>
                    <button onClick={() => setActiveModal('admin')} className="footer-link" style={{position: 'absolute', right: 0, opacity: 0.8}}>Admin</button>
                </footer>
                
                {policyModal && <PolicyModal title={policyModal.title} content={policyModal.content} onClose={() => setPolicyModal(null)} />}
                {activeModal === 'student' && <StudentLoginModal onClose={() => setActiveModal(null)} onJoin={onStudentJoin} />}
                {activeModal === 'teacherLogin' && <TeacherLoginModal 
                    onClose={() => setActiveModal(null)} 
                    onLoginSuccess={onTeacherLogin}
                    onSwitchToRegister={() => setActiveModal('teacherRegister')}
                    onForgotPassword={() => setActiveModal('passwordReset')}
                />}
                {activeModal === 'teacherRegister' && <TeacherRegisterModal
                    onClose={() => setActiveModal(null)}
                    onRegisterSuccess={handleTeacherRegisterSuccess}
                    addToast={addToast}
                    onSwitchToLogin={() => setActiveModal('teacherLogin')}
                />}
                 {activeModal === 'passwordReset' && <PasswordResetModal
                    onClose={() => setActiveModal(null)}
                    onRequestReset={handlePasswordResetRequest}
                />}
                {activeModal === 'admin' && <AdminLoginModal onClose={() => setActiveModal(null)} onLogin={(password) => { onAdminLogin(password); setActiveModal(null); }} />}
            </div>
        </>
    );
};

export default LandingPage;
