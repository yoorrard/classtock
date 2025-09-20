import React, { useMemo } from 'react';
import { StudentInfo, Stock } from '../../types';

interface StudentPortfolioModalProps {
    student: StudentInfo & { totalAssets: number };
    stocks: Stock[];
    onClose: () => void;
}
const StudentPortfolioModal: React.FC<StudentPortfolioModalProps> = ({ student, stocks, onClose }) => {
    const fullPortfolio = useMemo(() => student.portfolio.map(item => {
        const stock = stocks.find(s => s.code === item.stockCode);
        if (!stock) return null;
        const currentValue = stock.price * item.quantity;
        const profit = (stock.price - item.averagePrice) * item.quantity;
        const profitRate = item.averagePrice > 0 ? (profit / (item.averagePrice * item.quantity)) * 100 : 0;
        return { ...item, stock, currentValue, profit, profitRate };
    }).filter(Boolean), [student.portfolio, stocks]);
    
    const stockAssets = fullPortfolio.reduce((acc, item) => acc + (item?.currentValue ?? 0), 0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{student.nickname}님의 포트폴리오</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <div className="portfolio-summary">
                    <div className="summary-item"><span>총 자산</span><strong>{student.totalAssets.toLocaleString()}원</strong></div>
                    <div className="summary-item"><span>보유 현금</span><span>{student.cash.toLocaleString()}원</span></div>
                    <div className="summary-item"><span>주식 평가</span><span>{stockAssets.toLocaleString()}원</span></div>
                </div>
                <h4>보유 주식</h4>
                <div className="data-list" style={{ maxHeight: '250px' }}>
                    {fullPortfolio.length > 0 ? fullPortfolio.map(p => p && (
                        <div key={p.stockCode} className="portfolio-item-card">
                             <div className="portfolio-item-info">
                                <div className="item-name">{p.stock.name}<small>({p.stock.code})</small></div>
                                <div className="portfolio-item-details">
                                    <div className="detail-group"><span>평가액</span><span className="detail-value">{p.currentValue.toLocaleString()}원</span></div>
                                    <div className="detail-group"><span>보유/매입가</span><span className="detail-value">{p.quantity}주 / {p.averagePrice.toLocaleString()}원</span></div>
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
            </div>
        </div>
    );
};

export default StudentPortfolioModal;
