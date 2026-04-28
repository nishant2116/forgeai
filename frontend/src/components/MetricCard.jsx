import { motion } from 'framer-motion';

export default function MetricCard({ label, value, sub, color = 'blue', icon }) {
  return (
    <motion.div
      className={`metric-card ${color}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </motion.div>
  );
}
