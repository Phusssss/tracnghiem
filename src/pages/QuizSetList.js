import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

function QuizSetList() {
  const [quizSets, setQuizSets] = useState([]);

  useEffect(() => {
    const fetchQuizSets = async () => {
      const querySnapshot = await getDocs(collection(db, 'quizSets'));
      const sets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuizSets(sets);
    };
    fetchQuizSets();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Danh sách bộ đề trắc nghiệm</h1>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        {quizSets.map(set => (
          <div key={set.id} style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>{set.title}</h3>
              <p style={{ color: '#666' }}>{set.questions?.length || 0} câu hỏi</p>
            </div>
            <Link 
              to={`/quiz/${set.id}`}
              style={{
                background: '#4CAF50',
                color: 'white',
                padding: '0.5rem 1rem',
                textDecoration: 'none',
                borderRadius: '4px'
              }}
            >
              Làm bài
            </Link>
          </div>
        ))}
      </div>
      
      {quizSets.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
          Chưa có bộ đề nào. <Link to="/create">Tạo bộ đề đầu tiên</Link>
        </p>
      )}
    </div>
  );
}

export default QuizSetList;