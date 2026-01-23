
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import FounderIdea from './pages/FounderIdea';
import FounderResult from './pages/FounderResult';
import FounderInsights from './pages/FounderInsights';
import FounderRequests from './pages/FounderRequests';
import FunderDashboard from './pages/FunderDashboard';
import FunderView from './pages/FunderView';
import ChatRoom from './pages/ChatRoom';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#0f172a]"><div className="w-10 h-10 border-4 border-t-blue-600 rounded-full animate-spin"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/founder/idea" element={<ProtectedRoute><FounderIdea /></ProtectedRoute>} />
            <Route path="/founder/result/:id" element={<ProtectedRoute><FounderResult /></ProtectedRoute>} />
            <Route path="/founder/insights/:id" element={<ProtectedRoute><FounderInsights /></ProtectedRoute>} />
            <Route path="/founder/requests" element={<ProtectedRoute><FounderRequests /></ProtectedRoute>} />
            <Route path="/funder/dashboard" element={<ProtectedRoute><FunderDashboard /></ProtectedRoute>} />
            <Route path="/funder/view/:id" element={<ProtectedRoute><FunderView /></ProtectedRoute>} />
            <Route path="/chat/:connectionId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
