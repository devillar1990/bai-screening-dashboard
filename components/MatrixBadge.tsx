import { Classification } from '@/lib/types';

const badgeStyles: Record<Classification, string> = {
  Pursue: 'bg-pursue/10 text-pursue border-pursue/20',
  Monitor: 'bg-monitor/10 text-monitor border-monitor/20',
  Avoid: 'bg-avoid/10 text-avoid border-avoid/20',
};

const dotStyles: Record<Classification, string> = {
  Pursue: 'bg-pursue',
  Monitor: 'bg-monitor',
  Avoid: 'bg-avoid',
};

export default function MatrixBadge({
  classification,
  size = 'md',
}: {
  classification: Classification;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${badgeStyles[classification]} ${sizeClasses[size]}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotStyles[classification]}`} />
      {classification}
    </span>
  );
}
