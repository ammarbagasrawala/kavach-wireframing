import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = 'kavach-super-secret-development-key';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any, expiresIn: string | number = '2h') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn as any)
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (e) {
        return null;
    }
}

export async function createSession(kavach_id: string) {
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    const sessionToken = await encrypt({ kavach_id, expires: expires.toISOString() });

    const cookieStore = await cookies();
    cookieStore.set('kavach_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expires,
        path: '/',
    });
}

export async function getSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('kavach_session')?.value;
    if (!sessionToken) return null;
    return await decrypt(sessionToken);
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete('kavach_session');
}
