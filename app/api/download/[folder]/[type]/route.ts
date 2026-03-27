import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { folder: string; type: string } }
) {
  const { folder, type } = params;

  if (!['pptx', 'docx'].includes(type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();

    // List files in the folder to find the matching type
    const { data: files, error: listError } = await supabase.storage
      .from('reports')
      .list(folder);

    if (listError || !files || files.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const ext = `.${type}`;
    const file = files.find(f => f.name.endsWith(ext));

    if (!file) {
      return NextResponse.json({ error: `No ${type.toUpperCase()} file found` }, { status: 404 });
    }

    const filePath = `${folder}/${file.name}`;

    // Download the file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('reports')
      .download(filePath);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    const contentType = type === 'pptx'
      ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const buffer = Buffer.from(await fileData.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${file.name}"`,
      },
    });
  } catch (error) {
    console.error('[download] Error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
