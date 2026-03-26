import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const COMPANY_LIST_DIR = path.resolve(process.cwd(), '../bai-screen3/Company List');

export async function GET(
  _request: NextRequest,
  { params }: { params: { folder: string; type: string } }
) {
  const { folder, type } = params;

  if (!['pptx', 'docx'].includes(type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  const folderPath = path.join(COMPANY_LIST_DIR, folder);

  if (!fs.existsSync(folderPath)) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  // Find the file
  const files = fs.readdirSync(folderPath);
  const ext = `.${type}`;
  const fileName = files.find(f => f.endsWith(ext));

  if (!fileName) {
    return NextResponse.json({ error: `No ${type.toUpperCase()} file found` }, { status: 404 });
  }

  const filePath = path.join(folderPath, fileName);
  const fileBuffer = fs.readFileSync(filePath);

  const contentType = type === 'pptx'
    ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
