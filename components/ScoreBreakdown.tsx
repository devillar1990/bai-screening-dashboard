import { ScoringData } from '@/lib/types';

const tierColors: Record<string, string> = {
  'Cost Optimization': 'bg-sky-500/20 text-sky-300',
  'Revenue Optimization': 'bg-purple-400/20 text-purple-300',
  'Revenue Transformation': 'bg-yellow-400/20 text-yellow-300',
};

export function VCBreakdown({ data }: { data: ScoringData }) {
  const cats = data.valueCreation?.categories;
  if (!cats) return null;

  return (
    <div className="bg-navy-100 rounded-xl border border-white/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="font-bold text-white">Value Creation Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-4 py-2.5 text-left font-semibold text-white/50 text-xs uppercase">Category</th>
              <th className="px-4 py-2.5 text-left font-semibold text-white/50 text-xs uppercase">Tier</th>
              <th className="px-4 py-2.5 text-center font-semibold text-white/50 text-xs uppercase">AI Score</th>
              <th className="px-4 py-2.5 text-center font-semibold text-white/50 text-xs uppercase">Non-AI</th>
              <th className="px-4 py-2.5 text-left font-semibold text-white/50 text-xs uppercase">Rationale</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(cats).map(([name, cat]) => (
              <tr key={name} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium whitespace-nowrap text-white">{name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${tierColors[cat.tier] || 'bg-white/10 text-white/60'}`}>
                    {cat.tier}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-mono font-semibold text-white">{cat.score}</td>
                <td className="px-4 py-3 text-center font-mono text-white/40">{cat.nonAiScore}</td>
                <td className="px-4 py-3 text-white/50 text-xs max-w-md">{cat.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DRBreakdown({ data }: { data: ScoringData }) {
  const dims = data.disruptionRisk?.dimensions;
  if (!dims) return null;

  return (
    <div className="bg-navy-100 rounded-xl border border-white/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="font-bold text-white">Disruption Risk Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-4 py-2.5 text-left font-semibold text-white/50 text-xs uppercase">Dimension</th>
              <th className="px-4 py-2.5 text-center font-semibold text-white/50 text-xs uppercase">Score</th>
              <th className="px-4 py-2.5 text-left font-semibold text-white/50 text-xs uppercase">Rationale</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(dims).map(([name, dim]) => (
              <tr key={name} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium whitespace-nowrap text-white">{name}</td>
                <td className="px-4 py-3 text-center font-mono font-semibold text-white">{dim.score}</td>
                <td className="px-4 py-3 text-white/50 text-xs max-w-lg">{dim.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PEBreakdown({ data }: { data: ScoringData }) {
  const pe = data.peSuitability;
  if (!pe || !Array.isArray(pe)) return null;

  return (
    <div className="bg-navy-100 rounded-xl border border-white/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="font-bold text-white">PE Suitability Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-4 py-2.5 text-left font-semibold text-white/50 text-xs uppercase">Criterion</th>
              <th className="px-4 py-2.5 text-center font-semibold text-white/50 text-xs uppercase">Score</th>
              <th className="px-4 py-2.5 text-left font-semibold text-white/50 text-xs uppercase">Metric</th>
              <th className="px-4 py-2.5 text-left font-semibold text-white/50 text-xs uppercase">Rationale</th>
            </tr>
          </thead>
          <tbody>
            {pe.map((item, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium whitespace-nowrap text-white">{item.category}</td>
                <td className="px-4 py-3 text-center font-mono font-semibold text-white">{item.score}<span className="text-white/30">/2</span></td>
                <td className="px-4 py-3 text-white/50 text-xs max-w-xs">{item.metric}</td>
                <td className="px-4 py-3 text-white/50 text-xs max-w-sm">{item.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
