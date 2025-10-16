import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function ImportExcel() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      parseExcelData(jsonData);
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const parseExcelData = (data) => {
    const questions = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.length >= 6) {
        const question = {
          question: row[0] || '',
          options: [
            row[1] || '',
            row[2] || '',
            row[3] || '',
            row[4] || ''
          ],
          correctAnswer: parseInt(row[5]) - 1 || 0
        };
        
        if (question.question.trim()) {
          questions.push(question);
        }
      }
    }
    
    setPreview(questions);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const saveQuizSet = async () => {
    if (!title.trim() || !preview || preview.length === 0) {
      alert('Vui lòng nhập tên bộ đề và chọn file Excel hợp lệ');
      return;
    }

    try {
      await addDoc(collection(db, 'quizSets'), {
        title,
        questions: preview,
        createdAt: new Date()
      });
      alert('Import thành công!');
      navigate('/');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['Câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng (1-4)'],
      ['Thủ đô của Việt Nam là?', 'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', '1'],
      ['2 + 2 = ?', '3', '4', '5', '6', '2']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template-tracnghiem.xlsx');
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Import bộ đề từ Excel</h1>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={downloadTemplate}
            style={{
              background: '#FF9800',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            Tải file mẫu Excel
          </button>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Định dạng: Câu hỏi | Đáp án A | Đáp án B | Đáp án C | Đáp án D | Đáp án đúng (1-4)
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
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

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Chọn file Excel:
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      {preview && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Xem trước ({preview.length} câu hỏi)</h3>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {preview.slice(0, 5).map((q, index) => (
              <div key={index} style={{
                padding: '1rem',
                marginBottom: '1rem',
                border: '1px solid #eee',
                borderRadius: '4px'
              }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Câu {index + 1}: {q.question}
                </p>
                <div style={{ display: 'grid', gap: '0.25rem', marginLeft: '1rem' }}>
                  {q.options.map((option, oIndex) => (
                    <p key={oIndex} style={{
                      color: oIndex === q.correctAnswer ? '#4CAF50' : '#666',
                      fontWeight: oIndex === q.correctAnswer ? 'bold' : 'normal'
                    }}>
                      {String.fromCharCode(65 + oIndex)}. {option}
                      {oIndex === q.correctAnswer && ' ✓'}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            
            {preview.length > 5 && (
              <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                ... và {preview.length - 5} câu hỏi khác
              </p>
            )}
          </div>
        </div>
      )}

      {preview && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={saveQuizSet}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}
          >
            Lưu bộ đề ({preview.length} câu hỏi)
          </button>
        </div>
      )}
    </div>
  );
}

export default ImportExcel;