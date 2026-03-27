'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ScoringData } from '@/lib/types';
import MatrixBadge from '@/components/MatrixBadge';
import ScoreCard from '@/components/ScoreCard';
import DownloadButtons from '@/components/DownloadButtons';
import { VCBreakdown, DRBreakdown, PEBreakdown } from '@/components/ScoreBreakdown';
import { Loader2, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp, Search, Brain, Shield, FileCheck } from 'lucide-react';

const STATUS_MESSAGES: Record<string, { label: string; icon: React.ReactNode }> = {
  pending: { label: 'Starting screening...', icon: <Loader2 className="w-5 h-5 animate-spin text-accent-blue" /> },
  researching: { label: 'Researching company via web search...', icon: <Search className="w-5 h-5 text-accent-blue animate-pulse" /> },
  scoring: { label: 'Scoring across VC, DR, and PE pillars...', icon: <Brain className="w-5 h-5 text-accent-blue animate-pulse" /> },
  validating: { label: 'Validating and calibrating scores...', icon: <Shield className="w-5 h-5 text-accent-blue animate-pulse" /> },
  complete: { label: 'Screening complete!', icon: <FileCheck className="w-5 h-5 text-pursue" /> },
  error: { label: 'Screening failed', icon: <AlertTriangle className="w-5 h-5 text-avoid" /> },
};

export default function ResultsPage() {
  const params = useParams();
  const id = params.id as string;
  const [status, setStatus] = useState('pending');
  const [companyName, setCompanyName] = useState('');
  const [result, setResult] = useState<ScoringData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/screen/${id}/status?_t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        setStatus(data.status);
        setCompanyName(data.companyName || '');

        if (data.status === 'complete') {
          setResult(data.result);
          clearInterval(poll);
        } else if (data.status === 'error') {
          setError(data.error || 'Unknown error');
          clearInterval(poll);
        }
      } catch (err) {
        console.error('[polling] Error:', err);
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [id]);

  // Progress view
  if (status !== 'complete') {
    const statusInfo = STATUS_MESSAGES[status] || STATUS_MESSAGES.pending;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-accent-blue/10 flex items-center justify-center">
          {statusInfo.icon}
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">
            {status === 'error' ? 'Screening Failed' : `Screening ${companyName}`}
          </h1>
          <p className="text-white/50">{statusInfo.label}</p>
          {error && (
            <p className="text-avoid text-sm mt-4 bg-avoid/10 rounded-lg px-4 py-3 max-w-md">
              {error}
            </p>
          )}
        </div>

        {status !== 'error' && (
          <div className="flex gap-2 mt-4">
            {['pending', 'researching', 'scoring', 'validating', 'complete'].map((step, i) => {
              const steps = ['pending', 'researching', 'scoring', 'validating', 'complete'];
              const currentIdx = steps.indexOf(status);
              const isActive = i <= currentIdx;
              return (
                <div
                  key={step}
                  className={`h-2 w-12 rounded-full transition-colors ${
                    isActive ? 'bg-accent-blue' : 'bg-white/10'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Results view
  if (!result) return null;
  const company = result;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-pursue/10 text-pursue px-3 py-1 rounded-full text-sm font-medium mb-3">
            <FileCheck className="w-4 h-4" />
            Screening Complete
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{company.companyName}</h1>
          <p className="text-white/50 mt-1">{company.sector}</p>
        </div>
        <div className="flex items-center gap-4">
          <MatrixBadge classification={company.matrixClassification} size="lg" />
          <DownloadButtons folder={company.folder} hasPptx={company.has_pptx} hasDocx={company.has_docx} />
        </div>
      </div>

      {/* Business Description */}
      <div className="bg-navy-100 rounded-xl border border-white/10 p-6">
        <p className="text-sm text-white/70 leading-relaxed">{company.businessDescription}</p>
        {company.keyMetrics && company.keyMetrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/10">
            {company.keyMetrics.map((m, i) => (
              <div key={i}>
                <p className="text-xs text-white/40 uppercase font-semibold">{m.label}</p>
                <p className="text-sm font-bold mt-0.5 text-white">{m.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreCard label="AI Value Creation" score={company.vcTotalScore} maxScore={55} level={company.vcLevel} />
        <ScoreCard label="Disruption Risk" score={company.drTotalScore} maxScore={20} level={company.drLevel} />
        <ScoreCard label="PE Suitability" score={company.peTotalScore} maxScore={20} level={company.peLevel} />
      </div>

      <VCBreakdown data={company} />

      {company.topOpportunities && company.topOpportunities.length > 0 && (
        <div className="bg-navy-100 rounded-xl border border-white/10 p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Top AI Opportunities
          </h3>
          <div className="space-y-3">
            {company.topOpportunities.map((opp, i) => (
              <div key={i} className="bg-accent-blue/10 rounded-lg p-4">
                <p className="font-semibold text-sm text-white">{opp.title}</p>
                <p className="text-xs text-white/50 mt-1">{opp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <DRBreakdown data={company} />
      <PEBreakdown data={company} />

      {company.investmentSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-navy-100 rounded-xl border border-white/10 p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-white">
              <CheckCircle2 className="w-5 h-5 text-pursue" />
              Investment Highlights
            </h3>
            <ul className="space-y-2">
              {company.investmentSummary.highlights?.map((h, i) => (
                <li key={i} className="text-xs text-white/50 pl-3 border-l-2 border-pursue/30">{h}</li>
              ))}
            </ul>
          </div>
          <div className="bg-navy-100 rounded-xl border border-white/10 p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-avoid" />
              Key Risks
            </h3>
            <ul className="space-y-2">
              {company.investmentSummary.risks?.map((r, i) => (
                <li key={i} className="text-xs text-white/50 pl-3 border-l-2 border-avoid/30">{r}</li>
              ))}
            </ul>
          </div>
          <div className="bg-navy-100 rounded-xl border border-white/10 p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-accent-blue" />
              Value Creation Plan
            </h3>
            <ul className="space-y-2">
              {company.investmentSummary.valueCreationPlan?.map((v, i) => (
                <li key={i} className="text-xs text-white/50 pl-3 border-l-2 border-accent-blue/30">{v}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Net Assessment */}
      <div className="bg-navy-50 rounded-xl border border-white/10 p-6">
        <h3 className="font-bold mb-3 text-white">Net Assessment</h3>
        <p className="text-sm text-white/70 leading-relaxed">{company.netAssessment}</p>
      </div>
    </div>
  );
}
