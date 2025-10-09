// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Importing Bootstrap Icons CSS
import 'bootstrap-icons/font/bootstrap-icons.css';

// Importing React Router components
import { Routes, Route, Navigate } from 'react-router-dom';

// Importing page components
import { HomePage, QuestionListPage, LoginPage, RegisterPage, ForgotPasswordPage, DoQuestionPage, PostQuestionPage, UserProfilePage } from './pages';
// Auth Provider and Route Guards
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Home page - protected route */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Public routes - redirect to home if already authenticated */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />

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
        <Route
          path="/post-question"
          element={
            <ProtectedRoute>
              <PostQuestionPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all other routes and redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;