import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/Auth/AuthScreen';
import { Header } from './components/Dashboard/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ResumeUpload } from './components/Resume/ResumeUpload';
import { JobSearch } from './components/Jobs/JobSearch';
import { ResumeList } from './components/Resume/ResumeList';
import { ToastContainer } from './components/UI/Toast';
import { useToast } from './hooks/useToast';
import { Screen } from './types';

function AppContent() {
  const { user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const { toasts, showToast, removeToast } = useToast();

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AuthScreen 
          onSuccess={() => setCurrentScreen('dashboard')} 
          showToast={showToast}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'upload':
        return <ResumeUpload showToast={showToast} onNavigate={handleNavigate} />;
      case 'jobs':
        return <JobSearch showToast={showToast} />;
      case 'resumes':
        return <ResumeList showToast={showToast} onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onNavigate={handleNavigate} currentScreen={currentScreen} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentScreen()}
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;