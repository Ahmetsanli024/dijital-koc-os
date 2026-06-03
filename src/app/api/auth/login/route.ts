import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionData, sessionOptions } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const validEmail    = process.env.COACH_EMAIL    || 'ahmet@kocluk.com';
    const validPassword = process.env.COACH_PASSWORD || 'koc2026';

    if (email !== validEmail || password !== validPassword) {
      return NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
    }

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.isLoggedIn  = true;
    session.coachEmail  = email;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
