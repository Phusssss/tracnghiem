import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function MixedQuiz() {
  const [quizSets, setQuizSets] = useState([]);
  const [selectedSets, setSelectedSets] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [autoNext, setAutoNext] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);

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

  const toggleSetSelection = (setId) => {
    setSelectedSets(prev => 
      prev.includes(setId) 
        ? prev.filter(id => id !== setId)
        : [...prev, setId]
    );
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startMixedQuiz = () => {
    let mixedQuestions = [];
    selectedSets.forEach(setId => {
      const set = quizSets.find(s => s.id === setId);
      if (set && set.questions) {
        set.questions.forEach(q => {
          mixedQuestions.push({ ...q, setTitle: set.title });
        });
      }
    });

    // Trộn câu hỏi nếu được chọn
    if (shuffleQuestions) {
      mixedQuestions = shuffleArray(mixedQuestions);
    }

    // Trộn đáp án nếu được chọn
    if (shuffleAnswers) {
      mixedQuestions = mixedQuestions.map(q => {
        const correctOption = q.options[q.correctAnswer];
        const shuffledOptions = shuffleArray(q.options);
        const newCorrectIndex = shuffledOptions.indexOf(correctOption);
        
        return {
          ...q,
          options: shuffledOptions,
          correctAnswer: newCorrectIndex
        };
      });
    }

    setQuestions(mixedQuestions);
    setCurrentIndex(0);
    setScore({ correct: 0, total: 0 });
    setGameStarted(true);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[currentIndex].correctAnswer;
    
    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
    setScore(prev => ({ ...prev, total: prev.total + 1 }));

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, autoNext * 1000);
  };

  const resetQuiz = () => {
    setGameStarted(false);
    setShowResult(false);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore({ correct: 0, total: 0 });
    setSelectedSets([]);
    setShuffleQuestions(false);
    setShuffleAnswers(false);
  };

  if (showResult) {
    const percentage = Math.round((score.correct / score.total) * 100);
    return (
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '2rem', color: '#333' }}>Kết quả thi trộn đề</h1>
        
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            color: percentage >= 70 ? '#4CAF50' : '#f44336', 
            fontSize: '3rem',
            marginBottom: '1rem' 
          }}>
            {score.correct}/{score.total}
          </h2>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
            Điểm: {percentage}%
          </p>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>
            {percentage >= 70 ? '🎉 Xuất sắc!' : '💪 Cố gắng thêm!'}
          </p>
        </div>

        <button
          onClick={resetQuiz}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            marginTop: '2rem'
          }}
        >
          Thi lại
        </button>
      </div>
    );
  }

  if (gameStarted && questions.length > 0) {
    const currentQ = questions[currentIndex];
    const isAnswered = selectedAnswer !== null;
    const isCorrect = isAnswered && selectedAnswer === currentQ.correctAnswer;

    return (
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1rem',
          background: 'white',
          borderRadius: '8px'
        }}>
          <h2>Câu {currentIndex + 1}/{questions.length}</h2>
          <div style={{ fontSize: '1.1rem', color: '#666' }}>
            Điểm: {score.correct}/{score.total}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          minHeight: '400px'
        }}>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
            Từ bộ đề: {currentQ.setTitle}
          </p>
          
          <h3 style={{ 
            fontSize: '1.3rem', 
            marginBottom: '2rem',
            lineHeight: '1.5'
          }}>
            {currentQ.question}
          </h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {currentQ.options.map((option, index) => {
              let bgColor = 'white';
              let borderColor = '#ddd';
              
              if (isAnswered) {
                if (index === currentQ.correctAnswer) {
                  bgColor = '#e8f5e8';
                  borderColor = '#4CAF50';
                } else if (index === selectedAnswer && selectedAnswer !== currentQ.correctAnswer) {
                  bgColor = '#ffeaea';
                  borderColor = '#f44336';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  style={{
                    padding: '1rem',
                    border: `2px solid ${borderColor}`,
                    borderRadius: '8px',
                    background: bgColor,
                    cursor: isAnswered ? 'default' : 'pointer',
                    textAlign: 'left',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }}
                >
                  <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                  {isAnswered && index === currentQ.correctAnswer && ' ✓'}
                  {isAnswered && index === selectedAnswer && selectedAnswer !== currentQ.correctAnswer && ' ✗'}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              borderRadius: '8px',
              background: isCorrect ? '#e8f5e8' : '#ffeaea',
              textAlign: 'center'
            }}>
              <h4 style={{ 
                color: isCorrect ? '#4CAF50' : '#f44336',
                fontSize: '1.2rem'
              }}>
                {isCorrect ? '🎉 Chính xác!' : '❌ Sai rồi!'}
              </h4>
              <p style={{ marginTop: '0.5rem', color: '#666' }}>
                Tự động chuyển câu sau {autoNext} giây...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Thi trộn đề</h1>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Cài đặt</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ display: 'block' }}>
            Thời gian tự động chuyển câu (giây):
            <input
              type="number"
              min="1"
              max="10"
              value={autoNext}
              onChange={(e) => setAutoNext(parseInt(e.target.value))}
              style={{
                marginLeft: '1rem',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '80px'
              }}
            />
          </label>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
              />
              Trộn câu hỏi
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={shuffleAnswers}
                onChange={(e) => setShuffleAnswers(e.target.checked)}
              />
              Trộn đáp án
            </label>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Chọn bộ đề để trộn</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {quizSets.map(set => (
            <label key={set.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              background: selectedSets.includes(set.id) ? '#e3f2fd' : 'white'
            }}>
              <input
                type="checkbox"
                checked={selectedSets.includes(set.id)}
                onChange={() => toggleSetSelection(set.id)}
              />
              <div>
                <h4>{set.title}</h4>
                <p style={{ color: '#666', margin: 0 }}>
                  {set.questions?.length || 0} câu hỏi
                </p>
              </div>
            </label>
          ))}
        </div>

        {selectedSets.length > 0 && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Đã chọn {selectedSets.length} bộ đề - 
              Tổng {selectedSets.reduce((total, setId) => {
                const set = quizSets.find(s => s.id === setId);
                return total + (set?.questions?.length || 0);
              }, 0)} câu hỏi
            </p>
            
            <button
              onClick={startMixedQuiz}
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
            >
              Bắt đầu thi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MixedQuiz;