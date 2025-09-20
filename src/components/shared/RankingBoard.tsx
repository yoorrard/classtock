import React from 'react';
import { StudentInfo } from '../../types';

interface RankingBoardProps {
    students: (StudentInfo & { totalAssets: number })[];
}

const RankingBoard: React.FC<RankingBoardProps> = ({ students }) => {
    const sortedStudents = [...students].sort((a, b) => b.totalAssets - a.totalAssets);
    return (
        <div className="info-section">
            {sortedStudents.length > 0 ? (
                <ul className="data-list">{sortedStudents.map((student, index) => (
                    <li key={student.id} className="data-list-item ranking-list-item">
                        <span className="rank">{index + 1}</span>
                        <span style={{flex: 1, textAlign: 'left', marginLeft: '1rem'}}>{student.nickname}</span>
                        <span>{student.totalAssets.toLocaleString()}원</span>
                    </li>
                ))}</ul>
            ) : <div className="info-card" style={{textAlign: 'center'}}><p>아직 참여한 학생이 없습니다.</p></div>}
        </div>
    );
};

export default RankingBoard;
