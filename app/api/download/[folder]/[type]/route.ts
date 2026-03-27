import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key);
}

function getContentType(type: string) {
  return type === 'pptx'
    ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { folder: string; type: string } }
) {
  const { folder, type } = params;

  if (!['pptx', 'docx'].includes(type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  const contentType = getContentType(type);
  const ext = `.${type}`;

  // Try Supabase Storage first (newly screened + bulk-uploaded companies)
  try {
    const supabase = getSupabase();
    const { data: files, error: listError } = await supabase.storage
      .from('reports')
      .list(folder);

    if (!listError && files && files.length > 0) {
      const file = files.find(f => f.name.endsWith(ext));
      if (file) {
        const filePath = `${folder}/${file.name}`;
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('reports')
          .download(filePath);

        if (!downloadError && fileData) {
          const buffer = Buffer.from(await fileData.arrayBuffer());
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="${file.name}"`,
            },
          });
        }
      }
    }
  } catch (err) {
    console.log(`[download] Supabase lookup failed for ${folder}, trying local filesystem...`, err);
  }

  // Fallback: try local filesystem (static companies in public/data/)
  try {
    const dataDir = path.resolve(process.cwd(), 'public', 'data', folder);
    if (fs.existsSync(dataDir)) {
      const localFiles = fs.readdirSync(dataDir);
      const localFile = localFiles.find(f => f.endsWith(ext));
      if (localFile) {
        const buffer = fs.readFileSync(path.join(dataDir, localFile));
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${localFile}"`,
          },
        });
      }
    }
  } catch (err) {
    console.log(`[download] Local filesystem lookup failed for ${folder}:`, err);
  }

  return NextResponse.json({ error: 'File not found' }, { status: 404 });
}
