# Daleel — Portable Digital Academic Records System

Daleel (which means "proof" in Arabic) is an offline-aware academic
records platform built for displaced and migrant learners. It lets
authorized institutions register learners without formal identity documents,
issue cryptographically signed academic records, and have those records
verified by *any* receiving institution — online or completely offline —
so a learner's academic history survives displacement even when the
issuing institution, its servers, or its country of origin cannot be reached.

## Table of contents

- [Problem](#problem)
- [Key features](#key-features)
- [How verification works](#how-verification-works)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Roles & permissions](#roles--permissions)
- [API reference](#api-reference)
- [Getting started](#getting-started)
- [Security notes](#security-notes)

## Problem

Learners displaced by conflict or migration routinely lose access to the
institutions that hold their academic records. A receiving institution or a scholarhsip body has no
reliable way to confirm what a learner has completed or achieved, and often
no internet connectivity to check even if a central record existed.
Daleel addresses this by putting the proof of authenticity *inside* the
record itself (a digital signature), so verification never depends on
reaching the issuing institution's server.

## Key features

- **ID-free learner registration** — learner profiles are built from a
  photo (live capture or upload fallback), name, estimated age/DOB, and
  place of origin, since many learners lack formal identity documents.
  Duplicate-profile detection flags likely re-registrations by name and
  origin.
- **Cryptographically signed records** — every issued academic record
  (level completed, academic year, per-subject results, outcome) is
  signed with the issuing institution's Ed25519 private key. Any edit
  after issuance invalidates the signature; records are immutable by
  design — there is no update endpoint.
- **Online and fully offline verification** — a QR code embeds the
  record, its signature, and the issuer ID. Verifiers scan or paste the
  code; the backend re-checks the signature, or, with no connectivity,
  the browser verifies it locally against a device-cached directory of
  institution public keys and queues the result to sync once back
  online.
- **Installable, offline-first PWA** — a service worker caches the app
  shell (verify/login screens, icons, manifest) so the app itself loads
  without a network connection, independent of the offline verification
  logic above.
- **Role-based access** — Issuer staff, Verifier staff, and
  Administrators each see only the navigation and dashboard actions
  relevant to their role.
- **Institution self-service onboarding** — a new staff account can
  create a brand-new institution (generating its Ed25519 keypair) or
  join an existing one at registration time.
- **Analytics** — administrators see activity totals (learners, records,
  verifications, outcomes) scoped to their own institution; superusers
  see the same pooled across every institution on the platform, plus a
  top-institutions leaderboard.
- **Verification audit log** — every verification attempt (authentic or
  not, online or offline) is logged with its result and mode for
  auditability.

## How verification works

1. **Issue** — an issuer signs `{ recordId, learnerId, issuerId,
   levelCompleted, academicYear, subjectResults, completionOutcome }`
   with the institution's Ed25519 private key and stores the SHA-256
   hash of that canonical payload alongside the signature.
2. **Present** — the record, its signature, and the issuer ID are
   encoded into a QR code (`build_qr_payload`), which the learner or
   institution presents to a verifier.
3. **Verify** —
   - **Online**: `POST /api/verify/` looks up the issuer's public key
     server-side and checks the signature with the `cryptography`
     library.
   - **Offline**: the frontend re-implements the same Ed25519 check in
     the browser (`@noble/ed25519`) against public keys cached in
     IndexedDB the last time the device was online, and queues the
     result to `POST /api/verify/sync/` for the audit log once
     connectivity returns.
4. **Result** — any alteration to a signed field changes the canonical
   payload and breaks the signature check, so tampering is always
   detectable without contacting the issuing institution.

## Tech stack

**Backend** — Django 6 · Django REST Framework · Simple JWT auth ·
PostgreSQL · `cryptography` (Ed25519 signing) · django-cors-headers ·
Pillow (photo uploads)

**Frontend** — Next.js 16 (App Router) · React 19 · Tailwind CSS 4 ·
`html5-qrcode` (camera scanning) · `qrcode.react` (QR rendering) ·
`@noble/ed25519` (client-side offline signature checks) · a hand-rolled
service worker and IndexedDB layer for offline support (no external PWA
framework)

## Project structure

```
Daleel/
├── backend/                     Django and DRF API
│   ├── config/                  Settings, root URLconf, WSGI/ASGI
│   ├── accounts/                Institution & User models, JWT auth, registration
│   ├── learners/                Learner identity profiles (photo-based)
│   ├── records/                 AcademicRecord model, Ed25519 signing, issuance
│   ├── verification/            Signature verification alongside audit log, offline sync
│   ├── analytics/                Institution/platform activity summaries
│   ├── media/                   Uploaded learner photos (gitignored)
│   └── requirements.txt
│
└── frontend/                    Next.js PWA
    ├── public/                  Manifest, icons, service worker (sw.js)
    └── src/
        ├── app/
        │   ├── page.js               Landing page
        │   ├── login/, register/     Auth
        │   ├── dashboard/            Role-aware action hub
        │   ├── learners/             List, register (photo capture), detail plus history
        │   ├── records/              Issue a record, record detail (QR and summary)
        │   ├── verify/               Scan/paste, online and offline verification, report card
        │   └── analytics/            Admin/superuser activity dashboard
        ├── components/           AppHeader (role-based nav), Reveal, ServiceWorkerRegister
        └── lib/                  api.js, offlineCrypto.js, offlineDb.js, verification.js
```

## Roles & permissions

| Role | Backend `Role` value | Landing dashboard actions | Nav links |
|---|---|---|---|
| Issuer staff | `ISSUER_STAFF` | Register learner, Issue record, Learners | Dashboard, Learners |
| Verifier staff | `VERIFIER_STAFF` | Verify record | Dashboard, Verify |
| Administrator | `ADMINISTRATOR` | All of the above | Dashboard, Learners, Verify, Analytics |

Every institution has its own Ed25519 keypair and can be an `ISSUER`,
`VERIFIER`, or `BOTH`. Record and record-history lookups are scoped to
the requesting user's own institution.

## API reference

All routes are prefixed with `/api/`.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/token/` | — | Log in, returns JWT plus role |
| POST | `/auth/token/refresh/` | — | Refresh an access token |
| POST | `/auth/register/` | — | Create a staff account (+ institution, create or join) |
| GET | `/institutions/` | — | Public institution directory (for join-at-signup, and offline verification caching) |
| GET/POST | `/learners/` | JWT | List / register learners |
| GET | `/learners/{id}/` | JWT | Learner detail |
| GET | `/learners/{id}/records/` | JWT | A learner's issued records |
| POST | `/records/issue/` | JWT | Issue and sign a new academic record |
| GET | `/records/{id}/` | JWT | Record detail plus QR payload (scoped to the issuing institution) |
| POST | `/verify/` | optional | Verify a presented record (online) |
| POST | `/verify/sync/` | optional | Re-submit offline-verified records for the audit log |
| GET | `/analytics/summary/` | JWT (admin) | Institution or platform-wide activity summary |

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18.18+ and npm
- PostgreSQL 14+ running locally (or a connection string to one)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/nakuwa23/daleel-records-system.git
cd daleel-records-system
```

### 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Create the PostgreSQL database.** Adjust the name/user/password below
to your liking — they just need to match what you put in the `.env` file:

```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE daleel_db;
CREATE USER daleel_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE daleel_db TO daleel_user;
\q
```

**Generate a Django secret key.** With the venv still active (so `django`
is importable), run:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the printed string for use below.

**Create `backend/.env`** with that key and your database credentials:

```
SECRET_KEY=paste-the-generated-key-here
DEBUG=True
DB_NAME=daleel_db
DB_USER=daleel_user
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

**Apply migrations, create an admin user, and run the server:**

```bash
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin and platform-wide analytics
python manage.py runserver
```

The API now serves at `http://127.0.0.1:8000`.

### 3. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app serves at `http://localhost:3000` and expects the API at
`http://127.0.0.1:8000` (`API_BASE` in `frontend/src/lib/api.js` — change
it there if your backend runs elsewhere).

### 4. First-time flow

1. Visit `http://localhost:3000/register`, choose **Issuer staff**, and
   **Create new** institution — this generates that institution's
   Ed25519 keypair.
2. Register a learner, then issue them a record.
3. Open the record's detail page to see its QR code.
4. Visit `/verify` (as any user, or logged out) and scan or paste the
   record to confirm it verifies as authentic.
5. To exercise offline verification: load `/verify` once while online
   (caching the institution directory into IndexedDB), then disable the
   network and verify the same record again.
