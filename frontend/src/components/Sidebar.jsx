import { NavLink } from 'react-router-dom';
import { HiOutlineChartBar, HiOutlineCpuChip, HiOutlineDocumentMagnifyingGlass, HiOutlinePresentationChartLine } from 'react-icons/hi2';

const navItems = [
  { to: '/', icon: <HiOutlineChartBar />, label: 'Dashboard' },
  { to: '/extractor', icon: <HiOutlineCpuChip />, label: 'AI Extractor' },
  { to: '/analysis', icon: <HiOutlineDocumentMagnifyingGlass />, label: 'Delay Analysis' },
  { to: '/forecast', icon: <HiOutlinePresentationChartLine />, label: 'Forecasting' },
];

export default function Sidebar({ theme }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={theme === 'light' ? "/logo_light.png" : "/logo.png"} 
            alt="Logo" 
            style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              boxShadow: theme === 'light' ? '0 2px 10px rgba(28,42,58,0.1)' : '0 0 15px rgba(95, 168, 255, 0.2)' 
            }} 
          />
          ForgeAI
        </h2>
        <span>Manufacturing Analytics</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Operations</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              background: isActive 
                ? 'linear-gradient(135deg, rgba(95, 168, 255, 0.1), rgba(143, 163, 184, 0.05))' 
                : 'transparent',
              boxShadow: isActive ? '0 0 20px rgba(143, 163, 184, 0.05)' : 'none',
            })}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '0 20px 24px', marginTop: 'auto', textAlign: 'center' }}>
        <p style={{ 
          fontSize: '0.75rem', 
          color: 'var(--text-muted)', 
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          Developed by{' '}
          <a 
            href="https://www.linkedin.com/in/nishant-deshmukh2116/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: 'var(--accent-blue-core)', 
              textDecoration: 'none',
              fontWeight: 700,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-blue-core)'}
          >
            Nishant
          </a>
        </p>
      </div>
    </aside>
  );
}
