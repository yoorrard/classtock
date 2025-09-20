import React, { useState, useEffect } from 'react';
import { Stock } from '../../types';

interface StockManagerProps {
    allowedStocks: string[];
    allStocks: Stock[];
    onSave: (updatedStockCodes: string[]) => void;
}

const StockManager: React.FC<StockManagerProps> = ({ allowedStocks, allStocks, onSave }) => {
    const [selectedCodes, setSelectedCodes] = useState<string[]>(allowedStocks);
    const [searchTerm, setSearchTerm] = useState('');
    
    const recommendedStockCodes = ['005930', '005380', '051910', '035420', '068270', '005490', '105560', '003490', '097950', '329180'];

    useEffect(() => {
        setSelectedCodes(allowedStocks);
    }, [allowedStocks]);
    
    const handleAdd = (code: string) => {
        if (selectedCodes.length < 10 && !selectedCodes.includes(code)) {
            setSelectedCodes([...selectedCodes, code]);
        }
    };
    const handleRemove = (code: string) => {
        setSelectedCodes(selectedCodes.filter(c => c !== code));
    };
    const handleRecommend = () => {
        setSelectedCodes(recommendedStockCodes);
    };

    const handleSave = () => {
        onSave(selectedCodes);
    };
    
    const selectedStockDetails = selectedCodes.map(code => allStocks.find(s => s.code === code)).filter(Boolean) as Stock[];
    
    const availableStocks = allStocks.filter(s => 
        !selectedCodes.includes(s.code) &&
        (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.includes(searchTerm))
    );

    return (
        <div className="stock-manager-container">
            <div className="info-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4>선택된 종목 ({selectedCodes.length}/10)</h4>
                    <button onClick={handleRecommend} className="button button-secondary" style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}}>종목 추천</button>
                </div>
                {selectedStockDetails.length > 0 ? (
                    <ul className="data-list">{selectedStockDetails.map(stock => (
                        <li key={stock.code} className="data-list-item">
                            <div className="stock-info"><span>{stock.name}</span><small>{stock.code}</small></div>
                            <button onClick={() => handleRemove(stock.code)} className="button button-secondary" style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}}>제거</button>
                        </li>
                    ))}</ul>
                ) : <p>선택된 투자 종목이 없습니다. '종목 추천'을 이용하거나 아래에서 직접 추가해보세요.</p>}
            </div>
            <div className="info-card">
                <h4>종목 검색 및 추가</h4>
                <div className="input-group" style={{marginBottom: '1rem'}}>
                    <input type="text" className="input-field" placeholder="종목명 또는 코드 검색" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <ul className="data-list">{availableStocks.map(stock => (
                    <li key={stock.code} className="data-list-item">
                       <div className="stock-info"><span>{stock.name}</span><small>{stock.code}</small></div>
                        <button onClick={() => handleAdd(stock.code)} disabled={selectedCodes.length >= 10} className="button" style={{width:'auto', padding:'0.3rem 0.8rem', fontSize:'0.8rem'}}>추가</button>
                    </li>
                ))}</ul>
            </div>
            <div className="action-buttons" style={{marginTop: '0.5rem', gridColumn: '1 / -1'}}>
                <button onClick={handleSave} className="button" style={{width: '100%'}}>선택 완료</button>
            </div>
        </div>
    );
};

export default StockManager;
