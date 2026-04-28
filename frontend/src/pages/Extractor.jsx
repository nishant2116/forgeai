import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractDocument } from '../api/client';

const SAMPLE_WBS = `WBS DOCUMENT 1: Blast Furnace #2 Annual Reline Project

Subject: BF#2 Annual Shutdown and Reline - Work Package Breakdown
Date: February 2026
Project Manager: Mr. Rajesh Kumar

The annual shutdown for Blast Furnace #2 will commence on 15th March 2026 at 0600hrs. Total shutdown duration estimated at 18-21 days.

Pre-shutdown activities must be completed by 14th March. Mr. Sharma's civil team will handle final production reconciliation and raw material clearance (2 days prior to shutdown). Safety team inspection and permit preparation to be done by Ms. Patel (1 day, can run parallel to civil activities).

Shutdown Day 1-4: Refractory demolition and removal. Civil team under Mr. Sharma responsible. Estimated 3-4 days depending on lining condition. CRITICAL: Cooling must be complete before demolition starts - minimum 48 hours cooling time required.

Concurrent with demolition: Electrical team led by Mr. Anil Patel will disconnect all power systems, inspect switchgear and motors (2-3 days). Mechanical team to remove and inspect tuyeres, blow pipe assemblies (3 days, can start Day 2 after initial cooling).

Days 5-16: New refractory installation by M/s Vesuvius India Limited. Contract team of 25-30 workers. Estimated 10-12 days including curing time. Quality inspection at 50% completion (Day 10) and final inspection (Day 16) by Mr. Deshmukh's quality team (half day each inspection).

Days 14-17: Whilst refractory is curing, mechanical team must complete tuyere replacement and blow pipe refurbishment (5-6 days total, started earlier). Instrumentation team led by Ms. Reddy to recalibrate all sensors and control systems (3 days, starting Day 15).

Day 17-18: Pre-commissioning checks. Electrical reconnection and testing by Mr. A. Patel's team (1.5 days). Safety systems verification by Ms. Patel (1 day, parallel to electrical). Final walkdown inspection by all department heads and plant manager (half day).

Day 19-21: Hot commissioning sequence. Gradual heat-up under supervision of Chief Operations Officer Mr. Venkatesh. First charging of burden and initial hot blast trial (2-3 days depending on heating curve). Production team takes over post successful commissioning trial.`;

const SAMPLE_SOP = `SOP DOCUMENT 1: Hot Metal Sampling and Temperature Measurement

SOP Number: BF-QC-003
Title: Blast Furnace Hot Metal Sampling Procedure
Revision: 4.2
Effective Date: January 2026

SAFETY REQUIREMENTS:
All personnel involved in hot metal sampling must wear complete PPE including aluminised suit, face shield, safety helmet, safety shoes, and heat-resistant gloves at all times. This is safety critical and non-negotiable.

PROCEDURE STEPS:

Step 1: Pre-sampling preparation by Sample Operator
Sample operator to verify that sampling equipment is ready - sample spoon, sample moulds, temperature probe, and PPE are in good condition.

Step 2: Communication and coordination by Shift Supervisor
Shift supervisor to coordinate with furnace tapper and confirm sampling point and timing. Notify quality laboratory.

Step 3: First sample collection at 5-minute mark by Sample Operator
Wait until hot metal flow is steady. Using long-handled sampling spoon, collect hot metal sample from runner stream. SAFETY CRITICAL: Maintain safe distance, avoid any water contact with hot metal.

Step 4: Temperature measurement by Sample Operator
Immediately after taking sample, immerse calibrated immersion-type temperature probe into hot metal stream. Hold probe in stream for 10 seconds minimum.

Step 5: Sample identification and logging by Sample Operator
Mark each sample mould with furnace number, tap number, date, time, and temperature.

Step 6: Second sample collection at 20-minute mark by Sample Operator
Repeat Steps 3-5 to collect mid-tap sample.

Step 7: Sample cooling and transfer by Sample Operator
Allow samples to cool in moulds for minimum 30 minutes. Transfer samples to laboratory sample trolley.

Step 8: Laboratory notification and documentation by Shift Supervisor
Shift supervisor to inform quality laboratory supervisor of sample availability.`;

export default function Extractor() {
  const [docType, setDocType] = useState('wbs');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExtract = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await extractDocument(text, docType);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setText(docType === 'wbs' ? SAMPLE_WBS : SAMPLE_SOP);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="page-header">
        <h1>AI Document Extractor</h1>
        <p>Extract structured data from WBS and SOP documents using LangChain ReAct Agent + Groq</p>
      </div>

      <div className="extractor-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Input Panel */}
        <div className="glass-card">
          <h3>📄 Input Document</h3>

          <div className="form-group">
            <label>Document Type</label>
            <div className="tabs">
              <button className={`tab-btn ${docType === 'wbs' ? 'active' : ''}`} onClick={() => setDocType('wbs')}>
                WBS
              </button>
              <button className={`tab-btn ${docType === 'sop' ? 'active' : ''}`} onClick={() => setDocType('sop')}>
                SOP
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Document Text</label>
            <textarea
              className="form-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Paste your ${docType.toUpperCase()} document text here...`}
              style={{ minHeight: '350px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={handleExtract} disabled={loading || !text.trim()}>
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16 }} /> Extracting...</>
              ) : (
                '🤖 Extract with AI'
              )}
            </button>
            <button className="btn btn-secondary" onClick={loadSample}>
              Load Sample
            </button>
            <button className="btn btn-secondary" onClick={() => { setText(''); setResult(null); setError(null); }}>
              Clear
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="glass-card">
          <h3>📋 Extracted Data</h3>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '8px',
              color: 'var(--accent-red)',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {loading && (
            <div className="loading-overlay" style={{ padding: '80px 20px' }}>
              <div className="spinner" />
              <span>AI Agent is analyzing your document...</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                This may take 15-30 seconds
              </span>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No data extracted yet</h3>
              <p>Paste a WBS or SOP document on the left and click "Extract with AI" to see structured results.</p>
            </div>
          )}

          <AnimatePresence>
            {result && result.data && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Document Info */}
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--accent-blue-dim)',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.85rem',
                }}>
                  <strong style={{ color: 'var(--accent-blue-core)' }}>
                    {result.data.document_title || 'Document'}
                  </strong>
                  {result.data.project_manager && (
                    <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                      PM: {result.data.project_manager} • Duration: {result.data.total_duration || '—'}
                    </div>
                  )}
                  {result.data.sop_number && (
                    <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                      SOP#: {result.data.sop_number}
                    </div>
                  )}
                </div>

                {/* WBS Table */}
                {docType === 'wbs' && result.data.tasks && (
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Task Name</th>
                          <th>Duration</th>
                          <th>Responsible</th>
                          <th>Dependencies</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.tasks.map((task, i) => (
                          <tr key={i}>
                            <td style={{ color: 'var(--accent-blue-core)', fontWeight: 600 }}>{i + 1}</td>
                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{task.task_name}</td>
                            <td>{task.duration}</td>
                            <td>{task.responsible_party}</td>
                            <td style={{ maxWidth: 200, fontSize: '0.8rem' }}>{task.dependencies}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SOP Table */}
                {docType === 'sop' && result.data.steps && (
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Step</th>
                          <th>Action</th>
                          <th>Role</th>
                          <th>Safety</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.steps.map((step, i) => (
                          <tr key={i}>
                            <td style={{ color: 'var(--accent-blue-core)', fontWeight: 600 }}>{step.step_number}</td>
                            <td style={{ color: 'var(--text-primary)', maxWidth: 300, fontSize: '0.82rem' }}>{step.action}</td>
                            <td>{step.responsible_role}</td>
                            <td>
                              <span className={`badge ${step.safety_critical ? 'badge-safety' : 'badge-normal'}`}>
                                {step.safety_critical ? (
                                  <><span style={{ fontSize: '1.1em', marginTop: '-2px' }}>⚠</span><span>CRITICAL</span></>
                                ) : (
                                  <><span style={{ fontSize: '1.1em', marginTop: '-2px' }}>✓</span><span>STANDARD</span></>
                                )}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Raw output toggle */}
                {result.raw_agent_output && (
                  <details style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      View ReAct Agent Output
                    </summary>
                    <pre style={{
                      marginTop: 8,
                      padding: 12,
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: 8,
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5,
                      maxHeight: 250,
                      overflow: 'auto',
                    }}>
                      {result.raw_agent_output}
                    </pre>
                  </details>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
