import { NextResponse } from 'next/server';
import { digilockerClient, stateStore } from '../../../../lib/digilocker';
import { decrypt } from '../../../../lib/session';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const setupToken = searchParams.get('token');

        if (!setupToken) {
            return NextResponse.redirect(new URL('/onboarding?error=missing_setup_token', req.url));
        }

        const payload = await decrypt(setupToken);
        if (!payload || payload.phase !== 'setup') {
            return NextResponse.redirect(new URL('/onboarding?error=invalid_setup_token', req.url));
        }

        const { url } = await digilockerClient.createAuthorizationRequest({
            scope: 'files.read user.info',
            dlFlow: 'signin',
            verifiedMobile: 'Y',
            // Pass phone via extension for state store mapping if needed
            phone: payload.phone
        }, stateStore);

        // Standard 302 redirect to DigiLocker (or our mock endpoint)
        return NextResponse.redirect(url);
    } catch (e) {
        console.error('Digilocker Start Error:', e);
        return NextResponse.json({ error: 'Failed to start DigiLocker authorization' }, { status: 500 });
    }
}
