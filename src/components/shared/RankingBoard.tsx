import React from 'react';
import { StudentInfo } from '../../types';

type ExtendedStudentInfo = StudentInfo & { 
    totalAssets: number;
    totalProfit: number;
    totalProfitRate: number;
};

interface RankingBoardProps {
    students: ExtendedStudentInfo[];
    sortBy: 'totalAssets' | 'profitRate';
}

const RankingBoard: React.FC<RankingBoardProps> = ({ students, sortBy }) => {
    // Parent component handles sorting
    const sortedStudents = students;

    return (
        <div className="info-section">
            {sortedStudents.length > 0 ? (
                <ul className="data-list">{sortedStudents.map((student, index) => {
                    const profitClass = student.totalProfit > 0 ? 'positive' : student.totalProfit < 0 ? 'negative' : 'neutral';
                    return (
                        <li key={student.id} className="data-list-item ranking-list-item">
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span className="rank">{index + 1}</span>
                                <span>{student.nickname}</span>
                            </div>
                            {sortBy === 'totalAssets' ? (
                                <span>{student.totalAssets.toLocaleString()}원</span>
                            ) : (
                                <div className={`price-info ${profitClass}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem', fontSize: '1rem', fontWeight: 700 }}>
                                    <span>
                                        {student.totalProfit > 0 ? '▲ ' : student.totalProfit < 0 ? '▼ ' : ''}{Math.abs(student.totalProfit).toLocaleString()}원
                                    </span>
                                    <small className="profit" style={{ fontWeight: 700 }}>
                                        ({student.totalProfitRate.toFixed(2)}%)
                                    </small>
                                </div>
                            )}
                        </li>
                    );
                })}</ul>
            ) : <div className="info-card" style={{textAlign: 'center'}}><p>아직 참여한 학생이 없습니다.</p></div>}
        </div>
    );
};

export default RankingBoard;