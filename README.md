# Parts search

React client for the Favorit parts price API. Type a part number to see the manufacturers that make it, then pick a manufacturer to see the offers for the part and its analogues: brand, number, name, warehouse, price and stock.

Stack: Vite, React, Redux Toolkit, Bootstrap CSS. No TypeScript.

## Run

```bash
npm install
cp .env.example .env.local
```

Set `FAVORIT_API_KEY` in `.env.local` to your API key, then start the dev server:

```bash
npm run dev
```

Open http://localhost:5173.

## Test

```bash
npm test
npm run lint
```

`npm test` runs Vitest with React Testing Library. The API is mocked with MSW, so no key or network is needed.

## API key

- The key lives only in `.env.local`, which is gitignored.
- The browser calls `/api/` on its own origin. The Vite dev proxy forwards the call to `http://api.favorit-parts.ru/hs/hsprice/` and adds the key on the server side.
- The key is never part of the client bundle. Do not prefix it with `VITE_`.
- `npm run build` produces static files only. Hosting them in production needs an equivalent server-side proxy for `/api/` that adds the key.
