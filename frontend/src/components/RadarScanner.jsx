// ============================================================
// Privix — Component: RadarScanner
// ============================================================

import { motion } from 'framer-motion';

export default function RadarScanner({ progress }) {
  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
      {/* Outer Glow */}
      <div className="absolute inset-0 rounded-full ruby-glow opacity-20" />
      
      {/* Pulse Rings */}
      <div className="radar-signal" style={{ animationDelay: '0s' }} />
      <div className="radar-signal" style={{ animationDelay: '0.6s' }} />
      <div className="radar-signal" style={{ animationDelay: '1.2s' }} />
      
      {/* Radar Background */}
      <div className="absolute inset-0 rounded-full border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        {/* Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
          {[...Array(36)].map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/5" />
          ))}
        </div>
        
        {/* Circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/3 h-1/3 border border-white/5 rounded-full" />
          <div className="w-2/3 h-2/3 border border-white/5 rounded-full" />
        </div>
        
        {/* Sweeper */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-full h-full origin-top-left"
          style={{
            background: 'linear-gradient(45deg, rgba(255,0,60,0.3) 0%, transparent 50%)',
            borderTop: '1px solid rgba(255,0,60,0.6)',
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        />
      </div>
      
      {/* Progress Center */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.span 
          className="text-4xl font-black font-mono text-white"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {Math.round(progress)}%
        </motion.span>
        <span className="text-[10px] font-bold text-accent-primary uppercase tracking-[0.3em] mt-1">
          Scouring Web
        </span>
      </div>
    </div>
  );
}
