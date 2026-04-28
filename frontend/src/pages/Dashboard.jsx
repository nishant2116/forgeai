import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { getOverview, getDelaysByStage, getDelaysByCategory, getAnomalies } from '../api/client';

const COLORS = ['#5fa8ff', '#8fa3b8', '#2f6fed', '#10b981', '#0ea5e9', '#9fb0c3'];

const tooltipStyle = {
  backgroundColor: 'var(--bg-base)',
  border: '1px solid var(--glass-border)',
  borderRadius: '8px',
  fontSize: '0.8rem',
  color: 'var(--text-primary)',
  boxShadow: 'var(--shadow-float)',
};

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [stageData, setStageData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [ov, st, cat, anom] = await Promise.all([
          getOverview(),
          getDelaysByStage(),
          getDelaysByCategory(),
          getAnomalies(),
        ]);
        setOverview(ov.data);
        setStageData(st.data);
        setCategoryData(cat.data);
        setAnomalies(anom.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <span>Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <h3>Connection Error</h3>
        <p>Couldn't connect to backend. Make sure FastAPI is running on port 8000.</p>
        <p style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--accent-red)' }}>{error}</p>
      </div>
    );
  }

  const alertBg = { critical: 'rgba(239,68,68,0.08)', warning: 'rgba(143,163,184,0.08)', good: 'rgba(16,185,129,0.08)', info: 'rgba(95,168,255,0.08)' };
  const alertBorder = { critical: 'rgba(239,68,68,0.3)', warning: 'rgba(143,163,184,0.30)', good: 'rgba(16,185,129,0.3)', info: 'rgba(95,168,255,0.30)' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="page-header">
        <h1>Production Dashboard</h1>
        <p>Real-time overview of steel manufacturing delay patterns across all production stages</p>
      </div>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {anomalies.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: '12px 18px',
                background: alertBg[a.type] || alertBg.info,
                border: `1px solid ${alertBorder[a.type] || alertBorder.info}`,
                borderRadius: '12px',
                display: 'flex', alignItems: 'flex-start', gap: '12px',
              }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{a.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '2px' }}>{a.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div className="metrics-grid">
        <MetricCard label="Total Delay Records" value={overview.total_records?.toLocaleString()} sub="Past 6 months" color="blue" />
        <MetricCard label="Avg Delay" value={`${overview.avg_delay_minutes} min`} sub="Per incident" color="purple" />
        <MetricCard label="Biggest Bottleneck" value={overview.worst_stage} sub={`${overview.worst_stage_delay_minutes?.toLocaleString()} min total`} color="red" />
        <MetricCard label="Top Delay Category" value={overview.worst_category} sub={`${overview.worst_category_delay_minutes?.toLocaleString()} min total`} color="amber" />
        <MetricCard label="Controllable" value={`${overview.controllable_pct}%`} sub="Equipment + Quality holds" color="cyan" />
        <MetricCard label="Worst Shift" value={`Shift ${overview.worst_shift}`} sub={`${overview.worst_shift_delay_minutes?.toLocaleString()} min total`} color="green" />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>📊 Average Delay by Production Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis dataKey="stage" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--glass-border)' }} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--glass-border)' }} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} cursor={{ fill: 'var(--glass-bg-hover)' }} />
              <Bar dataKey="avg_delay" fill="url(#steelGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="steelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5fa8ff" />
                  <stop offset="100%" stopColor="#8fa3b8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>🎯 Delay Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                dataKey="total_delay"
                nameKey="category"
                stroke="none"
                label={({ category, percentage }) => `${percentage}%`}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} />
              <Legend
                wrapperStyle={{ fontSize: '0.78rem', color: '#9ca3af', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
