import { getAllCompanies } from '@/lib/companies';
import StatsOverview from '@/components/StatsOverview';
import CompanyTable from '@/components/CompanyTable';

export default function Dashboard() {
  const companies = getAllCompanies();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-accent-blue">Pipeline Dashboard</h1>
        <p className="text-white/50 mt-1">Browse all screened companies with scores and classifications.</p>
      </div>

      <StatsOverview />
      <CompanyTable companies={companies} />
    </div>
  );
}
