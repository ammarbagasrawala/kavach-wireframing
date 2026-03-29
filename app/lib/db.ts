import Database from 'better-sqlite3';
import path from 'path';

// Connect to the DB (or create it if it doesn't exist)
// We store it at the root of the wireframes directory
const dbPath = path.resolve(process.cwd(), 'kavach_app.db');
const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

// Initialize Schema
function initDb() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            kavach_id TEXT PRIMARY KEY,
            phone TEXT UNIQUE,
            name TEXT,
            kyc_level TEXT DEFAULT 'UNVERIFIED',
            digilocker_linked INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS otps (
            phone TEXT PRIMARY KEY,
            otp TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            kavach_id TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (kavach_id) REFERENCES users (kavach_id)
        );

        CREATE TABLE IF NOT EXISTS digilocker_states (
            state TEXT PRIMARY KEY,
            code_verifier TEXT NOT NULL,
            phone TEXT,
            expires_at DATETIME NOT NULL
        );
    `);
}

// export the DB instance
export { db, initDb };
