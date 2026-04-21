// ============================================================
// Privix — Component: Heatmap (Stylized World Map)
// ============================================================

import { motion } from 'framer-motion';

export default function Heatmap() {
  // Stylized SVG world map (simplified)
  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 800 400" className="w-full h-auto opacity-30 fill-white/10 stroke-white/5">
        <path d="M150,150 Q200,100 250,150 T350,150 M450,200 Q500,150 550,200 T650,200 M200,300 Q250,250 300,300 T400,300" strokeWidth="1" fill="none" />
        {/* Mock continents */}
        <rect x="100" y="80" width="120" height="80" rx="40" />
        <rect x="250" y="60" width="180" height="100" rx="50" />
        <rect x="500" y="100" width="200" height="120" rx="60" />
        <rect x="200" y="240" width="150" height="90" rx="45" />
        <rect x="550" y="260" width="100" height="80" rx="40" />
      </svg>
      
      {/* Animated Hotspots */}
      <Hotspot x="20%" y="30%" color="var(--accent-danger)" delay={0} />
      <Hotspot x="45%" y="25%" color="var(--accent-primary)" delay={1.2} />
      <Hotspot x="70%" y="40%" color="var(--accent-warning)" delay={0.5} />
      <Hotspot x="35%" y="70%" color="var(--accent-danger)" delay={2.1} />
      <Hotspot x="65%" y="65%" color="var(--accent-primary)" delay={1.7} />

      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-accent-danger" /> Node Intrusion Detect
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-accent-primary" /> Active Data Leak
        </div>
      </div>
    </div>
  );
}

function Hotspot({ x, y, color, delay }) {
  return (
    <motion.div 
      className="absolute w-3 h-3 rounded-full cursor-help"
      style={{ left: x, top: y, backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
      initial={{ scale: 0.8, opacity: 0.5 }}
      animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 3, delay }}
    >
      <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: color }} />
    </motion.div>
  );
}
