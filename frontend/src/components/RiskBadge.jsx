// ============================================================
// Anonymous — Component: RiskBadge
// ============================================================

export default function RiskBadge({ risk }) {
  const labels = {
    critical: '🔴 Critical',
    high: '🟠 High',
    medium: '🟡 Medium',
    low: '🟢 Low',
  };

  return (
    <span className={`risk-badge ${risk}`}>
      {labels[risk] || risk}
    </span>
  );
}
