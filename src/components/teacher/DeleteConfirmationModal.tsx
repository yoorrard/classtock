import React from 'react';
import { ClassInfo } from '../../types';

interface DeleteConfirmationModalProps {
    classInfo: ClassInfo;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ classInfo, onClose, onConfirm }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2 style={{ color: 'var(--positive-color)' }}>학급 삭제 확인</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <p><strong>"{classInfo.name}"</strong> 학급을 정말로 삭제하시겠습니까?</p>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>이 작업은 되돌릴 수 없으며, 학급에 속한 모든 학생 데이터와 거래 내역이 영구적으로 삭제됩니다.</p>
                <div className="action-buttons" style={{ marginTop: '2rem' }}>
                    <button type="button" className="button button-secondary" onClick={onClose}>취소</button>
                    <button type="button" className="button button-danger" onClick={onConfirm}>삭제하기</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
