import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, useSearchParams, Link } from 'react-router-dom';

function TakeQuiz() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isInstantMode = searchParams.get('mode') === 'instant';
  const [quizSet, setQuizSet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [autoNext, setAutoNext] = useState(3);

  useEffect(() => {
    const fetchQuiz = async () => {
      const docRef = doc(db, 'quizSets', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setQuizSet(data);
        setQuestions(data.questions);
      }
    };
    fetchQuiz();
  }, [id]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const applySettings = () => {
    let processedQuestions = [...quizSet.questions];
    
    if (shuffleQuestions) {
      processedQuestions = shuffleArray(processedQuestions);
    }
    
    if (shuffleAnswers) {
      processedQuestions = processedQuestions.map(q => {
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
    
    setQuestions(processedQuestions);
    setAnswers({});
    if (isInstantMode) {
      setCurrentIndex(0);
      setScore({ correct: 0, total: 0 });
    }
  };

  const handleInstantAnswer = (answerIndex) => {
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
        setShowResults(true);
      }
    }, autoNext * 1000);
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: questions.length };
  };

  if (!quizSet) {
    return <div>Đang tải...</div>;
  }

  if (showResults) {
    const { correct, total } = isInstantMode ? score : calculateScore();
    const percentage = Math.round((correct / total) * 100);
    
    return (
      <div>
        <h1 style={{ marginBottom: '2rem', color: '#333' }}>Kết quả bài thi</h1>
        
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: percentage >= 70 ? '#4CAF50' : '#f44336', marginBottom: '1rem' }}>
            {correct}/{total} ({percentage}%)
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            {percentage >= 70 ? 'Chúc mừng! Bạn đã đạt!' : 'Cần cố gắng thêm!'}
          </p>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Chi tiết đáp án:</h3>
          {questions.map((q, index) => (
            <div key={index} style={{
              padding: '1rem',
              marginBottom: '1rem',
              border: '1px solid #eee',
              borderRadius: '4px',
              background: answers[index] === q.correctAnswer ? '#e8f5e8' : '#ffeaea'
            }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Câu {index + 1}: {q.question}
              </p>
              <p style={{ color: '#666' }}>
                Đáp án đúng: {String.fromCharCode(65 + q.correctAnswer)}. {q.options[q.correctAnswer]}
              </p>
              {answers[index] !== undefined && answers[index] !== q.correctAnswer && (
                <p style={{ color: '#f44336' }}>
                  Bạn chọn: {String.fromCharCode(65 + answers[index])}. {q.options[answers[index]]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/" style={{
            background: '#2196F3',
            color: 'white',
            padding: '0.75rem 1.5rem',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '1rem'
          }}>
            Về trang chủ
          </Link>
          <button
            onClick={() => {
              setShowResults(false);
              setAnswers({});
              if (isInstantMode) {
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setScore({ correct: 0, total: 0 });
              }
            }}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Làm lại
          </button>
        </div>
      </div>
    );
  }

  // Chế độ thi nhanh - hiển thị từng câu
  if (isInstantMode && questions.length > 0 && !showResults) {
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
          <h2>{quizSet.title} - Câu {currentIndex + 1}/{questions.length}</h2>
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
                  onClick={() => handleInstantAnswer(index)}
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
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>
        {quizSet.title} {isInstantMode && '- Chế độ thi nhanh'}
      </h1>
      
      {isInstantMode && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
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
        </div>
      )}
      
      {!isInstantMode && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }}>
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
        
        <button
          onClick={applySettings}
          style={{
            background: '#FF9800',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Áp dụng
        </button>
        </div>
      )}

      {!isInstantMode && questions.map((q, index) => (
        <div key={index} style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>Câu {index + 1}: {q.question}</h3>
          
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {q.options.map((option, oIndex) => (
              <label key={oIndex} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                background: answers[index] === oIndex ? '#e3f2fd' : 'transparent'
              }}>
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={oIndex}
                  checked={answers[index] === oIndex}
                  onChange={() => setAnswers({...answers, [index]: oIndex})}
                />
                <span>{String.fromCharCode(65 + oIndex)}. {option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {!isInstantMode && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={submitQuiz}
            disabled={Object.keys(answers).length !== questions.length}
            style={{
              background: Object.keys(answers).length === questions.length ? '#4CAF50' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '4px',
              cursor: Object.keys(answers).length === questions.length ? 'pointer' : 'not-allowed',
              fontSize: '1.1rem'
            }}
          >
            Nộp bài ({Object.keys(answers).length}/{questions.length})
          </button>
        </div>
      )}
    </div>
  );
}

export default TakeQuiz;