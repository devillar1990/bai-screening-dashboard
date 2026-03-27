import { notFound } from 'next/navigation';
import { getCompanyByFolder, getAllCompanies } from '@/lib/companies';
import { getCompletedScreeningByFolder } from '@/lib/screening-store';
import MatrixBadge from '@/components/MatrixBadge';
import ScoreCard from '@/components/ScoreCard';
import DownloadButtons from '@/components/DownloadButtons';
import { VCBreakdown, DRBreakdown, PEBreakdown } from '@/components/ScoreBreakdown';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';

export const dynamicParams = true;

export function generateStaticParams() {
  return getAllCompanies().map(c => ({ folder: c.folder }));
}

export default async function CompanyDetail({ params }: { params: { folder: string } }) {
  let company = getCompanyByFolder(params.folder);
  if (!company) {
    company = await getCompletedScreeningByFolder(params.folder);
  }
  if (!company) notFound();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-accent-blue mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{company.companyName}</h1>
            <p className="text-white/50 mt-1">{company.sector}</p>
            {company.date && <p className="text-xs text-white/30 mt-1">Screened: {company.date}</p>}
          </div>
          <div className="flex items-center gap-4">
            <MatrixBadge classification={company.matrixClassification} size="lg" />
            <DownloadButtons folder={company.folder} hasPptx={company.has_pptx} hasDocx={company.has_docx} />
          </div>
        </div>
      </div>

      {/* Business Description + Key Metrics */}
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

      {/* VC Breakdown */}
      <VCBreakdown data={company} />

      {/* Top AI Opportunities */}
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

      {/* DR Breakdown */}
      <DRBreakdown data={company} />

      {/* Key Disruption Findings */}
      {company.keyDisruptionFindings && company.keyDisruptionFindings.length > 0 && (
        <div className="bg-navy-100 rounded-xl border border-white/10 p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5 text-monitor" />
            Key Disruption Findings
          </h3>
          <div className="space-y-3">
            {company.keyDisruptionFindings.map((finding, i) => (
              <div key={i} className="bg-monitor/10 rounded-lg p-4 border-l-4 border-monitor/40">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-white">{finding.title}</p>
                  <span className="text-xs font-mono text-white/40">Severity: {finding.severity}/5</span>
                </div>
                <p className="text-xs text-white/50 mt-1">{finding.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PE Breakdown */}
      <PEBreakdown data={company} />

      {/* Investment Summary */}
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
