import { useState, useRef, useEffect } from 'react';
import { chatWithData } from '../api/client';

const SAMPLE_QUERIES = [
  "Which stage causes the most delays?",
  "Compare controllable vs external delays",
  "What's the worst performing shift?",
  "Summarize equipment breakdown impact",
  "Recommend top 3 improvements",
];

export default function ChatWidget({ theme }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m your ForgeAI assistant. Ask me anything about the production delay data — I can analyze stages, categories, shifts, and trends for you.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (q) => {
    const question = (q || input).trim();
    if (!question || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);
    try {
      const res = await chatWithData(question);
      setMessages(prev => [...prev, { role: 'bot', text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong. Make sure the backend is running.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* FAB Button */}
      <div
        className="chat-fab"
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--grad-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: 'var(--glow-primary)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: 'none',
          overflow: 'hidden',
        }}
      >
        {open
          ? <span style={{ fontSize: '1.5rem', color: 'white' }}>✕</span>
          : <img 
              src={theme === 'light' ? "/logo_light.png" : "/logo.png"} 
              alt="Chat" 
              style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '50%', background: theme === 'light' ? 'white' : 'transparent' }} 
            />
        }
      </div>

      {/* Chat Panel */}
      {open && (
        <div className="chat-panel" style={{
          position: 'fixed', bottom: '92px', right: '24px', zIndex: 999,
          width: '380px', height: '520px',
          background: 'var(--bg-layer-1)',
          backdropFilter: 'blur(40px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '20px',
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-float)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--grad-surface)'
          }}>
            <img 
              src={theme === 'light' ? "/logo_light.png" : "/logo.png"} 
              alt="ForgeAI" 
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', background: theme === 'light' ? 'white' : 'transparent' }} 
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>ForgeAI</div>
              <div style={{ fontSize: '0.7rem', color: '#10b981' }}>● Online</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflow: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: m.role === 'user'
                  ? 'var(--grad-primary)'
                  : 'var(--bg-layer-2)',
                color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                fontSize: '0.82rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}>
                {m.text}
              </div>
            ))}

            {/* Sample Queries */}
            {messages.length === 1 && !loading && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {SAMPLE_QUERIES.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => send(q)}
                    style={{
                      padding: '6px 12px', fontSize: '0.75rem',
                      background: 'var(--accent-blue-dim)',
                      border: '1px solid rgba(95, 168, 255, 0.2)',
                      borderRadius: '20px', color: 'var(--accent-blue-core)',
                      cursor: 'pointer', transition: '0.15s',
                      fontFamily: 'Outfit',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(95, 168, 255, 0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent-blue-dim)'}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div style={{
                alignSelf: 'flex-start', maxWidth: '85%',
                padding: '10px 14px', borderRadius: '14px 14px 14px 4px',
                background: 'var(--bg-layer-2)',
                color: 'var(--text-muted)', fontSize: '0.82rem',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <div className="spinner" style={{ width: 14, height: 14 }} />
                Analyzing data...
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex', gap: '8px',
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about the delay data..."
              style={{
                flex: 1, background: 'var(--bg-layer-2)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px', padding: '10px 14px',
                color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
                fontFamily: 'Outfit',
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                background: 'var(--grad-primary)',
                border: 'none', borderRadius: '12px', padding: '0 16px',
                color: 'white', fontWeight: 600, cursor: 'pointer',
                fontSize: '0.9rem', opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >↑</button>
          </div>
        </div>
      )}
    </>
  );
}
