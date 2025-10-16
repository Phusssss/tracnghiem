import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function CreateQuizSet() {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  }]);
  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const saveQuizSet = async () => {
    if (!title.trim() || questions.some(q => !q.question.trim())) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await addDoc(collection(db, 'quizSets'), {
        title,
        questions,
        createdAt: new Date()
      });
      alert('Tạo bộ đề thành công!');
      navigate('/');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Tạo bộ đề trắc nghiệm</h1>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Tên bộ đề:
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
          placeholder="Nhập tên bộ đề..."
        />
      </div>

      {questions.map((q, qIndex) => (
        <div key={qIndex} style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #eee'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Câu hỏi {qIndex + 1}</h3>
            {questions.length > 1 && (
              <button
                onClick={() => removeQuestion(qIndex)}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Xóa
              </button>
            )}
          </div>
          
          <textarea
            value={q.question}
            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
            placeholder="Nhập câu hỏi..."
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              minHeight: '80px',
              marginBottom: '1rem',
              resize: 'vertical'
            }}
          />

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {q.options.map((option, oIndex) => (
              <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correctAnswer === oIndex}
                  onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  placeholder={`Đáp án ${String.fromCharCode(65 + oIndex)}`}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button
          onClick={addQuestion}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Thêm câu hỏi
        </button>
        
        <button
          onClick={saveQuizSet}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Lưu bộ đề
        </button>
      </div>
    </div>
  );
}

export default CreateQuizSet;