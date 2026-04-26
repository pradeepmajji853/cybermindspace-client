export default function RiskBadge({ score }) {
  if (score === undefined || score === null) return null;

  let level, color, bg, icon;

  if (score <= 30) {
    level = 'Low';
    color = 'text-emerald-600 dark:text-emerald-400';
    bg = 'bg-emerald-100 dark:bg-emerald-900/30';
    icon = '🟢';
  } else if (score <= 60) {
    level = 'Medium';
    color = 'text-amber-600 dark:text-amber-400';
    bg = 'bg-amber-100 dark:bg-amber-900/30';
    icon = '🟡';
  } else {
    level = 'High';
    color = 'text-red-600 dark:text-red-400';
    bg = 'bg-red-100 dark:bg-red-900/30';
    icon = '🔴';
  }

  return (
    <div className={`badge ${bg} ${color}`}>
      <span>{icon}</span>
      <span className="font-mono text-xs">{score}</span>
      <span className="font-semibold">{level} Risk</span>
    </div>
  );
}
