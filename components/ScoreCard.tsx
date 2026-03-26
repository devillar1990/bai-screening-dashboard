interface ScoreCardProps {
  label: string;
  score: number;
  maxScore: number;
  level: string;
  description?: string;
}

function getLevelColor(level: string) {
  switch (level) {
    case 'High': return 'text-pursue';
    case 'Medium': return 'text-monitor';
    case 'Low': return 'text-avoid';
    default: return 'text-white/50';
  }
}

function getBarColor(label: string, level: string) {
  if (label.includes('Disruption')) {
    switch (level) {
      case 'High': return 'bg-avoid';
      case 'Medium': return 'bg-monitor';
      case 'Low': return 'bg-pursue';
      default: return 'bg-white/20';
    }
  }
  switch (level) {
    case 'High': return 'bg-pursue';
    case 'Medium': return 'bg-monitor';
    case 'Low': return 'bg-avoid';
    default: return 'bg-white/20';
  }
}

export default function ScoreCard({ label, score, maxScore, level, description }: ScoreCardProps) {
  const pct = (score / maxScore) * 100;

  return (
    <div className="bg-navy-100 rounded-xl border border-white/10 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide">{label}</h3>
        <span className={`text-sm font-bold ${getLevelColor(label.includes('Disruption') ? (level === 'High' ? 'Low' : level === 'Low' ? 'High' : 'Medium') : level)}`}>
          {level}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-lg text-white/30">/ {maxScore}</span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full score-bar ${getBarColor(label, level)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {description && (
        <p className="text-xs text-white/40 mt-2">{description}</p>
      )}
    </div>
  );
}
