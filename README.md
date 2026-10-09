# Eco Sparks — Hackathon Build

Responsive Smart Energy Saver web app with appliance energy estimates, tariff-based bill estimates, usage mix charts, savings simulator, energy insights, action checklist, electrical calculators, Eco Sparks AI adviser, three language selector (English/Hindi/Hinglish), cream light theme, AMOLED black dark theme, user registration/login, separate admin login, account management, About Us, eco score, indicative carbon estimate, bill-to-bill usage comparison, prioritized action planner, audit CSV export, and a sample community challenge.

## Local run
- Node.js 20+
- `npm install`
- Set `GEMINI_API_KEY`, `GEMINI_MODEL`, `ADMIN_PASSWORD`, and a long random `SESSION_SECRET` in environment variables (or `.env` locally).
- `npm start`
- Visit `http://localhost:3000`

## Render
- Root directory blank when `package.json` is in repository root
- Build command `npm install`
- Start command `npm start`
- Health check `/api/health`
- Set the four environment variables in Render's Environment panel. Never commit secrets or put API keys in frontend code.

## Important limits
- Consumer numbers are identifiers; this demo does not verify utility-company accounts.
- The user store is JSON-file based and Render Free's filesystem is ephemeral. Use persistent PostgreSQL before relying on long-term account storage.
- Community leaderboard entries are illustrative demo data, not verified real households or savings.
- Eco score is a simple planning indicator, not a certified rating. CO₂ uses an indicative 0.70 kg/kWh factor; actual grid emissions vary. Usage comparison only compares user-entered bill readings and is not live monitoring.
- The audit report downloads as CSV. Estimates do not replace a utility bill or qualified electrician advice.
- No model guarantees zero AI failures; quotas and model availability vary.
