import { getIronSession, IronSessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface SessionData {
  isLoggedIn: boolean;
  coachEmail?: string;
}

export const sessionOptions: IronSessionOptions = {
  cookieName: 'koc-session',
  password: process.env.SESSION_SECRET || 'fallback-secret-key-minimum-32-chars!!',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 gün
  },
};

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  return session;
}

export async function getSessionFromRequest(req: NextRequest) {
  const session = await getIronSession<SessionData>(req, new NextResponse(), sessionOptions);
  return session;
}
