import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import QuizSetList from './pages/QuizSetList';
import CreateQuizSet from './pages/CreateQuizSet';
import TakeQuiz from './pages/TakeQuiz';
import ImportExcel from './pages/ImportExcel';
import MixedQuiz from './pages/MixedQuiz';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh' }}>
        <nav style={{ background: '#2196F3', padding: '1rem', color: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '2rem' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
              Trang chủ
            </Link>
            <Link to="/create" style={{ color: 'white', textDecoration: 'none' }}>
              Tạo bộ đề
            </Link>
            <Link to="/import" style={{ color: 'white', textDecoration: 'none' }}>
              Import Excel
            </Link>
            <Link to="/mixed" style={{ color: 'white', textDecoration: 'none' }}>
              Thi trộn đề
            </Link>
          </div>
        </nav>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<QuizSetList />} />
            <Route path="/create" element={<CreateQuizSet />} />
            <Route path="/import" element={<ImportExcel />} />
            <Route path="/mixed" element={<MixedQuiz />} />
            <Route path="/quiz/:id" element={<TakeQuiz />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;