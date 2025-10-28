import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import SignInUpPage from './pages/SignInUpPage';
import ProfessorSearchPage from './pages/ProfessorSearchPage';
import CourseSearchPage from './pages/CourseSearchPage';
import CourseProfilePage from './pages/CourseProfilePage';
import AccountPage from './pages/AccountPage';
import MyReviewsPage from './pages/MyReviewsPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<SignInUpPage />} />
          <Route path="/professor" element={<ProfessorSearchPage />} />
          <Route path="/course" element={<CourseSearchPage />} />
          <Route path="/course-profile" element={<CourseProfilePage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/my-reviews" element={<MyReviewsPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
