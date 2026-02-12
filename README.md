# Sportz 📣

**Sportz** is a small demo server that combines a REST API and WebSocket pub/sub for live match events and commentary.

---

## 🔧 Tech stack

- **Node.js** (ESM)
- **Express 5** for HTTP REST endpoints
- **ws** for WebSocket server
- **Postgres** + **drizzle-orm** for database access
- **zod** for request validation
- **@arcjet/node** for optional request protection (rate limiting / bot detection)
- **pnpm** as package manager

---

## ⚙️ Functionality

- CRUD-ish REST endpoints for **matches** and **commentary** (create/list)
- WebSocket pub/sub for live updates:
  - `type: "match_created"` messages broadcast globally when a match is created
  - `type: "commentary"` messages broadcast to subscribers of a specific match
- Validation with clear error responses (Zod)
- Optional Arcjet security middleware for HTTP and WS protection

---

## 📁 Important files

- `src/index.js` - app bootstrap and HTTP server
- `src/routes/matches.js` - match endpoints
- `src/routes/commentary.js` - commentary endpoints
- `src/ws/server.js` - WebSocket server, subscription management, broadcasting
- `src/db` - DB connection and schema (Drizzle)
- `src/validation` - Zod schemas

---

## 🚀 Quick start

1. Install dependencies:

```bash
pnpm install
```

2. Create a `.env` file with the required environment variables (see below).

3. Run migrations (if using DB):

```bash
pnpm db:migrate
```

4. Start in dev mode:

```bash
pnpm dev
```

5. Server will run at `http://localhost:8000` by default.

---

## 🔐 Environment variables

Create a `.env` file in the project root with the following variables:

- `DATABASE_URL` (required) — Postgres connection string (e.g., `postgres://user:pass@localhost:5432/dbname`)
- `PORT` (optional) — HTTP port (default: `8000`)
- `HOST` (optional) — Host (default: `0.0.0.0`)
- `ARCJET_KEY` (optional, required if using Arcjet) — API key for Arcjet
- `ARCJET_MODE` (optional) — `LIVE` or `DRY_RUN` (default: `LIVE`)

Example `.env`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/sportz
PORT=8000
ARCJET_KEY=
ARCJET_MODE=DRY_RUN
```

---

## API — Key endpoints

- List matches:
  - GET `/matches`
- Create match:
  - POST `/matches`
  - Body: see `src/validation/matches.js`
- Create commentary for a match (namespace includes match id):
  - POST `/matches/:id/commentary`
  - Body example:

```json
{
  "minute": 42,
  "sequence": 1,
  "period": "2nd half",
  "eventType": "goal",
  "actor": "Player Name",
  "team": "home",
  "message": "Scored",
  "metadata": { "assist": "Teammate" },
  "tags": ["goal"]
}
```

Notes:

- Validation is strict (e.g., `minute` must be a number). If you see a Zod error, inspect the `details` in the response.
- Ensure you POST to `/matches/1/commentary` where `1` is a real match ID.

---

## WebSocket pub/sub (test using Postman / WebSocket client) 🔁

1. Open Postman → **New** → **WebSocket Request**.
2. Connect to `ws://localhost:8000/ws`.
3. You should receive a welcome message:

```json
{ "type": "welcome" }
```

4. Subscribe to a match (JSON text message):

```json
{ "type": "subscribe", "matchId": 1 }
```

Expected response:

```json
{ "type": "subscribed", "matchId": 1 }
```

5. Create a commentary via HTTP POST to `/matches/1/commentary` (see body example above).

6. If broadcasting is configured, the WebSocket client receives:

```json
{
  "type": "commentary",
  "data": {
    /* commentary object */
  }
}
```

Enabling commentary broadcasts: the WebSocket server exposes a `broadcastCommentary(matchId, comment)` function. To enable the commentary route to use it, add this line to `src/index.js` after `attachWebSocketServer(server)`:

```js
const { broadcastMatchCreated, broadcastCommentary } =
  attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;
```

---

## Development & utilities

- Start: `pnpm dev`
- Start (production): `pnpm start`
- Lint: `pnpm lint`
- Drizzle: `pnpm db:generate | db:migrate | db:studio`

---

## Troubleshooting

- Port already in use: change `PORT` or stop the other process.
- Zod validation errors: check the `details` array in the 400 response for missing/invalid fields.
- WebSocket not receiving events: ensure you called `subscribe` with integer `matchId` (number, not string) and that `app.locals.broadcastCommentary` is set.

---

## 💬 Contributing

Create issues or PRs. Keep changes focused and add tests where appropriate.

## References

- JavaScript Mastery: https://www.youtube.com/watch?v=I1V9YWqRIeI&t=11280s
