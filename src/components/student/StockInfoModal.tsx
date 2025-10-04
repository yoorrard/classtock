import React, { useState, useEffect } from 'react';
import { Stock } from '../../types';
import StockChart from './StockChart';

interface StockInfoModalProps {
    stock: Stock;
    averagePrice?: number;
    onClose: () => void;
}

const generateHistoricalData = (basePrice: number): number[] => {
    const data = [basePrice];
    let currentPrice = basePrice;
    for (let i = 0; i < 9; i++) {
        const changePercent = (Math.random() - 0.5) * 0.1; // -5% to +5% change
        currentPrice = Math.max(1000, currentPrice / (1 + changePercent));
        data.unshift(Math.round(currentPrice / 100) * 100);
    }
    return data;
};

const StockInfoModal: React.FC<StockInfoModalProps> = ({ stock, averagePrice, onClose }) => {
    const [historicalData, setHistoricalData] = useState<number[]>([]);

    useEffect(() => {
        setHistoricalData(generateHistoricalData(stock.price));
    }, [stock.price]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header" style={{ paddingBottom: 0, border: 'none', display: 'block', textAlign: 'center' }}>
                     <div style={{display: 'flex', justifyContent: 'flex-end', height: 0}}>
                        <button onClick={onClose} className="close-button" aria-label="닫기" style={{position: 'relative', top: '-1.5rem', right: '-1.5rem'}}>&times;</button>
                    </div>
                    <div className="stock-info-header">
                        <h2>{stock.name}</h2>
                        <p>{stock.code}</p>
                        <strong>{stock.price.toLocaleString()}원</strong>
                    </div>
                </header>
                 <div className="stock-chart-container">
                    {historicalData.length > 0 && <StockChart historicalData={historicalData} averagePrice={averagePrice} />}
                </div>
                <div style={{textAlign: 'left'}}>
                    <div className="info-card" style={{padding: '1rem', backgroundColor: 'var(--card-bg)', border: 'none'}}>
                        <h4 style={{marginTop: 0, marginBottom: '0.5rem', color: 'var(--primary-dark)'}}>어떤 일을 하는 기업인가요?</h4>
                        <p style={{marginTop: 0, lineHeight: 1.6, fontSize: '0.95rem'}}>{stock.description}</p>
                    </div>
                </div>
                 <div className="action-buttons" style={{marginTop: '1.5rem'}}>
                    <button type="button" className="button button-secondary" style={{width: '100%'}} onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
};

export default StockInfoModal;