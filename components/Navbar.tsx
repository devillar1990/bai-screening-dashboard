'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
      pathname === path
        ? 'bg-white/10 text-white'
        : 'text-white/60 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <nav className="border-b border-white/10 bg-navy/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-accent-blue" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Brightstar<span className="text-accent-blue">.AI</span>
            </span>
            <span className="text-xs font-medium text-white/40 border border-white/20 rounded px-1.5 py-0.5">
              Screening
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link href="/" className={linkClass('/')}>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Screen
              </span>
            </Link>
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              <span className="flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
