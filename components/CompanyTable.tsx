'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ScoringData, Classification } from '@/lib/types';
import MatrixBadge from './MatrixBadge';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

type SortKey = 'companyName' | 'sector' | 'vcTotalScore' | 'drTotalScore' | 'peTotalScore' | 'matrixClassification';
type SortDir = 'asc' | 'desc';

export default function CompanyTable({ companies }: { companies: ScoringData[] }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('companyName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterClassification, setFilterClassification] = useState<Classification | 'All'>('All');
  const [filterSector, setFilterSector] = useState<string>('All');

  const sectors = useMemo(() => {
    const s = new Set(companies.map(c => c.sector?.split(' / ')[0] || 'Unknown'));
    return ['All', ...Array.from(s).sort()];
  }, [companies]);

  const filtered = useMemo(() => {
    let result = companies;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.companyName?.toLowerCase().includes(q) ||
        c.sector?.toLowerCase().includes(q)
      );
    }

    if (filterClassification !== 'All') {
      result = result.filter(c => c.matrixClassification === filterClassification);
    }

    if (filterSector !== 'All') {
      result = result.filter(c => c.sector?.startsWith(filterSector));
    }

    result.sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = typeof aVal === 'number' ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [companies, search, sortKey, sortDir, filterClassification, filterSector]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'companyName' ? 'asc' : 'desc');
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown className="w-3.5 h-3.5 text-white/20" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-accent-blue" />
      : <ChevronDown className="w-3.5 h-3.5 text-accent-blue" />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-navy-100 border border-white/10 text-white placeholder-white/30 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none text-sm"
          />
        </div>
        <select
          value={filterClassification}
          onChange={e => setFilterClassification(e.target.value as Classification | 'All')}
          className="px-3 py-2.5 rounded-lg border border-white/10 text-sm bg-navy-100 text-white focus:border-accent-blue outline-none"
        >
          <option value="All">All Classifications</option>
          <option value="Pursue">Pursue</option>
          <option value="Monitor">Monitor</option>
          <option value="Avoid">Avoid</option>
        </select>
        <select
          value={filterSector}
          onChange={e => setFilterSector(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-white/10 text-sm bg-navy-100 text-white focus:border-accent-blue outline-none max-w-[200px]"
        >
          {sectors.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="text-sm text-white/30">
        Showing {filtered.length} of {companies.length} companies
      </div>

      {/* Table */}
      <div className="bg-navy-100 rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {([
                  ['companyName', 'Company'],
                  ['sector', 'Sector'],
                  ['vcTotalScore', 'VC'],
                  ['drTotalScore', 'DR'],
                  ['peTotalScore', 'PE'],
                  ['matrixClassification', 'Classification'],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className="px-4 py-3 text-left font-semibold text-white/50 uppercase text-xs tracking-wide cursor-pointer hover:text-white select-none"
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      <SortIcon col={key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(company => (
                <tr
                  key={company.folder}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/company/${company.folder}`}
                      className="font-semibold text-white hover:text-accent-blue transition-colors"
                    >
                      {company.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/50 max-w-[200px] truncate">
                    {company.sector}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-white">
                    {company.vcTotalScore}<span className="text-white/30">/55</span>
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-white">
                    {company.drTotalScore}<span className="text-white/30">/20</span>
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-white">
                    {company.peTotalScore}<span className="text-white/30">/20</span>
                  </td>
                  <td className="px-4 py-3">
                    <MatrixBadge classification={company.matrixClassification} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
