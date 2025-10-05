import React, { useState, useRef, useEffect } from 'react';
import { View, Notice, ToastMessage, PopupNotice } from '../../types';
import { termsOfService, privacyPolicy } from '../../data';
import PolicyModal from '../shared/PolicyModal';
import StudentLoginModal from './StudentLoginModal';
import TeacherLoginModal from './TeacherLoginModal';
import TeacherRegisterModal from './TeacherRegisterModal';
import AdminLoginModal from '../admin/AdminLoginModal';
import PasswordResetModal from './PasswordResetModal';
import LandingHeader from './LandingHeader';
import PopupNoticeModal from './PopupNoticeModal';

// Use direct paths for images instead of importing them
const photos = [
    'assets/gallery-1.png',
    'assets/gallery-2.png',
    'assets/gallery-3.png',
    'assets/gallery-4.png',
    'assets/gallery-5.png'
];

interface LandingPageProps {
    notices: Notice[];
    popupNotices: PopupNotice[];
    onNavigate: (view: View) => void;
    onStudentJoin: (code: string, name: string) => void;
    // FIX: Update onTeacherLogin to accept an email string to match the handler function.
    onTeacherLogin: (email: string) => void;
    onTeacherRegister: (email: string, password: string) => void;
    onAdminLogin: (password: string) => void;
    addToast: (message: string, type?: ToastMessage['type']) => void;
}
const LandingPage: React.FC<LandingPageProps> = ({ notices, popupNotices, onNavigate, onStudentJoin, onTeacherLogin, onTeacherRegister, onAdminLogin, addToast }) => {
    const [policyModal, setPolicyModal] = useState<{ title: string; content: string } | null>(null);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [activeModal, setActiveModal] = useState<'student' | 'teacherLogin' | 'teacherRegister' | 'admin' | 'passwordReset' | null>(null);
    const [activePopupNotices, setActivePopupNotices] = useState<PopupNotice[]>([]);
    const latestNotices = notices.slice(0, 3);
    const [currentPhoto, setCurrentPhoto] = useState(0);

    const totalPhotos = photos.length;

    useEffect(() => {
        // --- KST Time Logic ---
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
        const KST_OFFSET = 9 * 60 * 60 * 1000;
        const kstNow = new Date(utc + KST_OFFSET);
        
        const todayKSTStr = kstNow.toISOString().split('T')[0];

        const activeNotices = popupNotices.filter(notice => {
            const startDate = new Date(`${notice.startDate}T00:00:00+09:00`);
            const endDate = new Date(`${notice.endDate}T23:59:59+09:00`);

            const isWithinDateRange = kstNow >= startDate && kstNow <= endDate;
            if (!isWithinDateRange) return false;

            const dismissedDate = localStorage.getItem(`classstock_popup_dismissed_${notice.id}`);
            const isDismissedToday = dismissedDate === todayKSTStr;

            return !isDismissedToday;
        });
        
        if (activeNotices.length > 0) {
            setActivePopupNotices(activeNotices);
        }
    }, [popupNotices]);

    const handleNext = () => {
        setCurrentPhoto((prev) => (prev + 1) % totalPhotos);
    };

    const handlePrev = () => {
        setCurrentPhoto((prev) => (prev - 1 + totalPhotos) % totalPhotos);
    };

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
        description: '활동 기간, 시드머니, 거래 수수료를 자유롭게 설정하여 맞춤형 금융 교육을 설계합니다.',
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
            <LandingHeader 
                onGoHome={() => onNavigate('landing')}
                onNavigate={onNavigate}
                addToast={addToast}
            />
            <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
                <header className="header">
                    <h1>
                        <span className="header-line-1">선생님과 함께하는</span>
                        <span className="header-line-2">쉽고 재밌는 경제 교실</span>
                        <span className="header-line-3">클래스탁!</span>
                    </h1>
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
                        <button className="button button-student" onClick={() => setActiveModal('student')} aria-label="학생용으로 참여하기">
                            참여하기
                        </button>
                    </div>
                </div>

                <div className="photo-carousel-container">
                    <h2 className="info-title-landing" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>한눈에 보는 ClassStock</h2>
                    <p style={{ color: 'var(--subtle-text-color)', marginBottom: '2.5rem' }}>복잡한 금융 교육, ClassStock의 간편한 기능으로 쉽게 시작하세요.</p>
                    
                    <div className="photo-carousel">
                        {photos.map((src, index) => {
                            let className = 'photo-card';
                            if (index === currentPhoto) {
                                className += ' active';
                            } else if (index === (currentPhoto - 1 + totalPhotos) % totalPhotos) {
                                className += ' prev';
                            } else if (index === (currentPhoto + 1) % totalPhotos) {
                                className += ' next';
                            } else {
                                className += ' hidden';
                            }

                            return (
                                <div key={src} className={className}>
                                    <img src={src} alt={`앱 화면 예시 ${index + 1}`} />
                                </div>
                            );
                        })}
                    </div>
                    
                    <button onClick={handlePrev} className="carousel-nav-button prev-btn" aria-label="이전 사진">
                        &#8249;
                    </button>
                    <button onClick={handleNext} className="carousel-nav-button next-btn" aria-label="다음 사진">
                        &#8250;
                    </button>
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
                                <p><strong>학급 개설</strong><br/>새 학급을 만들어 활동 기간과 시드머니를 설정합니다.</p>
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
                    <div className="footer-links">
                        <button onClick={() => openPolicy('terms')} className="footer-link">이용약관</button>
                        <button onClick={() => openPolicy('privacy')} className="footer-link">개인정보처리방침</button>
                    </div>
                    <div className="copyright-info">
                        <p>© 2025 ClassStock. All Rights Reserved.</p>
                        <p>Created by 유영재</p>
                    </div>
                    <button onClick={() => setActiveModal('admin')} className="footer-link" style={{position: 'absolute', right: 0, top: '1rem', opacity: 0.8}}>Admin</button>
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
                {activePopupNotices.length > 0 && 
                    <PopupNoticeModal 
                        notice={activePopupNotices[0]} 
                        onClose={() => setActivePopupNotices(prev => prev.slice(1))} 
                    />
                }
            </div>
        </>
    );
};

export default LandingPage;