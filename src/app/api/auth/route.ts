import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  if (!sql) {
    return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 503 });
  }

  // Ensure tables exist
  await initDatabase();

  try {
    const body = await req.json();
    const { action, username, password, name, phone, companyName, userId } = body;

    const cleanUsername = (username || '').trim().toLowerCase();

    if (action === 'signup') {
      if (!cleanUsername || !name) {
        return NextResponse.json({ success: false, error: 'Username and Name are required' }, { status: 400 });
      }

      // Check if user already exists in Neon
      const existing = await sql`
        SELECT id FROM users WHERE LOWER(username) = ${cleanUsername} LIMIT 1;
      `;

      if (existing.length > 0) {
        return NextResponse.json({ success: false, error: 'यह यूज़रनेम पहले से रजिस्टर्ड है।' }, { status: 409 });
      }

      const newId = userId || 'user-' + Date.now();

      await sql`
        INSERT INTO users (id, username, password_hash, name, phone, company_name, is_demo)
        VALUES (${newId}, ${cleanUsername}, ${password || ''}, ${name}, ${phone || ''}, ${companyName || ''}, false);
      `;

      return NextResponse.json({
        success: true,
        user: {
          id: newId,
          username: cleanUsername,
          name,
          phone: phone || '',
          companyName: companyName || '',
          isDemo: false,
        }
      });
    }

    if (action === 'login') {
      if (!cleanUsername) {
        return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
      }

      const rows = await sql`
        SELECT id, username, password_hash, name, phone, company_name, is_demo 
        FROM users 
        WHERE LOWER(username) = ${cleanUsername} 
        LIMIT 1;
      `;

      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: 'यूज़रनेम नहीं मिला।' }, { status: 404 });
      }

      const user = rows[0];

      if (user.password_hash && password && user.password_hash !== password) {
        return NextResponse.json({ success: false, error: 'गलत पासवर्ड।' }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          phone: user.phone || '',
          companyName: user.company_name || '',
          isDemo: Boolean(user.is_demo),
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Neon Auth error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
