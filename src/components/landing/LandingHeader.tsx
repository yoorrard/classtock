import React, { useState, useRef, useEffect } from 'react';
import { View, ToastMessage } from '../../types';

interface LandingHeaderProps {
    onGoHome: () => void;
    onNavigate: (view: View) => void;
    addToast: (message: string, type?: ToastMessage['type']) => void;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ onGoHome, onNavigate, addToast }) => {
    const [communityMenuOpen, setCommunityMenuOpen] = useState(false);
    const [appsMenuOpen, setAppsMenuOpen] = useState(false);
    
    const communityRef = useRef<HTMLDivElement>(null);
    const appsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (communityRef.current && !communityRef.current.contains(event.target as Node)) {
                setCommunityMenuOpen(false);
            }
            if (appsRef.current && !appsRef.current.contains(event.target as Node)) {
                setAppsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMenuToggle = (menu: 'community' | 'apps', e: React.MouseEvent) => {
        e.stopPropagation();
        if (menu === 'community') {
            setAppsMenuOpen(false);
            setCommunityMenuOpen(prev => !prev);
        } else {
            setCommunityMenuOpen(false);
            setAppsMenuOpen(prev => !prev);
        }
    };

    const handleToastClick = (message: string) => {
        addToast(message, 'info');
    };
    
    return (
        <header className="main-header">
            <button 
                className="logo-container" 
                onClick={onGoHome} 
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
                aria-label="홈으로 이동"
            >
                <img 
                    src="assets/logo.png" 
                    alt="ClassStock Logo" 
                    width="40" 
                    height="40" 
                    style={{flexShrink: 0}}
                />
                <span className="logo-text">ClassStock</span>
            </button>
            <nav className="main-nav">
                <div className="nav-item-container">
                    <button className="nav-button" onClick={onGoHome}>홈</button>
                </div>
                <div className="nav-item-container">
                    <button className="nav-button" onClick={() => handleToastClick('준비 중입니다.')}>사용법</button>
                </div>
                
                <div className="nav-item-container" ref={communityRef}>
                    <button className="nav-button" onClick={(e) => handleMenuToggle('community', e)}>
                        커뮤니티
                    </button>
                    {communityMenuOpen && (
                        <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={() => { onNavigate('notice_board'); setCommunityMenuOpen(false); }}>공지사항</button>
                            <button className="dropdown-item" onClick={() => { onNavigate('qna_board'); setCommunityMenuOpen(false); }}>Q&A 게시판</button>
                            <button className="dropdown-item" onClick={() => { handleToastClick('준비 중입니다.'); setCommunityMenuOpen(false); }}>카카오 오픈채팅</button>
                        </div>
                    )}
                </div>

                <div className="nav-item-container" ref={appsRef}>
                    <button className="nav-button" onClick={(e) => handleMenuToggle('apps', e)}>
                        관련 앱
                    </button>
                    {appsMenuOpen && (
                        <div className="dropdown-menu">
                            <a 
                                href="https://kidstock.vercel.app/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="dropdown-item"
                            >
                                어린이 주식왕(사전학습)
                            </a>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default LandingHeader;