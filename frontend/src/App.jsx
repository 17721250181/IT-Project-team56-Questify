import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Importing page components
import { QuestionListPage, LoginPage, DoQuestionPage } from './pages';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Question List Route */}
        <Route path="/questions" element={<QuestionListPage />} />
        
        {/* Do Question Route with dynamic questionId */}
        <Route path="/question/:questionId" element={<DoQuestionPage />} />
        
        {/* Default redirect to questions list */}
        <Route path="/" element={<Navigate to="/questions" replace />} />
        
        {/* Catch all route - redirect to questions */}
        <Route path="*" element={<Navigate to="/questions" replace />} />
      </Routes>
    </Router>
  );
}

export default App;