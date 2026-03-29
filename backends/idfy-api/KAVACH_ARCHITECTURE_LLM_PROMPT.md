# KAVACH System Architecture & Flow Specification (LLM System Prompt)

This document is a highly detailed architectural blueprint for the Kavach application. It is explicitly designed to serve as a comprehensive system prompt for an LLM (or human developer) transitioning from wireframes to building the actual backend, APIs, and databases.

## 1. Core Operating Principle & Privacy Philosophy
Kavach is a privacy-first, decentralized identity wallet (digital locker) aligned with RBI and personal data protection guidelines. 

**Crucial Backend Rule**: The Kavach Backend **DOES NOT** store raw PII (Aadhaar number, PAN, Address, Photo data) in plain text persistently. PII is stored securely on the user's local device (Hardware Secure Enclave/Keystore) natively as **Verifiable Credentials (VCs)**. 

The backend acts as a:
1. Routing and Messaging Hub (handling inbound requests from Relying Parties).
2. Cryptographic Trust Registry (mapping user `Kavach IDs` to their Public Keys / DIDs).
3. Immutable Audit Logger.
4. Ephemeral Gateway (temporarily handling fetch streams from DigiLocker/CKYCR before beaming to the device).

---

## 2. The Onboarding Flow (The "Golden" Middle-Ground)
This flow mitigates device/OTP theft while keeping onboarding under 60 seconds *without needing a human Video KYC agent*.

### Step 1: Possession (Device Binding via Phone)
- **Client Event**: User enters Phone Number.
- **Backend API**: `POST /auth/send-otp` -> generates a 6-digit OTP.
  - *DB/Cache*: Stored in Redis with a TTL of 5 minutes (`kavach:otp:{hash}`).
- **Client Event**: User submits OTP.
- **Backend API**: `POST /auth/verify-otp`. Returns a short-lived `setup_token`.
- **Device Security**: Client generates a hardware-backed Key Pair (secp256r1/Ed25519) (Decentralized Identifier - DID). Sends the Public Key + Device Attestation payload to the backend.

### Step 2: Identity Retrieval (DigiLocker)
- **Client Event**: User connects DigiLocker via OAuth 2.0 flow.
- **Backend API**: Handles callback, exchanges auth code for `access_token`. Calls DigiLocker `/issued_documents` specifically targeting the **Aadhaar XML** file.
- **Data Handling**: The Aadhaar XML (containing demographic data and the Base64 Profile Photo) is temporarily parsed in RAM.

### Step 3: Biometric Inherence (Automated Liveness & Face Match)
- **Client Event**: Prompts user for a quick 3-second live selfie (doing passive liveness detection on-device).
- **Backend API**: `POST /auth/biometric-verify`
  - *Payload*: Live Selfie image + Secure Payload.
  - *Engine*: Backend AI compares the Live Selfie against the DigiLocker Aadhaar Base64 Photo (1:1 Match) + Server-side Passive Liveness assessment.
- **Outcome**: 
  - If match > 95%, the backend provisions the `Kavach ID` (e.g., `ammar@kavach`), registers the User's DID Public Key in the Database, and issues standard JWT/Auth Session access.
  - **Security Check Mechanism**: Fraudsters with stolen phones and OTPs *fail here* because their face won't match the Aadhaar record.
- **Cleanup**: Ephemeral biometric imagery is dropped aggressively from RAM.

### Step 4: Local VC Provisioning
- **Client/Backend Interaction**: The Aadhaar data is wrapped into a W3C Verifiable Credential. The Kavach Issuer service signs it. The client downloads and stores it purely in the local hardware vault.

---

## 3. High-Assurance VC Issuance (The VKYC Vaulting)
For users who need to do high-trust operations (like opening a new bank account), they must upgrade their "Baseline" identity to a "Verified" identity mimicking RBI’s V-CIP.

### Step 1: Initiation
- **Client Event**: User taps "Connect Agent" inside the app.
- **Backend API**: `POST /vkyc/initiate`. Creates a V-CIP session struct in the database. 

### Step 2: Live Video Call
- **Infrastructure**: WebRTC bridge between user and authorized Kavach KYC agent.
- **Checks Performed**: 
  1. Agent captures the **Original PAN Card** physically held by the user on video (Mandatory per current RBI regulations unless specific XML flows are allowed).
  2. Live GPS coordinate binding.
  3. Liveness/Assisted check.
- **Outcome**: 
  - Agent approves. 
  - Backend issues a heavily attested, digitally signed `"VKYC Verified"` Identity Credential to the user's wallet.
  - Backend updates `users` table: `kyc_level = FULL_VKYC`.

---

## 4. Internal Data Fetch Architectures
APIs to integrate national databases.

### DigiLocker (PAN, DL, Passport, Voter ID)
- Uses the long-lived or refreshed DigiLocker OAuth token.
- **Backend**: `GET /integrations/digilocker/fetch?docType=PAN`.
- Validates the XML/JSON from the issuer, formats it into standardized W3C VC `CredentialSubject` schema, signs it with Kavach's Issuer Key, and sends to the requested device.

### Central KYC Repository (CKYCR)
- **Search API**: `POST /integrations/ckycr/search`. Payload utilizes Aadhaar + DOB or PAN. Returns the 14-digit CKYC Identifier.
- **Download API**: `POST /integrations/ckycr/download`. Payload uses CKYC ID + Mobile Auth Factor. Returns the heavy CKYC XML record.
- **Transformation**: Data is deserialized, stripped of unnecessary noise, mapped to VC specs, and passed to the device.

---

## 5. KYC Request & Selective Disclosure Flow
This is how Relying Parties (RPs like Banks or Lenders) request tokenized KYC from a Kavach user.

### Step 1: Request Ingestion
- **RP Backend**: Communicates Server-to-Server to Kavach API: `POST /api/v1/requests/initiate`.
  - *Payload*: `{ "target_kavach_id": "ammar@kavach", "rp_id": "hdfc_01", "requested_fields": ["name", "pan", "dob"], "purpose": "Savings Account Opening", "retention_ttl": "365d" }`
- **Kavach Backend**: Creates record in `kyc_requests` table (`status = PENDING`). Shoots an FCM/APNS Push Notification to the user.

### Step 2: Consent & Presentation (DIDComm / OIDC4VP)
- **Client Event**: User sees the request, reviews the fields, and authorizes sharing via Local Biometrics (FaceID).
- **Cryptographic Action**: Client constructs a **Verifiable Presentation (VP)** containing *only* the requested claims (Selective Disclosure). The client signs the VP with its local Private Key.
- **Backend API**: Client hits `POST /requests/<id>/grant`.
  - Optionally, the payload is JWE encrypted utilizing the Bank's public key (Zero-Knowledge transport).
- **Backend Relay**: Kavach receives the VP, updates `status = GRANTED`, logs the action, and forwards the payload to the Relying Party's pre-configured webhook endpoint.

---

## 6. Granular Revocation Lifecycle
- **Client Event**: User views "Active Access" tab and taps "Revoke" on an RP (e.g., Airtel).
- **Backend API**: `POST /requests/<id>/revoke`.
- **Action**: Backend changes status to `REVOKED`. 
- **Ecosystem Signal**: Backend triggers a webhook to the Relying Party signalling an Account Aggregator/Digital Privacy act revocation string: *"User xxxx has revoked consent. Instruction to purge data."*
- **Audit Logging**: Recorded immutably.

---

## 7. Audit Logging Architecture (Crucial for Compliance)
Regulatory requirements mandate tampering-proof activity trails.

- **Storage Method**: Append-only NoSQL collection (MongoDB/DynamoDB) or Postgres Temporal tables.
- **Log Schema**:
  - `log_id` (UUID)
  - `timestamp` (ISO8601 UTC)
  - `kavach_id` (String)
  - `action` (Enum: `LOGIN`, `CREDENTIAL_MINTED`, `CONSENT_GRANTED`, `CONSENT_REVOKED`, `VKYC_INITIATED`, `INTEGRITY_CHECK_FAILED`)
  - `ip_address` (String)
  - `device_fingerprint` (String / Hash)
  - `target_rp` (String, Optional)
  - `status` (Enum: `SUCCESS`, `FAIL`, `WARN`)
- **Data Policy**: Logs never contain PII parameters (e.g., Logs say "Granted Name and PAN to HDFC", not the actual name and PAN number).

---

## 8. Database Core Schema (Relational PostgreSQL Setup)

### Table: `users`
- `kavach_id` (Primary Key, VarChar)
- `did` (Unique String, the user's decentralized identifier)
- `public_key` (String, JWK representation)
- `kyc_level` (Enum: `UNVERIFIED`, `BASELINE_EKYC`, `FULL_VKYC`)
- `status` (Enum: `ACTIVE`, `LOCKED`, `SUSPENDED`)
- `vkyc_completed_at` (Timestamp, Nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Table: `devices`
- `device_id` (Primary Key, UUID)
- `kavach_id` (Foreign Key -> users)
- `fcm_token` (String, for Push Notifications)
- `device_attestation` (String, Android Play Integrity / iOS DeviceCheck payload)
- `is_active` (Boolean)
- `last_active_at` (Timestamp)

### Table: `kyc_requests`
- `request_id` (Primary Key, UUID)
- `kavach_id` (Foreign Key -> users)
- `rp_id` (String, Relying party identifier)
- `purpose` (Text)
- `fields_requested` (JSONB array)
- `status` (Enum: `PENDING`, `GRANTED`, `DENIED`, `REVOKED`)
- `expires_at` (Timestamp, TTL for the user to answer the request)
- `granted_at` (Timestamp, Nullable)
- `revoked_at` (Timestamp, Nullable)

---

## 9. TTL & Background Data Policies
1. **Redis Caching**: 
   - OTP records: `300s` TTL.
   - Digilocker Transient Auth code states: `600s`.
   - Idempotency keys (to prevent replay attacks): `86400s` (24 hr).
2. **KYC Requests (Pending)**: If a user ignores an inbound request for 72 hours, a scheduled cron/worker job automatically marks it as `EXPIRED`.
3. **Data Integrity Checks**: A background worker periodically assesses mapped metadata (like hashes) across a user's VC manifest to flag "Mismatches" (e.g., Aadhaar Address hash deviates drastically from PAN Address hash) and flags an `INTEGRITY_WARN` on the user dashboard.

---

## 10. Directives for the Backend LLM Engineer
When generating controllers, services, and models based on this document:
1. **Default to Ephemeral Handling:** Whenever you process actual document payloads from government APIs, treat the variables like radioactive material. Pass them to the client and let the Garbage Collector wipe them. Do not write them to `console.log` or the Postgres DB.
2. **Authentication Middleware:** Protect all endpoints (save for `/auth/*`) with a strict JWT validation middleware that ensures the `Subject` matches the `Kavach ID` and validates the device fingerprint.
3. **Robust Cryptography:** When handling VC issuance or Verifiable Presentation (VP) ingestion, utilize standardized crypto libraries (`cryptography` in Python, `@noble/secp256k1` or `jose` in Node.js) conforming to W3C JSON-LD or JWT VC Data Models.
4. **Input Validation:** Heavily validate inbound webhooks and Server-to-Server RP requests using typed guards (Pydantic / Zod) to prevent injection or malicious request spams. 
5. **Standardized Responses:** Wrap all Rest API outputs in a predictable `{ success: boolean, data: {}, error?: { code, message } }` envelope.
