import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min for LLM calls
  headers: { 'Content-Type': 'application/json' },
});

// ── Analysis Endpoints ─────────────────────────────────────────────────

export const getOverview = () => api.get('/api/analysis/overview');
export const getDelaysByStage = () => api.get('/api/analysis/delays-by-stage');
export const getDelaysByCategory = () => api.get('/api/analysis/delays-by-category');
export const getDelaysByShift = () => api.get('/api/analysis/delays-by-shift');
export const getBottleneck = () => api.get('/api/analysis/bottleneck');
export const getControllableVsExternal = () => api.get('/api/analysis/controllable-vs-external');
export const getMonthlyTrend = () => api.get('/api/analysis/monthly-trend');

// ── AI Extraction ──────────────────────────────────────────────────────

export const extractDocument = (documentText, documentType) =>
  api.post('/api/extract', {
    document_text: documentText,
    document_type: documentType,
  });

// ── Forecasting ────────────────────────────────────────────────────────

export const getForecast = (params) =>
  api.post('/api/forecast', params);

// ── Anomaly Detection ──────────────────────────────────────────────────

export const getAnomalies = () => api.get('/api/analysis/anomalies');

// ── AI Chat ────────────────────────────────────────────────────────────

export const chatWithData = (question) =>
  api.post('/api/chat', { question });

export default api;
