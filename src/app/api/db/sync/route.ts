import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (!sql) {
    return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
  }

  try {
    const rows = await sql`
      SELECT data, updated_at 
      FROM user_storage 
      WHERE user_id = ${userId}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: rows[0].data, updatedAt: rows[0].updated_at });
  } catch (error: any) {
    console.error('Neon DB Sync GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!sql) {
    return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { userId, data } = body;

    if (!userId || !data) {
      return NextResponse.json({ success: false, error: 'Missing userId or data' }, { status: 400 });
    }

    // Upsert into Neon PostgreSQL
    await sql`
      INSERT INTO user_storage (user_id, data, updated_at)
      VALUES (${userId}, ${JSON.stringify(data)}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        data = EXCLUDED.data,
        updated_at = CURRENT_TIMESTAMP;
    `;

    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error: any) {
    console.error('Neon DB Sync POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
