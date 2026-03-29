import { NextResponse } from 'next/server';
import { db, initDb } from '../../../lib/db';

export async function POST(req: Request) {
    try {
        initDb();
        const { phone } = await req.json();

        if (!phone || phone.length < 10) {
            return NextResponse.json({ success: false, error: 'Valid phone number required' }, { status: 400 });
        }

        // Generate a 6-digit mock OTP (hardcoded for easy testing)
        const mockOtp = '123456'; 
        
        // Expiration in 5 minutes
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        const stmt = db.prepare(`
            INSERT INTO otps (phone, otp, expires_at)
            VALUES (?, ?, ?)
            ON CONFLICT(phone) DO UPDATE SET
                otp=excluded.otp,
                expires_at=excluded.expires_at,
                created_at=CURRENT_TIMESTAMP
        `);
        stmt.run(phone, mockOtp, expiresAt);

        // Optional log for testing:
        console.log(`[Mock SMS] Sent OTP ${mockOtp} to ${phone}`);

        return NextResponse.json({ success: true, message: 'OTP sent' });
    } catch (error) {
        console.error("send-otp error:", error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
