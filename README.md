# Smart Energy Saver — Eco Sparks

Responsive energy dashboard with appliance inventory, estimated electricity costs, energy insights, savings simulation, quick kWh/cost calculator, Ohm's law helper and a Gemini-powered Hindi/Hinglish-friendly electrical assistant.

## Local run
1. Install Node.js 20+.
2. Extract the ZIP and open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and add your key as `GEMINI_API_KEY=...`.
5. Run `npm start` and open `http://localhost:3000`.
6. Run `npm run check` for JavaScript syntax checks.

Never put the API key in `public/app.js`, never commit `.env`, and never send the key in chat. `.gitignore` excludes `.env`.

## Deploy on Render
- Create a GitHub repository and upload the extracted project **without any `.env` file or API key**.
- In Render choose New → Web Service and connect the repo. Build command: `npm install`; Start command: `npm start`; health check: `/api/health`.
- In Render → Environment add `GEMINI_API_KEY` with your key. Optionally set `GEMINI_MODEL` to a model available to your Google AI Studio account (default `gemini-2.5-flash`). Save and deploy.
- Open the Render `onrender.com` URL. `/api/health` should show `ok: true` and `aiConfigured: true`.

## Notes
- Energy = watts × quantity × hours ÷ 1000. Month assumes 30 days.
- The bill is a simplified estimate (kWh × user-entered rate); actual bills can include slabs, fixed charges, taxes, subsidies and adjustments.
- Appliance data stays in this browser unless the user sends a question to the AI; then up to 12 appliance names and usage summaries accompany the question.
- The server has basic in-memory rate limiting and request validation, not enterprise-grade abuse protection.
- AI is informational only. Stay away from live/exposed wiring and contact a qualified electrician for hazards.

## Language selector
Every page load and refresh opens the English / Hindi / Hinglish language chooser. It does not remember the choice across refreshes. The Change Language control in the header opens it again. Appliance data remains in browser localStorage. UI translations are in `public/language.js`.
