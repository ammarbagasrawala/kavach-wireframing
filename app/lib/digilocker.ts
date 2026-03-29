import { createDigilockerClient } from './digilocker-auth';
import { db } from './db';

// Custom State Store implementing digilocker-auth StateStore interface using better-sqlite3
export class SQLiteStateStore {
    async set(state: string, data: any): Promise<void> {
        // data contains code_verifier and possibly other custom attributes
        const stmt = db.prepare(`
            INSERT INTO digilocker_states (state, code_verifier, phone, expires_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(state) DO UPDATE SET
                code_verifier=excluded.code_verifier,
                phone=excluded.phone,
                expires_at=excluded.expires_at
        `);
        
        // State is valid for 15 minutes
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        
        // We can pass the setup token phone number into custom data if needed
        const phone = data.phone || null;
        const codeVerifier = data.code_verifier || 'mock_verifier';

        stmt.run(state, codeVerifier, phone, expiresAt);
    }

    async get(state: string): Promise<any> {
        const stmt = db.prepare('SELECT code_verifier, phone, expires_at FROM digilocker_states WHERE state = ?');
        const record = stmt.get(state) as any;
        
        if (!record) return null;

        if (new Date(record.expires_at) < new Date()) {
            return null; // Expired
        }

        return {
            codeVerifier: record.code_verifier,
            phone: record.phone
        };
    }

    async delete(state: string): Promise<void> {
        db.prepare('DELETE FROM digilocker_states WHERE state = ?').run(state);
    }
}

// Ensure the mockup redirect URL points exactly to our local Next.js frontend
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${PORT}`;

export const digilockerClient = createDigilockerClient({
    clientId: 'MOCK_KAVACH_DEV',
    clientSecret: 'MOCK_SECRET',
    redirectUri: `${BASE_URL}/api/auth/digilocker/callback`,
    mockMode: true,
    mock: {
        authorizeUrl: `${BASE_URL}/api/auth/digilocker/mock`,
    }
});

export const stateStore = new SQLiteStateStore();
