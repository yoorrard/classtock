import React, { useState, useMemo } from 'react';
import { StudentInfo, ClassInfo, Stock, Transaction, TradeInfo, TradeType } from '../../types';
import RankingBoard from '../shared/RankingBoard';
import TradeModal from './TradeModal';
import StockInfoModal from './StockInfoModal';

interface StudentDashboardProps {
    student: StudentInfo & { totalAssets: number };
    classInfo: ClassInfo;
    stocks: Stock[];
    transactions: Transaction[];
// FIX: Update classRanking prop to include totalProfit and totalProfitRate to match data from App.tsx.
    classRanking: (StudentInfo & { totalAssets: number; totalProfit: number; totalProfitRate: number; })[];
    onTrade: (studentId: string, stockCode: string, quantity: number, type: TradeType) => void;
    onLogout: () => void;
    isTradingActive: boolean;
}

const PIE_CHART_COLORS = ['#B29146', '#5DADE2', '#48C9B0', '#F4D03F', '#AF7AC5', '#EC7063', '#5D6D7E'];

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, classInfo, stocks, transactions, classRanking, onTrade, onLogout, isTradingActive }) => {
    const [activeTab, setActiveTab] = useState('portfolio');
    const [tradeInfo, setTradeInfo] = useState<TradeInfo | null>(null);
    const [infoModalStock, setInfoModalStock] = useState<Stock | null>(null);
    // FIX: Add state for sorting the ranking board.
    const [rankingSortBy, setRankingSortBy] = useState<'totalAssets' | 'profitRate'>('totalAssets');
    const { totalAssets, cash, portfolio } = student;
    const stockAssets = totalAssets - cash;

    const fullPortfolio = useMemo(() => {
        return portfolio.map(item => {
            const stock = stocks.find(s => s.code === item.stockCode);
            if (!stock) return null;
            
            const currentValue = stock.price * item.quantity;
            const costBasis = item.averagePrice * item.quantity;
            const profit = currentValue - costBasis;
            const profitRate = costBasis > 0 ? (profit / costBasis) * 100 : 0;

            return { 
                ...item, 
                stock, 
                currentValue, 
                costBasis,
                profit, 
                profitRate 
            };
        }).filter((p): p is NonNullable<typeof p> => p !== null);
    }, [portfolio, stocks]);

    // FIX: Add memoized sorting for the ranking board data.
    const sortedStudentsForRanking = useMemo(() => {
        return [...classRanking].sort((a, b) => {
            if (rankingSortBy === 'profitRate') {
                return b.totalProfitRate - a.totalProfitRate;
            }
            return b.totalAssets - a.totalAssets; // default to totalAssets
        });
    }, [classRanking, rankingSortBy]);

    const handleConfirmTrade = (quantity: number) => {
        if (tradeInfo) {
            onTrade(student.id, tradeInfo.stock.code, quantity, tradeInfo.type);
            setTradeInfo(null);
        }
    };

    const getActivityStatus = (classInfo: ClassInfo): { text: string; color: string } => {
        const now = new Date();
        const startDate = new Date(`${classInfo.startDate}T00:00:00+09:00`);
        const endDate = new Date(`${classInfo.endDate}T23:59:59+09:00`);

        if (now < startDate) {
            return { text: '활동 전', color: 'var(--student-color)' };
        } else if (now > endDate) {
            return { text: '활동 종료', color: '#777' };
        } else {
            return { text: '활동 중', color: 'var(--teacher-color)' };
        }
    };
    
    const activityStatus = getActivityStatus(classInfo);

    const chartData = useMemo(() => {
        const data = fullPortfolio.map((p, index) => ({
            name: p.stock.name,
            value: p.currentValue,
            color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
        }));
        
        data.unshift({ name: '보유 현금', value: cash, color: '#B0B0B0' });
        
        return data.filter(d => d.value > 0);
    }, [fullPortfolio, cash]);

    const conicGradient = useMemo(() => {
        if (chartData.length === 0) return 'transparent';
        const totalValue = chartData.reduce((acc, item) => acc + item.value, 0);
        if (totalValue === 0) return '#aaa';

        let currentAngle = 0;
        const gradientParts = chartData.map(item => {
            const percentage = (item.value / totalValue) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + percentage;
            currentAngle = endAngle;
            return `${item.color} ${startAngle}deg ${endAngle}deg`;
        });
        
        return `conic-gradient(${gradientParts.join(', ')})`;
    }, [chartData]);

    return (
        <div className="container">
            <header className="dashboard-header">
                <div><h1 style={{ fontSize: '1.8rem', margin: 0 }}>{student.nickname}님</h1><p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>'{classInfo.name}'</p></div>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                     <span style={{ padding: '0.3rem 0.8rem', borderRadius: '8px', background: activityStatus.color, color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>
                        {activityStatus.text}
                     </span>
                     <button onClick={onLogout} className="button button-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>로그아웃</button>
                </div>
            </header>
            <div className="asset-summary"><h2>총 자산</h2><p>{totalAssets.toLocaleString()}원</p>
                 <div className="asset-details">
                    <span>보유 현금: {cash.toLocaleString()}원</span>
                    <span>주식 평가: {stockAssets.toLocaleString()}원</span>
                 </div>
            </div>
            <div className="tabs">
                <button className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>포트폴리오</button>
                <button className={`tab-button ${activeTab === 'market' ? 'active' : ''}`} onClick={() => setActiveTab('market')}>마켓</button>
                <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>거래 내역</button>
                <button className={`tab-button ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>랭킹</button>
            </div>
            <div className="tab-content" style={{minHeight: '200px'}}>
                {activeTab === 'portfolio' && (
                    <div className="info-section">
                        <div className="portfolio-overview">
                            <div className="pie-chart-container">
                                <div 
                                    className="pie-chart"
                                    style={{ background: conicGradient }}
                                    role="img"
                                    aria-label={`자산 구성: ${chartData.map(d => `${d.name} ${((d.value/totalAssets)*100).toFixed(1)}%`).join(', ')}`}
                                ></div>
                            </div>
                            <ul className="pie-chart-legend">
                                {chartData.map(item => (
                                    <li key={item.name} className="legend-item">
                                        <div className="legend-color-box" style={{ backgroundColor: item.color }}></div>
                                        <div className="legend-text">
                                            <strong>{item.name}</strong>
                                            <span>{item.value.toLocaleString()}원</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {fullPortfolio.length > 0 ? (
                            <div className="portfolio-grid">
                                {fullPortfolio.map(p => {
                                    if (!p) return null;
                                    const profitClass = p.profit > 0 ? 'positive' : p.profit < 0 ? 'negative' : 'neutral';
                                    return (
                                        <div key={p.stockCode} className="portfolio-item-card">
                                            {/* Left Side: Purchase Info */}
                                            <div className="portfolio-item-info">
                                                <div className="item-name">
                                                    {p.stock.name}
                                                    <small>({p.stock.code})</small>
                                                </div>
                                                <div className="portfolio-item-details">
                                                    <div className="detail-group">
                                                        <span>총 매입금</span>
                                                        <span className="detail-value">{p.costBasis.toLocaleString()}원</span>
                                                    </div>
                                                    <div className="detail-group">
                                                        <span>보유 수량</span>
                                                        <span className="detail-value">{p.quantity.toLocaleString()}주</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Right Side: Performance Info */}
                                            <div className={`portfolio-item-performance ${profitClass}`}>
                                                <div className="current-valuation">
                                                    {p.currentValue.toLocaleString()}원
                                                </div>
                                                <div className="profit-summary">
                                                    <div className="profit-amount">
                                                        {p.profit > 0 ? '▲' : p.profit < 0 ? '▼' : ''} {Math.abs(p.profit).toLocaleString()}원
                                                    </div>
                                                    <div className="profit-rate">
                                                        ({p.profitRate.toFixed(2)}%)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <div className="info-card" style={{textAlign: 'center'}}><p>현재 보유 주식이 없습니다.</p></div>}
                    </div>
                )}
                {activeTab === 'market' && <ul className="data-list">{stocks.map(stock => {
                    const ownedStock = portfolio.find(p => p.stockCode === stock.code);
                    const canSell = ownedStock && ownedStock.quantity > 0;
                    return (
                        <li key={stock.code} className="data-list-item" style={{cursor: 'pointer'}} onClick={() => setInfoModalStock(stock)}>
                            <div className="stock-info">
                                <span>{stock.name}</span>
                                <small>{stock.sector}</small>
                                {canSell && <small style={{ color: 'var(--negative-color)', fontWeight: 500 }}>보유: {ownedStock.quantity}주</small>}
                            </div>
                            <div className="price-info"><span>{stock.price.toLocaleString()}원</span></div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={(e) => { e.stopPropagation(); setTradeInfo({ type: 'sell', stock }); }} className="button button-sell" style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}} disabled={!isTradingActive || !canSell}>매도</button>
                                <button onClick={(e) => { e.stopPropagation(); setTradeInfo({ type: 'buy', stock }); }} className="button button-buy" style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}} disabled={!isTradingActive}>매수</button>
                            </div>
                        </li>
                    );
                })}</ul>}
                {activeTab === 'history' && <ul className="data-list">{transactions.length > 0 ? transactions.map(t => (
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
                )) : <div className="info-card" style={{textAlign: 'center'}}><p>거래 내역이 없습니다.</p></div>}</ul>}
                {activeTab === 'ranking' && (
                    <div className="info-section">
                        <div className="student-management-bar">
                             <span>정렬 기준:</span>
                             <div className="action-buttons-group">
                                 <button 
                                     onClick={() => setRankingSortBy('totalAssets')} 
                                     className={`button ${rankingSortBy === 'totalAssets' ? '' : 'button-secondary'}`}
                                 >
                                     총 자산
                                 </button>
                                 <button 
                                     onClick={() => setRankingSortBy('profitRate')} 
                                     className={`button ${rankingSortBy === 'profitRate' ? '' : 'button-secondary'}`}
                                 >
                                     투자 수익률
                                 </button>
                             </div>
                        </div>
                        <RankingBoard students={sortedStudentsForRanking} sortBy={rankingSortBy} />
                    </div>
                )}
            </div>
            {tradeInfo && <TradeModal tradeInfo={tradeInfo} student={student} classInfo={classInfo} onClose={() => setTradeInfo(null)} onConfirm={handleConfirmTrade} />}
            {infoModalStock && <StockInfoModal stock={infoModalStock} onClose={() => setInfoModalStock(null)} />}
        </div>
    );
};

export default StudentDashboard;
