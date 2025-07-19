import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking authentication status
    const checkAuth = setTimeout(() => {
      const saved = localStorage.getItem('miftah_auth');
      setIsAuthenticated(saved === 'true');
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(checkAuth);
  }, []);

  const handleLogin = (credentials: { username: string; password: string }) => {
    // Simulate authentication
    if (credentials.username === 'admin' && credentials.password === 'sparta2025') {
      localStorage.setItem('miftah_auth', 'true');
      setIsAuthenticated(true);
    }
    return credentials.username === 'admin' && credentials.password === 'sparta2025';
  };

  const handleLogout = () => {
    localStorage.removeItem('miftah_auth');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl font-mono">Initializing MIFTAH...</div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}

export default App;