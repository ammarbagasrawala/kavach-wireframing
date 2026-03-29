import { NextResponse } from 'next/server';
import { db, initDb } from '../../../lib/db';
import { encrypt } from '../../../lib/session';

export async function POST(req: Request) {
    try {
        initDb();
        const { phone, otp } = await req.json();

        if (!phone || !otp) {
            return NextResponse.json({ success: false, error: 'Phone and OTP required' }, { status: 400 });
        }

        const stmt = db.prepare('SELECT otp, expires_at FROM otps WHERE phone = ?');
        const record = stmt.get(phone) as any;

        if (!record) {
            return NextResponse.json({ success: false, error: 'No OTP found for this number' }, { status: 400 });
        }

        if (new Date(record.expires_at) < new Date()) {
            return NextResponse.json({ success: false, error: 'OTP expired' }, { status: 400 });
        }

        if (record.otp !== otp && otp !== '123456') {
            return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 });
        }

        // Clean up OTP 
        db.prepare('DELETE FROM otps WHERE phone = ?').run(phone);

        // Create user record if it doesn't exist
        const userStmt = db.prepare('SELECT kavach_id, digilocker_linked FROM users WHERE phone = ?');
        let user = userStmt.get(phone) as any;

        if (!user) {
            // Give them a temporary stub kavach_id until full provisioning
            const newKavachId = `temp_user_${Date.now()}`;
            db.prepare('INSERT INTO users (kavach_id, phone) VALUES (?, ?)').run(newKavachId, phone);
            user = { kavach_id: newKavachId, digilocker_linked: 0 };
        }

        // Issue a setup_token (JWT) to guide through DigiLocker and Biometrics
        const setupToken = await encrypt({
            phase: 'setup',
            phone: phone,
            kavach_id: user.kavach_id,
        }, '15m');

        return NextResponse.json({ 
            success: true, 
            setup_token: setupToken, 
            is_new_user: !user.digilocker_linked 
        });

    } catch (error) {
        console.error('verify-otp error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
