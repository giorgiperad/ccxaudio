import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  try {
    const { rows } = await sql`
      SELECT * FROM books
      WHERE title ILIKE ${'%' + query + '%'} OR author ILIKE ${'%' + query + '%'}
    `;
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search books' }, { status: 500 });
  }
}