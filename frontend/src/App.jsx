// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Importing React Router components
import { Routes, Route, Navigate } from 'react-router-dom';

// Importing page components  
import { QuestionListPage, LoginPage, DoQuestionPage } from './pages';

function App() {
  return (
    <Routes>
      {/* Default redirect to questions */}
      <Route path="/" element={<Navigate to="/questions" replace />} />
      
      {/* Login page */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Question list page */}
      <Route path="/questions" element={<QuestionListPage />} />
      
      {/* Individual question page with dynamic ID */}
      <Route path="/question/:questionId" element={<DoQuestionPage />} />
      
      {/* Catch all other routes and redirect to questions */}
      <Route path="*" element={<Navigate to="/questions" replace />} />
    </Routes>
  );
}

export default App;