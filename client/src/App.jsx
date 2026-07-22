import { Navigate, Route, Routes } from 'react-router-dom';
import { BookmarksProvider } from './context/BookmarksContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ToolsPage from './pages/ToolsPage.jsx';
import ToolDetailPage from './pages/ToolDetailPage.jsx';
import ModelsPage from './pages/ModelsPage.jsx';
import ModelDetailPage from './pages/ModelDetailPage.jsx';
import LearnPage from './pages/LearnPage.jsx';
import GuideDetailPage from './pages/GuideDetailPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BookmarksProvider>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/:slug" element={<ToolDetailPage />} />
            <Route path="/models" element={<ModelsPage />} />
            <Route path="/models/:slug" element={<ModelDetailPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/learn/:slug" element={<GuideDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BookmarksProvider>
  );
}
