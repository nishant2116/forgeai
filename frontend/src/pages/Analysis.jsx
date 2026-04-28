import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';
import {
  getDelaysByStage, getDelaysByCategory, getDelaysByShift,
  getBottleneck, getControllableVsExternal, getMonthlyTrend,
} from '../api/client';

const COLORS = ['#5fa8ff', '#8fa3b8', '#2f6fed', '#10b981', '#0ea5e9', '#9fb0c3'];
const tooltipStyle = {
  backgroundColor: 'var(--bg-base)',
  border: '1px solid var(--glass-border)',
  borderRadius: '8px',
  fontSize: '0.8rem',
  color: 'var(--text-primary)',
  boxShadow: 'var(--shadow-float)',
};

export default function Analysis() {
  const [tab, setTab] = useState('stage');
  const [stageData, setStageData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [shiftData, setShiftData] = useState(null);
  const [bottleneck, setBottleneck] = useState(null);
  const [controlData, setControlData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [st, cat, sh, bn, ctrl, trend] = await Promise.all([
          getDelaysByStage(),
          getDelaysByCategory(),
          getDelaysByShift(),
          getBottleneck(),
          getControllableVsExternal(),
          getMonthlyTrend(),
        ]);
        setStageData(st.data);
        setCategoryData(cat.data);
        setShiftData(sh.data);
        setBottleneck(bn.data);
        setControlData(ctrl.data);
        setTrendData(trend.data);
      } catch (err) {
        console.error(err);
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
        <span>Loading analysis data...</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="page-header">
        <h1>Delay Analysis</h1>
        <p>Comprehensive breakdown of production delays across stages, categories, and shifts</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'stage', label: 'By Stage' },
          { key: 'category', label: 'By Category' },
          { key: 'shift', label: 'By Shift' },
          { key: 'bottleneck', label: 'Bottleneck' },
          { key: 'control', label: 'Controllable vs External' },
          { key: 'trend', label: 'Monthly Trend' },
        ].map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* By Stage */}
      {tab === 'stage' && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>📊 Average Delay by Production Stage (minutes)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="stage" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--glass-border)' }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--glass-border)' }} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} cursor={{ fill: 'var(--glass-bg-hover)' }} />
                <Bar dataKey="avg_delay" name="Avg Delay" fill="url(#grad1)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5fa8ff" /><stop offset="100%" stopColor="#8fa3b8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card">
            <h3>📋 Stage Details</h3>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Stage</th><th>Avg Delay</th><th>Total Delay</th><th>Count</th><th>Max Delay</th></tr>
                </thead>
                <tbody>
                  {stageData.map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.stage}</td>
                      <td>{row.avg_delay} min</td>
                      <td>{row.total_delay.toLocaleString()} min</td>
                      <td>{row.count}</td>
                      <td>{row.max_delay} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* By Category */}
      {tab === 'category' && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>🎯 Total Delay by Category</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="45%" innerRadius={50} outerRadius={85}
                  dataKey="total_delay" nameKey="category" stroke="none"
                  label={({ percentage }) => `${percentage}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} cursor={{ fill: 'var(--glass-bg-hover)' }} />
                <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card">
            <h3>📋 Category Breakdown</h3>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Category</th><th>Total Delay</th><th>Avg Delay</th><th>Count</th><th>Share %</th></tr>
                </thead>
                <tbody>
                  {categoryData.map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: COLORS[i] }}>{row.category}</td>
                      <td>{row.total_delay.toLocaleString()} min</td>
                      <td>{row.avg_delay} min</td>
                      <td>{row.count}</td>
                      <td>{row.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* By Shift */}
      {tab === 'shift' && shiftData && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>🔄 Delay Distribution by Shift</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={shiftData.overall}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="shift" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--glass-border)' }} tickFormatter={(v) => `Shift ${v}`} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--glass-border)' }} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} cursor={{ fill: 'var(--glass-bg-hover)' }} />
                <Bar dataKey="total_delay" name="Total Delay" fill="url(#grad2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="avg_delay" name="Avg Delay" fill="url(#grad3)" radius={[6, 6, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
                <defs>
                  <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2f6fed" /><stop offset="100%" stopColor="#8fa3b8" />
                  </linearGradient>
                  <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5fa8ff" /><stop offset="100%" stopColor="#2f6fed" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card">
            <h3>📋 Shift Details</h3>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Shift</th><th>Total Delay</th><th>Avg Delay</th><th>Incidents</th></tr>
                </thead>
                <tbody>
                  {shiftData.overall.map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Shift {row.shift}</td>
                      <td>{row.total_delay.toLocaleString()} min</td>
                      <td>{row.avg_delay} min</td>
                      <td>{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bottleneck */}
      {tab === 'bottleneck' && bottleneck && (
        <div>
          <div style={{
            padding: '20px 24px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px',
            marginBottom: '20px',
          }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-red)', marginBottom: 6 }}>
              Primary Bottleneck Identified
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {bottleneck.bottleneck_stage}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              {bottleneck.total_delay.toLocaleString()} min total delay • {bottleneck.incident_count} incidents • {bottleneck.avg_delay} min avg
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>🏭 Total Delay by Stage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bottleneck.all_stages}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="stage" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--glass-border)' }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--glass-border)' }} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} cursor={{ fill: 'var(--glass-bg-hover)' }} />
                  <Bar dataKey="total_delay" name="Total Delay" radius={[6, 6, 0, 0]}>
                    {bottleneck.all_stages.map((entry, i) => (
                      <Cell key={i} fill={entry.stage === bottleneck.bottleneck_stage ? '#ef4444' : '#5fa8ff'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card">
              <h3>🔍 Bottleneck – Category Breakdown</h3>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Category</th><th>Total Delay</th><th>Avg Delay</th><th>Count</th></tr>
                  </thead>
                  <tbody>
                    {bottleneck.category_breakdown.map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: COLORS[i] }}>{row.category}</td>
                        <td>{row.total_delay.toLocaleString()} min</td>
                        <td>{row.avg_delay} min</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controllable vs External */}
      {tab === 'control' && controlData && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>⚙️ Controllable vs External Delays</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={controlData.breakdown} cx="50%" cy="45%" innerRadius={50} outerRadius={85}
                  dataKey="total_delay" nameKey="type" stroke="none"
                  label={({ percentage }) => `${percentage}%`}>
                  {controlData.breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} />
                <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card">
            <h3>📋 Control Type Details</h3>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Type</th><th>Total Delay</th><th>Incidents</th><th>Share %</th></tr>
                </thead>
                <tbody>
                  {controlData.breakdown.map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: COLORS[i] }}>{row.type}</td>
                      <td>{row.total_delay.toLocaleString()} min</td>
                      <td>{row.count}</td>
                      <td>{row.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trend */}
      {tab === 'trend' && (
        <div className="chart-card">
          <h3>📈 Monthly Delay Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--glass-border)' }} />
                <YAxis yAxisId="left" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--glass-border)' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--glass-border)' }} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} />
                <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
                <Line yAxisId="left" type="monotone" dataKey="total_delay" name="Total Delay (min)"
                  stroke="#5fa8ff" strokeWidth={3} dot={{ r: 4, fill: '#5fa8ff', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line yAxisId="right" type="monotone" dataKey="count" name="Incident Count"
                  stroke="#8fa3b8" strokeWidth={3} dot={{ r: 4, fill: '#8fa3b8', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>No trend data available</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
