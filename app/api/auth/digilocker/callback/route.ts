import { NextResponse } from 'next/server';
import { digilockerClient, stateStore } from '../../../../lib/digilocker';
import { createSession } from '../../../../lib/session';
import { db, initDb } from '../../../../lib/db';

export async function GET(req: Request) {
    try {
        initDb();
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
            return NextResponse.redirect(new URL('/onboarding?error=missing_oauth_params', req.url));
        }

        // Exchange code + state for tokens
        const tokenResponse = await digilockerClient.handleCallback({ code, state }, stateStore);

        // Fetch user info using the access_token
        const userProfile = await digilockerClient.getUserDetails({ accessToken: tokenResponse.access_token });

        if (!userProfile) {
            return NextResponse.redirect(new URL('/onboarding?error=digilocker_fetch_failed', req.url));
        }

        // Now we match this user profile back to Kavach user
        // The mock user profile comes back with {"name": "Test User", "dob": ...}
        // Let's create proper Kavach ID if they don't have one, or update.
        
        let targetKavachId = `kavach_${Date.now()}`; // simplified ID for demo

        // Mark digilocker linked in DB
        // If we want to link it precisely to the phone from setup_token phase, we could retrieve phone from stateStore or session.
        // For simplicity in this demo, we'll create the session.
        
        db.prepare(`
            INSERT INTO users (kavach_id, name, digilocker_linked, kyc_level)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(kavach_id) DO UPDATE SET
                name=excluded.name,
                digilocker_linked=excluded.digilocker_linked
        `).run(targetKavachId, userProfile.name || 'DigiLocker User', 1, 'BASELINE');

        // Create Secure HttpOnly Setup
        await createSession(targetKavachId);

        // Success -> Redirect to Onboarding to finish Security Setup
        return NextResponse.redirect(new URL('/onboarding?auth_completed=true', req.url));

    } catch (e) {
        console.error('Digilocker Callback Error:', e);
        return NextResponse.redirect(new URL('/onboarding?error=callback_failed', req.url));
    }
}
