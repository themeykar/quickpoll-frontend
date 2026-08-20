# QuickPoll — Frontend

This is the interface for QuickPoll — a real-time polling app. Create a poll, share the link, and watch votes roll in live. No refreshing, no signup.

## Who it's for

Anyone who wants a fast opinion poll without the friction of an account. Standups, live audiences, group chats settling an argument. Open the link, vote, done.

## Why it exists

Built as a hands-on way to actually learn WebSockets instead of just reading about them. And honestly, watching a bar chart update itself in real time never really gets old.

## Tech stack

- **React** + **Vite**
- **Tailwind CSS**
- **Framer Motion** — for the animated result bars
- **react-router-dom**
- Connects to a separate Django backend over REST and WebSocket

## Quick Start

```bash
git clone <quickpoll-frontend>
cd quickpoll-frontend
npm install
```

Create a `.env` file:

```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

Then:

```bash
npm run dev
```

Runs at `http://localhost:5173`. Make sure the backend is running too (see the backend README) — this app can't do anything on its own, it's just a UI on top of the API.

## How voting actually works

Open a poll link, type in a name, tap an option. That's it. Behind the scenes, a random anonymous ID gets generated and stored in your browser so you can't vote twice on the same poll. No account, no password, nothing to remember.

## How the live results work

The moment you land on the results screen, it opens a WebSocket connection to the backend and joins that poll's live feed. When anyone votes — including people in other tabs, other devices, wherever — the bars animate to the new numbers automatically. Nobody refreshes anything.

## Creating and managing a poll

Creating a poll gives you two links: one to share (for voting), and one private link to manage the poll (close it whenever you want). Don't mix those up — the management link has a token in the URL that only you should have. Losing it means losing the ability to close that poll, since there's no login to recover it through.

## Known limitations

- **No poll history.** If you lose both links (voting and management), that poll is effectively gone to you, even though it still lives on the server.
- **Currency-style limitation, but for votes:** clearing your browser storage lets you vote again on a poll you already voted on. Not designed to stop determined cheating — just casual double-voting.
- **No reconnect logic (yet) if the WebSocket drops mid-session.** If your connection genuinely dies, you'd need to refresh to reconnect. Results shown before the drop stay accurate, they just stop updating live until you refresh.
- **Max 6 options per poll.** Not a technical limit, just a design call to keep voting cards readable.

## License

MIT.

