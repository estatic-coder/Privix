import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend, Tooltip
} from 'recharts';

export function DashboardRiskChart({ stats }) {
  // Map stats into a format for radar chart
  const data = [
    { subject: 'Passwords', A: stats.criticalAlerts || 0, fullMark: 10 },
    { subject: 'Emails', A: stats.activeAlerts || 0, fullMark: 10 },
    { subject: 'Phones', A: Math.round((stats.activeAlerts || 0) / 2), fullMark: 10 },
    { subject: 'Addresses', A: Math.round((stats.totalExposures || 0) / 3), fullMark: 10 },
    { subject: 'Financial', A: 0, fullMark: 10 },
    { subject: 'DarkWeb', A: stats.criticalAlerts || 0, fullMark: 10 },
  ];

  return (
    <div style={{ width: '100%', height: 300, padding: 20 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,0,60,0.2)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#e4e4e7', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
          <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 2']} tick={false} axisLine={false} />
          <Radar name="Exposure" dataKey="A" stroke="#ff003c" fill="#ff003c" fillOpacity={0.4} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(15,5,5,0.9)', border: '1px solid rgba(255,0,60,0.3)', borderRadius: '8px' }}
            itemStyle={{ color: '#ff003c', fontFamily: 'var(--font-mono)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskGauge({ riskScore }) {
  const score = riskScore || 0;
  let color = '#50fa7b'; // success
  if (score >= 40) color = '#ffb86c'; // warning
  if (score >= 70) color = '#ff5555'; // danger
  if (score >= 90) color = '#ff003c'; // critical

  const data = [
    { name: 'Safe', value: 100, fill: 'rgba(255, 255, 255, 0.05)' },
    { name: 'Risk', value: score, fill: color }
  ];

  return (
    <div style={{ width: '100%', height: 260 }}>
      {/* We overlay the score text over the gauge */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', margin: 0, color: color, fontWeight: 800 }}>{score}</h2>
        <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Risk Score</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" cy="50%" 
          innerRadius="70%" outerRadius="100%" 
          barSize={20} 
          data={data} 
          startAngle={180} 
          endAngle={0}
        >
          <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
