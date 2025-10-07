import React, { useState } from 'react';
import { TradeInfo, StudentInfo, ClassInfo } from '../../types';

interface TradeModalProps {
    tradeInfo: TradeInfo;
    student: StudentInfo;
    classInfo: ClassInfo;
    onClose: () => void;
    onConfirm: (quantity: number) => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ tradeInfo, student, classInfo, onClose, onConfirm }) => {
    const { type, stock } = tradeInfo;
    const [quantity, setQuantity] = useState('1');

    const commissionRatePercent = classInfo.hasCommission ? classInfo.commissionRate : 0;
    const commissionRateMultiplier = 1 + (commissionRatePercent / 100);

    const maxBuy = Math.floor(student.cash / (stock.price * commissionRateMultiplier));
    const maxSell = student.portfolio.find(p => p.stockCode === stock.code)?.quantity || 0;
    const maxQuantity = type === 'buy' ? maxBuy : maxSell;
    
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only empty string or positive integers
        if (value === '' || /^\d+$/.test(value)) {
            setQuantity(value);
        }
    };

    const numericQuantity = quantity === '' ? 0 : parseInt(quantity, 10);
    const total = stock.price * numericQuantity;
    const commission = Math.trunc(total * (commissionRatePercent / 100));
    const finalAmount = type === 'buy' ? total + commission : total - commission;
    const isConfirmDisabled = numericQuantity <= 0 || numericQuantity > maxQuantity;

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onConfirm(numericQuantity); };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header"><h2 style={{color: type === 'buy' ? 'var(--positive-color)' : 'var(--negative-color)'}}>{stock.name} {type === 'buy' ? '매수' : '매도'}</h2><button onClick={onClose} className="close-button" aria-label="닫기">&times;</button></header>
                <form onSubmit={handleSubmit}>
                    <div className="input-group"><label>현재가: {stock.price.toLocaleString()}원</label></div>
                    <div className="input-group">
                        <label htmlFor="quantity">수량 (최대: {maxQuantity.toLocaleString()}주)</label>
                        <input id="quantity" name="quantity" type="number" min="0" max={maxQuantity} className="input-field" value={quantity} onChange={handleQuantityChange} required />
                    </div>
                    <div className="trade-summary">
                        <p><span>주문금액</span><span>{total.toLocaleString()}원</span></p>
                        {classInfo.hasCommission && (
                            <p><span>수수료 ({commissionRatePercent}%)</span><span>{commission.toLocaleString()}원</span></p>
                        )}
                        <p><strong>{type === 'buy' ? '총 매수금액' : '총 매도금액'}</strong><strong>{finalAmount.toLocaleString()}원</strong></p>
                    </div>
                    <div className="action-buttons"><button type="button" className="button button-secondary" onClick={onClose}>취소</button><button type="submit" className={`button ${type === 'buy' ? 'button-buy' : 'button-sell'}`} disabled={isConfirmDisabled}>확인</button></div>
                </form>
            </div>
        </div>
    );
};

export default TradeModal;