import ScreeningForm from '@/components/ScreeningForm';
import StatsOverview from '@/components/StatsOverview';
import { getAllCompaniesMerged, getCompanyStats } from '@/lib/companies';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const companies = await getAllCompaniesMerged();
  const stats = getCompanyStats(companies);
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center gap-2 bg-white/10 text-accent-blue px-4 py-1.5 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          B.AI Screening Framework v4.3.1
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-accent-blue">
          Screen a Company
        </h1>
        <p className="text-lg text-white/50 max-w-2xl mx-auto">
          Enter a company name to run an AI-powered screening across Value Creation,
          Disruption Risk, and PE Suitability. Get full scores and downloadable reports.
        </p>
      </div>

      {/* Screening Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-navy-100 rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-8">
          <ScreeningForm />
        </div>
      </div>

      {/* Stats + Dashboard Link */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Pipeline Overview</h2>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm font-semibold text-accent-blue hover:text-sky-300 transition-colors"
          >
            View all companies
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <StatsOverview stats={stats} />
      </div>
    </div>
  );
}
