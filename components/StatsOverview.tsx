import { getCompanyStats } from '@/lib/companies';
import { Target, Eye, XCircle, BarChart3 } from 'lucide-react';

export default function StatsOverview() {
  const stats = getCompanyStats();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-navy-100 rounded-xl border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-4 h-4 text-accent-blue" />
          <span className="text-xs font-medium text-white/40 uppercase">Total Screened</span>
        </div>
        <span className="text-2xl font-bold text-white">{stats.total}</span>
      </div>
      <div className="bg-navy-100 rounded-xl border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-pursue" />
          <span className="text-xs font-medium text-white/40 uppercase">Pursue</span>
        </div>
        <span className="text-2xl font-bold text-pursue">{stats.pursue}</span>
      </div>
      <div className="bg-navy-100 rounded-xl border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Eye className="w-4 h-4 text-monitor" />
          <span className="text-xs font-medium text-white/40 uppercase">Monitor</span>
        </div>
        <span className="text-2xl font-bold text-monitor">{stats.monitor}</span>
      </div>
      <div className="bg-navy-100 rounded-xl border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-1">
          <XCircle className="w-4 h-4 text-avoid" />
          <span className="text-xs font-medium text-white/40 uppercase">Avoid</span>
        </div>
        <span className="text-2xl font-bold text-avoid">{stats.avoid}</span>
      </div>
    </div>
  );
}
