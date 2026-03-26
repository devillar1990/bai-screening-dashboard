'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';

export default function ScreeningForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      companyName: form.get('companyName') as string,
      sector: form.get('sector') as string,
      subSector: form.get('subSector') as string,
      revenue: form.get('revenue') as string,
      ebitda: form.get('ebitda') as string,
      notes: form.get('notes') as string,
    };

    try {
      const res = await fetch('/api/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Screening failed');
      }

      const data = await res.json();
      router.push(`/results/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1.5 text-white/80">
            Company Name <span className="text-avoid">*</span>
          </label>
          <input
            name="companyName"
            required
            placeholder="e.g., Acme Corp"
            className="w-full px-4 py-3 rounded-lg bg-navy-200/50 border border-white/10 text-white placeholder-white/30 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-white/80">
            Sector <span className="text-avoid">*</span>
          </label>
          <input
            name="sector"
            required
            placeholder="e.g., Business Services"
            className="w-full px-4 py-3 rounded-lg bg-navy-200/50 border border-white/10 text-white placeholder-white/30 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-white/80">Sub-Sector</label>
          <input
            name="subSector"
            placeholder="e.g., IT Services"
            className="w-full px-4 py-3 rounded-lg bg-navy-200/50 border border-white/10 text-white placeholder-white/30 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-white/80">Revenue</label>
          <input
            name="revenue"
            placeholder="e.g., $500M"
            className="w-full px-4 py-3 rounded-lg bg-navy-200/50 border border-white/10 text-white placeholder-white/30 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-white/80">EBITDA</label>
          <input
            name="ebitda"
            placeholder="e.g., $80M (16% margin)"
            className="w-full px-4 py-3 rounded-lg bg-navy-200/50 border border-white/10 text-white placeholder-white/30 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1.5 text-white/80">Additional Notes</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Any additional context about the company..."
            className="w-full px-4 py-3 rounded-lg bg-navy-200/50 border border-white/10 text-white placeholder-white/30 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all text-sm resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="bg-avoid/10 border border-avoid/20 text-avoid rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-accent-blue hover:bg-sky-300 disabled:opacity-60 disabled:cursor-not-allowed text-navy font-semibold py-3.5 px-6 rounded-lg transition-colors text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Running Screening...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Run AI Screening
          </>
        )}
      </button>
    </form>
  );
}
