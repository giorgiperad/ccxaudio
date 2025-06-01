import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM books`;
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const file = formData.get('file') as File;
    const icon = formData.get('icon') as string;

    if (!title || !author) {
      return NextResponse.json({ error: 'Title and author are required' }, { status: 400 });
    }

    let audioUrl = '';
    let duration = 0;

    if (file) {
      const blob = await put(file.name, file, {
        access: 'public',
      });
      audioUrl = blob.url;

      // Fetch duration (requires client-side audio metadata or server-side processing)
      // For simplicity, assume duration is provided or calculated client-side
      duration = parseInt(formData.get('duration') as string) || 0;
    }

    const { rows } = await sql`
      INSERT INTO books (title, author, duration, progress, icon, audio_url)
      VALUES (${title}, ${author}, ${duration}, 0, ${icon || '📚'}, ${audioUrl})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add book' }, { status: 500 });
  }
}