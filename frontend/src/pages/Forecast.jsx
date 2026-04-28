import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { getForecast } from '../api/client';

const COLORS = ['#5fa8ff', '#8fa3b8', '#2f6fed', '#10b981', '#0ea5e9'];
const tooltipStyle = {
  backgroundColor: 'var(--bg-base)',
  border: '1px solid var(--glass-border)',
  borderRadius: '8px',
  fontSize: '0.8rem',
  color: 'var(--text-primary)',
  boxShadow: 'var(--shadow-float)',
};

export default function Forecast() {
  const [form, setForm] = useState({
    total_tonnes: 800,
    tonnes_per_heat: 80,
    grade: 'Grade A',
    confidence_level: 0.9,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await getForecast(form);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="page-header">
        <h1>Delivery Forecasting</h1>
        <p>Estimate production delays and calculate optimal buffer times for customer orders</p>
      </div>

      {/* Horizontal Order Parameters */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h3>📦 Order Parameters</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 160px' }}>
            <label>Total Tonnes</label>
            <input className="form-input" type="number" value={form.total_tonnes}
              onChange={(e) => setForm({ ...form, total_tonnes: +e.target.value })} min="1" />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 160px' }}>
            <label>Tonnes per Heat</label>
            <input className="form-input" type="number" value={form.tonnes_per_heat}
              onChange={(e) => setForm({ ...form, tonnes_per_heat: +e.target.value })} min="1" />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 140px' }}>
            <label>Steel Grade</label>
            <select className="form-select" value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}>
              <option>Grade A</option>
              <option>Grade B</option>
              <option>Grade C</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 140px' }}>
            <label>Confidence Level</label>
            <select className="form-select" value={form.confidence_level}
              onChange={(e) => setForm({ ...form, confidence_level: +e.target.value })}>
              <option value={0.8}>80%</option>
              <option value={0.85}>85%</option>
              <option value={0.9}>90%</option>
              <option value={0.95}>95%</option>
              <option value={0.99}>99%</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', minWidth: '180px', height: '48px' }}>
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16 }} /> Calculating...</>
            ) : '📊 Run Forecast'}
          </button>
        </form>
      </div>

      {/* Results — Full Width */}
      {error && (
        <div style={{
          padding: '12px 16px', background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px',
          color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {!result && !loading && (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <h3>Configure your order</h3>
            <p>Set the order parameters above and click "Run Forecast" to see estimated production delays, recommended buffer times, and operational insights.</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Metrics */}
            <div className="metrics-grid forecast-metrics" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <MetricCard label="Required Heats" value={result.num_heats} sub={`${form.total_tonnes}t ÷ ${form.tonnes_per_heat}t`} color="blue" />
              <MetricCard label="Est. Total Delay" value={`${result.total_estimated_delay_minutes} min`} sub={`${result.estimated_delay_per_heat_minutes} min/heat`} color="purple" />
              <MetricCard label="Buffer Time" value={`${result.buffer_minutes} min`} sub={`${(result.confidence_level * 100).toFixed(0)}% confidence`} color="amber" />
              <MetricCard label="Total with Buffer" value={`${result.total_with_buffer_hours} hrs`} sub={`${result.total_with_buffer_minutes} minutes`} color="green" />
            </div>

                {/* Risk Breakdown Chart */}
                <div className="charts-grid">
                  <div className="chart-card">
                    <h3>⚠️ Delay Risk Breakdown by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={result.delay_risk_breakdown} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                        <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--glass-border)' }} />
                        <YAxis type="category" dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={130} />
                        <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} cursor={{ fill: 'var(--glass-bg-hover)' }} />
                        <Bar dataKey="estimated_delay_minutes" name="Est. Delay (min)" radius={[0, 6, 6, 0]}>
                          {result.delay_risk_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Recommendations */}
                  <div className="glass-card">
                    <h3>💡 Operational Recommendations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {result.recommendations.map((rec, i) => (
                        <div key={i} style={{
                          padding: '10px 14px',
                          background: 'var(--bg-layer-1)',
                          borderRadius: '8px',
                          borderLeft: `3px solid ${COLORS[i % COLORS.length]}`,
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                        }}>
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gantt Timeline */}
                {result.timeline && (
                  <div className="chart-card" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3>🗓️ Production Stage Timeline</h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => {
                            const rows = [['Stage', 'Base Duration (min)', 'Estimated Delay (min)', 'Start Time (min)']];
                            result.timeline.forEach(t => rows.push([t.stage, t.base_duration, t.estimated_delay, t.start_time]));
                            rows.push([]);
                            rows.push(['Metric', 'Value']);
                            rows.push(['Required Heats', result.num_heats]);
                            rows.push(['Est. Total Delay', `${result.total_estimated_delay_minutes} min`]);
                            rows.push(['Buffer Time', `${result.buffer_minutes} min`]);
                            rows.push(['Total with Buffer', `${result.total_with_buffer_hours} hrs`]);
                            rows.push([]);
                            rows.push(['Category', 'Est. Delay (min)', 'Share %']);
                            result.delay_risk_breakdown.forEach(r => rows.push([r.category, r.estimated_delay_minutes, `${r.share_of_total_pct}%`]));
                            const csv = rows.map(r => r.join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url; a.download = `forecast_report_${form.total_tonnes}t.csv`; a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          📥 Export CSV
                        </button>
                         <button
                          className="btn-secondary"
                          style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: 'rgba(95,168,255,0.1)', border: '1px solid rgba(95,168,255,0.2)', color: 'var(--accent-blue-core)', display: 'flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => {
                            const w = window.open('', '_blank');
                            w.document.write(`<html><head><title>Forecast Report - ${form.total_tonnes}t Order</title>
                              <style>body{font-family:system-ui;padding:40px;color:#1c2a3a}h1{color:#2f6fed}h2{color:#5fa8ff;margin-top:30px}
                              table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #dee2e6;padding:10px;text-align:left}
                              th{background:#2f6fed;color:#fff}.metric{display:inline-block;margin:10px 20px 10px 0;padding:16px 24px;background:#f8f9fa;border-radius:12px;min-width:180px}
                              .metric .val{font-size:1.8rem;font-weight:700;color:#2f6fed}.metric .lbl{font-size:0.85rem;color:#6c757d}
                              .rec{padding:10px 14px;margin:6px 0;background:#f0fbff;border-left:4px solid #5fa8ff;border-radius:6px}</style></head><body>
                              <h1>⚙️ ForgeAI — Delivery Forecast Report</h1>
                              <p>Order: <strong>${form.total_tonnes} tonnes</strong> | Grade: <strong>${form.grade}</strong> | Confidence: <strong>${(form.confidence_level*100).toFixed(0)}%</strong></p>
                              <div>
                                <div class="metric"><div class="lbl">Required Heats</div><div class="val">${result.num_heats}</div></div>
                                <div class="metric"><div class="lbl">Est. Total Delay</div><div class="val">${result.total_estimated_delay_minutes} min</div></div>
                                <div class="metric"><div class="lbl">Buffer Time</div><div class="val">${result.buffer_minutes} min</div></div>
                                <div class="metric"><div class="lbl">Total with Buffer</div><div class="val">${result.total_with_buffer_hours} hrs</div></div>
                              </div>
                              <h2>🗓️ Production Timeline</h2>
                              <table><thead><tr><th>Stage</th><th>Base Duration</th><th>Est. Delay</th><th>Start Time</th></tr></thead>
                              <tbody>${result.timeline.map(t => `<tr><td>${t.stage}</td><td>${t.base_duration} min</td><td>${t.estimated_delay} min</td><td>${t.start_time} min</td></tr>`).join('')}</tbody></table>
                              <h2>⚠️ Delay Risk Breakdown</h2>
                              <table><thead><tr><th>Category</th><th>Est. Delay</th><th>Share</th></tr></thead>
                              <tbody>${result.delay_risk_breakdown.map(r => `<tr><td>${r.category}</td><td>${r.estimated_delay_minutes} min</td><td>${r.share_of_total_pct}%</td></tr>`).join('')}</tbody></table>
                              <h2>💡 Recommendations</h2>
                              ${result.recommendations.map(r => `<div class="rec">${r}</div>`).join('')}
                              <h2>📌 Assumptions</h2>
                              <ul>${result.assumptions.map(a => `<li style="margin:6px 0;color:#555">${a}</li>`).join('')}</ul>
                              <hr style="margin-top:40px"><p style="color:#999;font-size:0.8rem">Generated by SteelOps AI • ${new Date().toLocaleString()}</p>
                            </body></html>`);
                            w.document.close();
                            setTimeout(() => w.print(), 300);
                          }}
                        >
                          🖨️ Export PDF
                        </button>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={result.timeline} layout="vertical" margin={{ left: 10, right: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                        <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--glass-border)' }} label={{ value: 'Duration (min)', fill: 'var(--text-secondary)', fontSize: 11, position: 'insideBottomRight', offset: -5 }} />
                        <YAxis type="category" dataKey="stage" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={110} axisLine={{ stroke: 'var(--glass-border)' }} />
                        <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} cursor={{ fill: 'var(--glass-bg-hover)' }} />
                        <Bar dataKey="base_duration" name="Base Processing" stackId="a" fill="#5fa8ff" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="estimated_delay" name="Estimated Delay" stackId="a" fill="#ef4444" radius={[0, 6, 6, 0]} />
                        <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '8px' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Assumptions */}
                <div className="glass-card" style={{ marginTop: '20px' }}>
                  <h3>📌 Forecasting Assumptions</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                    {result.assumptions.map((a, i) => (
                      <div key={i} style={{
                        padding: '8px 12px',
                        background: 'var(--bg-layer-2)',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}>
                        <span style={{ color: 'var(--accent-amber-core)', flexShrink: 0 }}>•</span>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
    </motion.div>
  );
}
