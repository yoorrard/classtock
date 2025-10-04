import React from 'react';
import { StudentInfo } from '../../types';

interface DeleteStudentConfirmationModalProps {
    student: StudentInfo;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteStudentConfirmationModal: React.FC<DeleteStudentConfirmationModalProps> = ({ student, onClose, onConfirm }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2 style={{ color: 'var(--positive-color)' }}>학생 제외 확인</h2>
                    <button onClick={onClose} className="close-button" aria-label="닫기">&times;</button>
                </header>
                <p><strong>"{student.nickname}"</strong> 학생을 학급에서 정말로 제외하시겠습니까?</p>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>이 작업은 되돌릴 수 없으며, 해당 학생의 모든 데이터와 거래 내역이 영구적으로 삭제됩니다.</p>
                <div className="action-buttons" style={{ marginTop: '2rem' }}>
                    <button type="button" className="button button-secondary" onClick={onClose}>취소</button>
                    <button type="button" className="button button-danger" onClick={onConfirm}>제외하기</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteStudentConfirmationModal;