import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Extractor from './pages/Extractor';
import Analysis from './pages/Analysis';
import Forecast from './pages/Forecast';
import Login from './pages/Login';
import ChatWidget from './components/ChatWidget';
import './index.css';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('steelops_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showMenu, setShowMenu] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('steelops_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('steelops_theme', theme);
  }, [theme]);

  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem('steelops_user', JSON.stringify(userData));
  };

  if (!user) {
    return <Login onLogin={handleLogin} theme={theme} />;
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar theme={theme} />
        <main className="main-content">
          {/* Top Right Controls */}
          <div style={{ position: 'fixed', top: '20px', right: '30px', zIndex: 99, display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme Toggle */}
            <div
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'var(--bg-layer-1)',
                border: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '1.1rem', transition: '0.2s',
                boxShadow: 'var(--shadow-float)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-layer-1)'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </div>

            {/* Logout Button */}
            <div
              onClick={() => { sessionStorage.removeItem('steelops_user'); window.location.reload(); }}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'var(--bg-layer-1)',
                border: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '1.1rem', transition: '0.2s',
                color: '#ef4444',
                boxShadow: 'var(--shadow-float)',
              }}
              title="Sign Out"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-layer-1)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
            >
              ⏻
            </div>
          </div>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/extractor" element={<Extractor />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/forecast" element={<Forecast />} />
          </Routes>
        </main>

        <ChatWidget theme={theme} />
      </div>
    </BrowserRouter>
  );
}
