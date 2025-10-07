// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Importing React Router components
import { Routes, Route, Navigate } from 'react-router-dom';

// Importing page components
import { QuestionListPage, LoginPage, RegisterPage, ForgotPasswordPage, DoQuestionPage, UserProfilePage } from './pages';
// Auth Provider and Protected Route
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes */}
        <Route
          path="/questions"
          element={
            <ProtectedRoute>
              <QuestionListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/question/:questionId"
          element={
            <ProtectedRoute>
              <DoQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch all other routes and redirect to questions */}
        <Route path="*" element={<Navigate to="/questions" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;