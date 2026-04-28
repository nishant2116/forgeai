import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Login({ onLogin, theme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (email && password === 'Pass@123') {
        onLogin({ email, name: email.split('@')[0] });
      } else if (!email || !password) {
        setError('Please enter both email and password.');
      } else {
        setError('Access Denied: Invalid credentials.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
    }}>
      {/* Animated background orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: theme === 'light' ? 'radial-gradient(circle, rgba(95,168,255,0.06), transparent 70%)' : 'radial-gradient(circle, rgba(95,168,255,0.1), transparent 70%)',
          top: '-10%', left: '-5%', animation: 'bg-pulse 12s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
          background: theme === 'light' ? 'radial-gradient(circle, rgba(143,163,184,0.05), transparent 70%)' : 'radial-gradient(circle, rgba(143,163,184,0.08), transparent 70%)',
          bottom: '-15%', right: '-10%', animation: 'bg-pulse 15s ease-in-out infinite alternate-reverse',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div className="login-logo" style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: theme === 'light' ? 'white' : 'var(--grad-primary)',
            margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: theme === 'light' ? '0 4px 20px rgba(28,42,58,0.08)' : '0 0 30px rgba(95,168,255,0.2)',
            overflow: 'hidden',
          }}>
            <img src={theme === 'light' ? "/logo_light.png" : "/logo.png"} alt="ForgeAI" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
          </div>
          <h1 className="login-title" style={{
            fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)',
            marginBottom: '8px',
          }}>
            ForgeAI <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', color: 'transparent' }}>AI</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manufacturing Intelligence Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="login-card" style={{
          background: 'var(--grad-surface)',
          backdropFilter: 'blur(40px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: 'var(--shadow-float)',
        }}>
          <h2 style={{
            fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)',
            marginBottom: '8px',
          }}>
            Welcome back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '28px' }}>
            Sign in to access your dashboard
          </p>

          {error && (
            <div style={{
              padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px',
              color: '#fca5a5', fontSize: '0.85rem', marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 600,
                color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="form-input"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 600,
                color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ width: '100%' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%', justifyContent: 'center', padding: '14px',
                fontSize: '1rem', borderRadius: '12px',
              }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</>
              ) : 'Sign In →'}
            </button>
          </form>


        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>
            Powered by LangChain + Groq • Built by{' '}
            <a 
              href="https://www.linkedin.com/in/nishant-deshmukh2116/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-blue-core)', textDecoration: 'none', fontWeight: 600 }}
            >
              Nishant
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
