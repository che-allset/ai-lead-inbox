# AI Lead Inbox

A small lead inbox. Visitors submit a form, Claude rates each lead as hot, warm or cold with a one-sentence reason, and a team member manages leads in a private dashboard.

*Live:* https://ai-lead-inbox-nu.vercel.app
(Dashboard login at /login. Test login sent separately.)

## Stack
•⁠  ⁠Next.js (App Router) + TypeScript
•⁠  ⁠Supabase: Postgres database and email/password auth
•⁠  ⁠Claude API (Haiku) for lead rating
•⁠  ⁠Vercel for hosting

## How it works
1.⁠ ⁠The public form posts to ⁠ /api/leads ⁠.
2.⁠ ⁠The server validates the input and saves the lead first, so a lead is never lost.
3.⁠ ⁠It then asks Claude for ⁠ {rating, reason} ⁠ as JSON and updates the row. If the AI call fails, the lead stays saved and shows as "unrated".
4.⁠ ⁠⁠ /dashboard ⁠ checks the session on the server and redirects to ⁠ /login ⁠ if there is none. Row Level Security in the database also allows only logged-in users to read or update leads.
5.⁠ ⁠The dashboard lists leads, filters by rating, and changes status (new / contacted / closed).

## Key files
•⁠  ⁠⁠ app/page.tsx ⁠: public form
•⁠  ⁠⁠ app/api/leads/route.ts ⁠: save lead + Claude rating
•⁠  ⁠⁠ app/login/page.tsx ⁠: login
•⁠  ⁠⁠ app/dashboard/ ⁠: lead list, status dropdown, logout
•⁠  ⁠⁠ lib/supabase-server.ts ⁠: server clients (user session and admin)

## Run locally
1.⁠ ⁠⁠ npm install ⁠
2.⁠ ⁠Create ⁠ .env.local ⁠ with ⁠ NEXT_PUBLIC_SUPABASE_URL ⁠, ⁠ NEXT_PUBLIC_SUPABASE_ANON_KEY ⁠, ⁠ SUPABASE_SERVICE_ROLE_KEY ⁠, ⁠ ANTHROPIC_API_KEY ⁠
3.⁠ ⁠Create the ⁠ leads ⁠ table in Supabase (columns: id, name, company, email, message, rating, reason, status, created_at) with RLS enabled
4.⁠ ⁠⁠ npm run dev ⁠

Test data only.