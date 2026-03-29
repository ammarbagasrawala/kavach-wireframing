import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const redirect_uri = searchParams.get('redirect_uri');
    const state = searchParams.get('state');

    if (!redirect_uri || !state) {
        return new Response('Invalid request parameters for DigiLocker Mock', { status: 400 });
    }

    // Since this is a programmatic flow requested by the user, we will 
    // construct an auto-redirect mock page. It visually shows the Digilocker Auth,
    // then fires the redirect.
    const mockCode = 'mock_auth_code_123456';
    const finalUrl = `${redirect_uri}?code=${mockCode}&state=${state}`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DigiLocker Authorization</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); text-align: center; max-width: 400px; width: 100%; border-top: 4px solid #0056D2; }
            h2 { color: #111827; margin-bottom: 8px; }
            p { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
            .spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #0056D2; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 24px auto; }
            @keyframes spin { to { transform: rotate(360deg); } }
            .btn { display: inline-block; background: #0056D2; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; width: 100%; box-sizing: border-box; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>DigiLocker Auth</h2>
            <p>Kavach is requesting access to your documents and profile data.</p>
            <div class="spinner"></div>
            <p><strong>Automatically approving...</strong></p>
            <a href="${finalUrl}" class="btn">Click here if not redirected</a>
        </div>
        <script>
            setTimeout(() => {
                window.location.href = "${finalUrl}";
            }, 2500);
        </script>
    </body>
    </html>
    `;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
    });
}
