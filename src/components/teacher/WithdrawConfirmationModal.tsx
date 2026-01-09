import React, { useState } from 'react';

interface WithdrawConfirmationModalProps {
    email: string;
    classCount: number;
    onClose: () => void;
    onConfirm: () => void;
}

const WithdrawConfirmationModal: React.FC<WithdrawConfirmationModalProps> = ({
    email,
    classCount,
    onClose,
    onConfirm
}) => {
    const [confirmText, setConfirmText] = useState('');
    const isConfirmEnabled = confirmText === '탈퇴';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <header className="modal-header">
                    <h2 style={{ color: '#dc3545' }}>회원 탈퇴</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>

                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ marginBottom: '1rem', fontWeight: 500 }}>
                        정말로 탈퇴하시겠습니까?
                    </p>
                    <div style={{
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
                            <strong>⚠️ 주의:</strong> 탈퇴 시 다음 데이터가 모두 삭제됩니다.
                        </p>
                        <ul style={{ margin: '0.5rem 0 0 1.2rem', fontSize: '0.9rem', color: '#856404' }}>
                            <li>계정 정보 ({email})</li>
                            {classCount > 0 && (
                                <>
                                    <li>생성한 학급 {classCount}개</li>
                                    <li>학급에 속한 모든 학생 정보</li>
                                    <li>학생들의 거래 내역</li>
                                </>
                            )}
                        </ul>
                    </div>

                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        탈퇴를 진행하려면 아래에 <strong>"탈퇴"</strong>를 입력해주세요.
                    </p>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="탈퇴"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        style={{ marginBottom: 0 }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        className="button button-secondary"
                        style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        className="button button-danger"
                        style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                        disabled={!isConfirmEnabled}
                    >
                        탈퇴하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WithdrawConfirmationModal;
