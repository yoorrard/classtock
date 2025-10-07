import React, { useMemo, useState } from 'react';
import { StudentInfo, Stock, Transaction } from '../../types';

type ExtendedStudentInfo = StudentInfo & {
    totalAssets: number;
    totalProfit: number;
    totalProfitRate: number;
    investmentProfit: number;
    investmentProfitRate: number;
};

interface StudentPortfolioModalProps {
    student: ExtendedStudentInfo;
    stocks: Stock[];
    onClose: () => void;
    transactions: Transaction[];
}
const StudentPortfolioModal: React.FC<StudentPortfolioModalProps> = ({ student, stocks, onClose, transactions }) => {
    const [activeTab, setActiveTab] = useState('portfolio');
    
    const fullPortfolio = useMemo(() => student.portfolio.map(item => {
        const stock = stocks.find(s => s.code === item.stockCode);
        if (!stock) return null;
        const currentValue = stock.price * item.quantity;
        const costBasis = item.averagePrice * item.quantity;
        const profit = Math.trunc(currentValue - costBasis);
        const profitRate = costBasis > 0 ? (profit / costBasis) * 100 : 0;
        return { ...item, stock, currentValue, costBasis, profit, profitRate };
    }).filter(Boolean), [student.portfolio, stocks]);
    
    const stockAssets = fullPortfolio.reduce((acc, item) => acc + (item?.currentValue ?? 0), 0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-content-wide" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{student.nickname}님의 포트폴리오</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <div className="portfolio-summary">
                    <div className="summary-item"><span>총 자산</span><strong>{student.totalAssets.toLocaleString()}원</strong></div>
                    <div className="summary-item"><span>보유 현금</span><strong>{student.cash.toLocaleString()}원</strong></div>
                    <div className="summary-item"><span>주식 평가</span><strong>{stockAssets.toLocaleString()}원</strong></div>
                </div>

                <div className="tabs" style={{ marginBottom: '1.5rem' }}>
                    <button className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>
                        보유 주식 ({fullPortfolio.length})
                    </button>
                    <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                        거래 내역 ({transactions.length})
                    </button>
                </div>

                {activeTab === 'portfolio' && (
                    <>
                        <h4>보유 주식</h4>
                        <div className="data-list" style={{ maxHeight: '250px' }}>
                            {fullPortfolio.length > 0 ? fullPortfolio.map(p => p && (
                                <div key={p.stockCode} className="portfolio-item-card">
                                    <div className="portfolio-item-info">
                                        <div className="item-name">{p.stock.name}<small>({p.stock.code})</small></div>
                                        <div className="portfolio-item-details">
                                            <div className="detail-group"><span>평가금액</span><span className="detail-value">{p.currentValue.toLocaleString()}원</span></div>
                                            <div className="detail-group"><span>매입금액</span><span className="detail-value">{p.costBasis.toLocaleString()}원</span></div>
                                            <div className="detail-group"><span>보유 수량</span><span className="detail-value">{p.quantity}주</span></div>
                                        </div>
                                    </div>
                                    <div className={`portfolio-item-performance ${p.profit > 0 ? 'positive' : p.profit < 0 ? 'negative' : 'neutral'}`}>
                                        <div className="profit-summary">
                                          <div className="profit-amount">
                                            {p.profit > 0 ? '▲' : p.profit < 0 ? '▼' : ''} {Math.abs(p.profit).toLocaleString()}원
                                          </div>
                                          <div className="profit-rate">({p.profitRate.toFixed(2)}%)</div>
                                        </div>
                                    </div>
                                </div>
                            )) : <p style={{ textAlign: 'center', color: '#666' }}>보유 주식이 없습니다.</p>}
                        </div>
                    </>
                )}
                {activeTab === 'history' && (
                     <>
                        <h4>거래 내역</h4>
                        <ul className="data-list" style={{ maxHeight: '250px' }}>
                            {transactions.length > 0 ? transactions.map(t => (
                                <li key={t.id} className="data-list-item">
                                    {t.type === 'bonus' ? (
                                        <>
                                            <div className="stock-info">
                                                <span style={{color: 'var(--student-color)'}}>{t.stockName}</span>
                                                <small>{new Date(t.timestamp).toLocaleString()}</small>
                                                {t.reason && <small className="transaction-reason">사유: {t.reason}</small>}
                                            </div>
                                            <div style={{color: 'var(--student-color)', fontWeight: '700', textAlign: 'right'}}>+{t.price.toLocaleString()}원</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="stock-info"><span style={{color: t.type === 'buy' ? 'var(--positive-color)' : 'var(--negative-color)'}}>{t.type === 'buy' ? '매수' : '매도'}</span><small>{new Date(t.timestamp).toLocaleString()}</small></div>
                                            <div>{t.stockName} {t.quantity}주</div><div>{t.price.toLocaleString()}원</div>
                                        </>
                                    )}
                                </li>
                            )) : <p style={{ textAlign: 'center', color: '#666' }}>거래 내역이 없습니다.</p>}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentPortfolioModal;