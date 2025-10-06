// App.js - Main App Component
import { useState, useEffect } from 'react';
import { authUtils } from './utils/auth';
import LandingPage from './components/LandingPage';
import SignupPage from './components/Signup';
import LoginPage from './components/Login';
import DashboardPage from './components/Dashboard';
import PreferencesPage from './components/PreferencesPage';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [pageProps, setPageProps] = useState({});

  // Check for existing session on app load
  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      const savedToken = authUtils.getToken();
      const savedUsername = authUtils.getUser();
      
      setToken(savedToken);
      setUser(savedUsername);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleNavigate = (page, props = {}) => {
    setCurrentPage(page);
    setPageProps(props);
  };

  const handleLogin = (newToken, username) => {
    authUtils.setToken(newToken);
    authUtils.setUser(username);
    setToken(newToken);
    setUser(username);
  };

  const handleLogout = () => {
    authUtils.clearAuth();
    setToken(null);
    setUser(null);
    setPageProps({});
  };

  return (
    <div className="font-sans">
      {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      {currentPage === 'signup' && <SignupPage onNavigate={handleNavigate} />}
      {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />}
      {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} user={user} onLogout={handleLogout} />}
      {currentPage === 'preferences' && (
        <PreferencesPage 
          onNavigate={handleNavigate} 
          user={user} 
          isUpdate={pageProps.isUpdate || false}
        />
      )}
    </div>
  );
}

export default App;