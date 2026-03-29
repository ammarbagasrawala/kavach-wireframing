import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { createSession } from '../../../lib/session';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { setupToken } = body;
        
        if (!setupToken) {
             return NextResponse.json({ error: 'Missing token' }, { status: 400 });
        }

        const key = new TextEncoder().encode('kavach-super-secret-development-key');
        const { payload } = await jwtVerify(setupToken, key, { algorithms: ['HS256'] });
        
        if (payload.kavach_id) {
            await createSession(payload.kavach_id as string);
            return NextResponse.json({ success: true });
        }
        
        return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
}
