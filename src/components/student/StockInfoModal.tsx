import React from 'react';
import { Stock } from '../../types';

interface StockInfoModalProps {
    stock: Stock;
    onClose: () => void;
}

const StockInfoModal: React.FC<StockInfoModalProps> = ({ stock, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{stock.name} <span style={{fontSize: '1rem', color: '#666', fontWeight: 500}}>({stock.code})</span></h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <div style={{textAlign: 'left'}}>
                    <p style={{fontSize: '0.9rem', color: '#555', marginTop: 0}}><strong>산업군:</strong> {stock.sector}</p>
                    <div className="info-card" style={{padding: '1rem', backgroundColor: 'var(--card-bg)'}}>
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