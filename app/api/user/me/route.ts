import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/session';
import { db, initDb } from '../../../lib/db';

export async function GET() {
    try {
        initDb();
        const session = await getSession();

        if (!session || !session.kavach_id) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const userStmt = db.prepare('SELECT kavach_id, phone, name, kyc_level, digilocker_linked FROM users WHERE kavach_id = ?');
        const user = userStmt.get(session.kavach_id) as any;

        if (!user) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                kavach_id: user.kavach_id,
                name: user.name,
                phone: user.phone,
                kyc_level: user.kyc_level,
                digilocker_linked: user.digilocker_linked === 1
            }
        });
    } catch (e) {
        console.error('User Me Error:', e);
        return NextResponse.json({ authenticated: false }, { status: 500 });
    }
}
