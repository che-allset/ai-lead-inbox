# AI Lead Inbox

A small lead-capture tool. Visitors fill in a public form, Claude scores each lead from 0 to 100, and the team works through them in a private dashboard. Visitors can follow their request on a private status page, with no account.

Live: https://ai-lead-inbox-nu.vercel.app
Dashboard: /dashboard (login required, test login shared separately)

## Stack
- Next.js (App Router, TypeScript), hosted on Vercel
- Supabase: Postgres database, Row Level Security, email and password login
- Claude API (Haiku) for lead scoring

## How it works
1. Public form: name, email, company (optional), timeline (required), budget (optional), message.
2. The API validates the input, then SAVES the lead first, then asks Claude to score it. If the AI fails, the lead is never lost and shows as "unrated".
3. Claude returns a score from 0 to 100 and a one-sentence reason. Code turns the score into a band: HOT 70 and above, WARM 35 to 69, COLD below 35.
4. The dashboard lists leads sorted by score, filters by rating, and lets the team set the status: new, contacted, closed.
5. The first time a lead becomes "contacted", a database trigger stamps contacted_at. That gives time to first contact.
6. Each lead has a private, unguessable link (/status/<token>) where the visitor sees Received, We are in touch, Closed.

## Hot lead logic
Claude gets a written rubric with four signals: need (is the problem specific), urgency (timeline and deadlines), budget, and fit (company, business email). Strong need and urgency scores 70 or more. Real interest without urgency scores 35 to 69. Vague, browsing, spam or test entries score below 35.

## Security
- Dashboard and updates need a login. Row Level Security blocks everyone else at the database.
- The secret key and the AI key are only used on the server.
- Lead text is treated as untrusted input inside the AI prompt (prompt injection defence).
- A hidden honeypot field quietly drops simple bots.
- All data in the demo is test data.

## Run locally
npm install
Create .env.local with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY and ANTHROPIC_API_KEY.
npm run dev

## Next steps
- Email alert to the team when a HOT lead arrives
- Rate limiting or a captcha on the form
- Retry button for unrated leads, search and pagination
- Check scores against real deals to tune the thresholds
