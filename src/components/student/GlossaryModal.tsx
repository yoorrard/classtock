import React from 'react';

const glossaryData = [
    {
        term: '주식 (Stock)',
        definition: '회사의 작은 조각이에요. 여러분이 어떤 회사의 주식을 사면, 그 회사의 아주 작은 주인이 되는 것과 같아요. 회사가 돈을 잘 벌면 여러분이 가진 주식의 가치도 올라가고, 반대로 회사가 어려워지면 가치가 내려갈 수도 있어요. 마치 내가 좋아하는 게임 캐릭터를 응원하는 것과 비슷해요!'
    },
    {
        term: '시드머니 (Seed Money)',
        definition: '씨앗(seed)이 되는 돈(money)이라는 뜻이에요. 식물을 키우려면 씨앗을 심어야 하죠? 투자를 시작하기 위해 맨 처음 주어지는 돈을 바로 \'시드머니\'라고 불러요. 이 돈으로 여러 회사(주식)에 투자하며 자산을 키워나가는 거예요.'
    },
    {
        term: '포트폴리오 (Portfolio)',
        definition: '여러분만의 \'보물 주머니\'라고 생각하면 쉬워요. 어떤 회사의 주식을 몇 개나 가지고 있는지, 현금은 얼마나 남았는지 등 나의 모든 투자 상황을 한눈에 볼 수 있는 주머니랍니다.'
    },
    {
        term: '매수(사기) / 매도(팔기)',
        definition: '어떤 회사가 앞으로 더 성장할 것 같다고 생각될 때 그 회사의 주식을 사는 것을 \'매수\'라고 해요. 반대로, 내가 가진 주식의 가격이 충분히 올랐거나 다른 주식을 사고 싶을 때 가지고 있던 주식을 파는 것을 \'매도\'라고 합니다.'
    },
    {
        term: '수익금과 수익률 (Profit & Profit Rate)',
        definition: '주식을 샀을 때보다 비싼 가격에 팔아서 남은 돈을 \'수익금\'이라고 해요. 반대로 손해를 봤다면 \'손실금\'이 되겠죠? \'수익률\'은 내가 투자한 돈에 비해 얼마나 돈을 벌었는지(또는 잃었는지)를 퍼센트(%)로 보여주는 숫자예요.'
    },
    {
        term: '총 자산 (Total Assets)',
        definition: '여러분이 가진 현금과 모든 주식의 현재 가치를 합친 금액이에요. 여러분의 전체 재산이 얼마인지 보여주는 숫자랍니다.'
    },
    {
        term: '평가금액 vs 매입금액',
        definition: '‘매입금액’은 내가 그 주식들을 처음 살 때 썼던 돈의 총합이에요. ‘평가금액’은 내가 가진 주식들이 지금 당장 판다면 얼마의 가치가 있는지를 보여주는 금액이죠. 이 둘을 비교하면 얼마나 이익을 봤는지 알 수 있어요.'
    },
    {
        term: '수수료 (Commission)',
        definition: '주식을 사거나 팔 때, 거래를 도와주는 회사에 내는 작은 서비스 이용료예요. 가게에서 물건을 살 때 봉투 값을 내는 것과 비슷하다고 생각할 수 있어요.'
    }
];

interface GlossaryModalProps {
    onClose: () => void;
}

const GlossaryModal: React.FC<GlossaryModalProps> = ({ onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-content-wide glossary-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2 style={{color: 'var(--student-color-dark)'}}>알쏭달쏭 경제 용어 사전 📖</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <dl className="glossary-list">
                    {glossaryData.map((item, index) => (
                        <div key={index} className="glossary-item">
                            <dt className="glossary-term">{item.term}</dt>
                            <dd className="glossary-definition">{item.definition}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    );
};

export default GlossaryModal;