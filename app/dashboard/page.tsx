import { getAllCompaniesMerged, getCompanyStats } from '@/lib/companies';
import StatsOverview from '@/components/StatsOverview';
import CompanyTable from '@/components/CompanyTable';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const companies = await getAllCompaniesMerged();
  const stats = getCompanyStats(companies);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-accent-blue">Pipeline Dashboard</h1>
        <p className="text-white/50 mt-1">Browse all screened companies with scores and classifications.</p>
      </div>

      <StatsOverview stats={stats} />
      <CompanyTable companies={companies} />
    </div>
  );
}
