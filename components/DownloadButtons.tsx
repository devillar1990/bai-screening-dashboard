'use client';
import { FileText, Presentation } from 'lucide-react';

export default function DownloadButtons({ folder, hasPptx, hasDocx }: { folder: string; hasPptx?: boolean; hasDocx?: boolean }) {
  if (!hasPptx && !hasDocx) return null;

  return (
    <div className="flex gap-3">
      {hasPptx && (
        <a
          href={`/api/download/${folder}/pptx`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:border-accent-blue hover:bg-accent-blue/10 transition-colors text-sm font-medium text-white"
        >
          <Presentation className="w-4 h-4 text-accent-blue" />
          Download PPTX
        </a>
      )}
      {hasDocx && (
        <a
          href={`/api/download/${folder}/docx`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:border-accent-blue hover:bg-accent-blue/10 transition-colors text-sm font-medium text-white"
        >
          <FileText className="w-4 h-4 text-accent-blue" />
          Download DOCX
        </a>
      )}
    </div>
  );
}
