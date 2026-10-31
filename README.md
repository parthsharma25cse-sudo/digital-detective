# Digital Detective — PromptWars × OUTLIER 2026

Detective-themed productivity app with an offline fictional demo and a Node backend supporting Google OAuth, Gmail metadata search, Drive metadata search, explicit approval, and post-action verification.

## Quick start

Requires Node.js 22+. From this folder:

```bash
npm install
npm run build
npm start
```

Open http://localhost:3001. **Demo mode works without credentials.** Open **Connected workspace** in the sidebar for the server-backed flow. The original **Investigation** navigation is a separate client-only demo.

For UI development, run `npm run dev` in one terminal and `npm run dev:server` in another. Vite development requires a proxy or direct backend origin for `/api` routes; the recommended working path is the production build served by Node.

## Configure Google OAuth

1. Create a Google Cloud project and enable **Gmail API** and **Google Drive API**.
2. Configure the OAuth consent screen and add test users while in testing mode. Gmail and Drive scopes may require Google verification for public release.
3. Create a **Web application** OAuth client with authorized redirect URI `http://localhost:3001/auth/callback`.
4. Copy `.env.example` to `.env`, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `APP_ORIGIN`. Start with `node --env-file=.env server/index.mjs` after building.
5. In **Connected workspace**, choose read-only or organization-capable connection. Read-only uses Gmail readonly and Drive metadata readonly; organization requests Gmail modify and broad Drive access. Review permissions carefully.

Do not put Google secrets in frontend variables. Live access tokens and refresh tokens are held only in server memory and are lost on restart. This is a limitation, not durable secure storage. Disconnect attempts token revocation and clears local session state.

## Architecture

- `src/main.tsx`: original polished detective-themed demo UI.
- `src/LiveWorkspace.tsx`: connected investigation and approval UI.
- `server/core.mjs`: input validation, mission plans, action schema, sample dataset, XP rules.
- `server/index.mjs`: Node HTTP server, OAuth callback, Google API adapters, action execution and verification.
- `tests/`: unit tests.

### HTTP routes

`GET /api/status`, `GET /auth/start`, `GET /auth/start?write=1`, `GET /auth/callback`, `POST /api/search`, `POST /api/propose`, `POST /api/execute`, `POST /api/disconnect`.

All mutations require same-origin requests. The approval token is single-use, expires after ten minutes, and is bound to the server session. XP is granted only if every requested operation is verified. Actions are limited to the evidence returned by that session's most recent search.

## Demo journey

Open **Connected workspace** → choose **Missing invoice** → search `invoice` → select a Gmail result → choose **Apply Gmail label** → enter `Investigated` → **Preview action** → explicitly check approval → **Execute and verify**. The app marks this **DEMO ONLY** and awards demo XP; it never claims to have modified Google data.

For a real Google journey, configure OAuth and choose **Connect with organization access** before searching and approving. The backend sends Gmail modify or Drive update requests and fetches the updated record to check the result.

## Tests

```bash
npm test
npm run typecheck
npm run build
```

## Known limitations — read before judging or deployment

- **Not production certified.** No external penetration test, live Google OAuth test, mocked integration test suite, or browser end-to-end suite has been completed.
- AI planning is deterministic and grounded in user keywords; **no LLM integration** has been implemented. No AI-generated evidence is presented as real.
- Sessions and tokens are in memory. This is suitable for a local single-process demo, **not** multi-instance or durable production deployment. A production release requires persistent encrypted session storage, session expiry and rotation, comprehensive audit persistence, and deployment-specific security review.
- Gmail metadata and Drive filenames are searched; Drive document content extraction is not implemented. Gmail pagination tokens are returned but not yet navigable in the UI. Drive search is filename-based.
- Live Gmail search requests metadata for up to 30 messages; the UI does not expose date/sender advanced filters. No background jobs or cancellation.
- Broad Drive write scope is needed by this implementation for moving arbitrary existing files; it should undergo a least-privilege redesign and Google scope review before public launch.
- The server's `GET /auth/start` causes an OAuth navigation; OAuth consent is always required before access. Google quotas and policy constraints apply.
- The original dashboard statistics are browser-local demo values, separate from the connected workspace's server-side XP and audit history.
- Action batches can partially succeed. The response and log distinguish partial/failed from verified; partial actions do not award XP.
- Demo-only action verification checks the in-memory sample workflow, not external state.
- No claim of 90+ scoring is made.

## Security notes

Google tokens never enter the React bundle or application logs. Google API requests use bearer tokens on the server. OAuth uses unpredictable session-bound state and consent. The app blocks cross-origin POST requests and requires an explicit approval token. Retrieved content is displayed as text, not interpreted as instructions. Never deploy the app over plain HTTP on a public host; use HTTPS, trusted reverse-proxy configuration, secure session infrastructure, and external security assessment.
