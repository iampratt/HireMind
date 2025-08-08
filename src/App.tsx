import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/Auth/AuthScreen';
import { Header } from './components/Dashboard/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ResumeUpload } from './components/Resume/ResumeUpload';
import { JobSearch } from './components/Jobs/JobSearch';
import { ResumeList } from './components/Resume/ResumeList';
import { Profile } from './components/Profile/Profile';
import { ResumeDetail } from './components/Resume/ResumeDetail';
import { ToastContainer } from './components/UI/Toast';
import { useToast } from './hooks/useToast';

function AppContent() {
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AuthScreen 
          onSuccess={() => {}} 
          showToast={showToast}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header showToast={showToast} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard showToast={showToast} />} />
          <Route path="/upload" element={<ResumeUpload showToast={showToast} />} />
          <Route path="/jobs" element={<JobSearch showToast={showToast} />} />
          <Route path="/resumes" element={<ResumeList showToast={showToast} />} />
          <Route path="/resumes/:resumeId" element={<ResumeDetail showToast={showToast} />} />
          <Route path="/profile" element={<Profile showToast={showToast} />} />
          <Route path="/profile/:profileId" element={<Profile showToast={showToast} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;