# VCU Course Registration — Change Log & Notes

## AWS Server (Team Member's Backend)

**Base URL:** `http://13.217.196.158:3000`

This is the deployed AWS server your team member set up. It hosts all API endpoints including the AI chatbot proxy. Keep this URL as-is — do not replace it with localhost.

**Endpoints available on the AWS server:**
- `POST /login/student` — login by student number
- `POST /login/instructor` — login by email
- `GET /departments` — all departments
- `GET /courses` — all courses (filter: `?department=CODE`)
- `GET /courses/:id` — single course with sessions
- `GET /sessions` — all sessions (filter: `?q=keyword&department=CODE`)
- `GET /sessions/:id/roster` — students enrolled in a session
- `GET /students/:id/enrollments` — a student's enrolled courses
- `GET /instructors/:id/sessions` — sessions taught by an instructor
- `POST /enrollments` — enroll a student (`{ studentId, sessionId }`)
- `DELETE /enrollments` — drop a course (`{ studentId, sessionId }`)
- `POST /ai/chat` — **Claude AI proxy** (`{ system, messages }`) — this is what the chatbot uses

---

## The AI Chatbot (chatbot.js)

**File:** `frontend/chatbot.js`

**How it works:**
- Self-contained script — injects its own CSS and HTML into any page it's loaded on
- Shows a gold circular floating button (FAB) in the bottom-right corner with a chat icon
- Clicking the button opens a full chat panel (black header, message bubbles, text input)
- On first open, it fetches all sessions from the AWS server and greets the student by name
- The student types naturally and the AI (Claude) responds with course suggestions
- When Claude wants to suggest a course it includes a `[SUGGEST:sessionId]` tag in its reply, which renders an "Add / Skip" course card in the chat
- Clicking "Yes, add this course" calls `POST /enrollments` on the AWS server and updates the registration page live

**Important:** `chatbot.js` requires two variables to already exist on the page:
- `currentUser` — the logged-in student object (set by `registration.html` after login)
- `enrolledSessions` — the student's current enrolled sessions array

This means the full AI chatbot only works properly on `registration.html` (post-login).
On all other pages, the **Ram** general-purpose chatbot (`ram-chatbot.js`) is used instead — see change #11.

**To add the chatbot to a page:** place this tag just before `</body>`:
```html
<script src="chatbot.js"></script>
```
Already added to: `registration.html`

---

## Changes Made

### 1. Global styles & branding
**Files:** `frontend/styles.css`, all HTML pages, `frontend/chatbot.js`
- **Logo**: Downloaded `VCU_Rams_logo.svg.png` and `VCU_Athletics_Logo.svg.png` locally; removed broken external URLs and `filter: brightness(0) invert(1)` that made logo appear white
- **Gold color**: Standardized to single value `#C9A84C` site-wide; removed `#7A6230` and `#E8C97A` variants; `--gold-dim` and `--gold-light` CSS variables both now point to `#C9A84C`
- **Fonts**: DM Sans for all body/UI text, EB Garamond for headings — applied globally via `styles.css`; `course-details.html` got the Google Fonts import it was missing
- **Text brightness**: Nav inactive links → `#ddd`; hero desc → `#fff`; stat labels → `#ddd`; footer → `#aaa`; italic removed from "Portal" hero title
- **CSS architecture**: `styles.css` rewritten as single global stylesheet — reset, `:root` vars, banner, nav, `.page`, cards, pills, tags, seat bars, alerts, skeleton, modal, footer, keyframes. Every page's `<style>` block reduced to page-specific overrides only
- **Banner height**: Increased from 64px → 101px; logo height 38px → 60px — changed once in `styles.css`, applies everywhere
- **Banner subtitles**: Each page's `<p>` under the portal title is now page-specific (e.g. `Home | Summer Session 2026`, `Course Search | Summer Session 2026`, etc.)

---

### 2. AI Chatbot (Ram) — global virtual assistant
**Files:** `frontend/ram-chatbot.js` (new), `frontend/registration.html`, all other HTML pages
- **Student chatbot** (`chatbot.js`): Added to `registration.html` — requires `currentUser` and `enrolledSessions` on the page; handles course suggestions and live enrollment via `POST /enrollments`
- **Ram chatbot** (`ram-chatbot.js`): Self-contained script added to all pages except `registration.html`; injects its own CSS and HTML; duplicate-load guard prevents double injection
- **UI**: Black header with VCU logo avatar, "Ram" name, "VCU Virtual Assistant" subtitle, green online dot; scrollable chat bubbles; 4 quick-reply buttons (hidden after first use); typing indicator (3 bouncing dots); footer shows "Registration closes May 15, 2026"
- **AI**: Text input connected to `POST /ai/chat` on the AWS server; conversation capped at 40 messages
- **Session behavior**: Chat history stored in `sessionStorage` — persists across page navigation within the same session, resets automatically when the browser or tab is closed
- **Position**: FAB fixed at `bottom: 72px; right: 28px` so it clears the footer links; panel opens above at `bottom: 148px`

---

### 3. Shared footer
**Files:** `frontend/footer.html` (new), `frontend/footer.js` (new), `frontend/styles.css`, all HTML pages
- Created `footer.html` as single source of truth (copyright + VCU.edu / Registrar / IT Help Desk links)
- `footer.js` fetches and injects `footer.html` into `#footer-placeholder` on every page at runtime; includes inline fallback if fetch fails
- Footer CSS in `styles.css`: dark black background, flex space-between, `#aaa` links with white hover; stacks vertically on ≤ 860px
- `body { display: flex; flex-direction: column; }` and `.page { flex: 1; }` in `styles.css` push footer to bottom on short pages

---

### 4. Home page
**File:** `frontend/home.html`
- **Notice strip**: Moved from below hero to directly under nav; "Sign in with your student ID to add or drop courses." is a gold underlined link to `login.html`
- **Hero stats panel**: Fixed full-width stretch by splitting `.hero` (full-width dark bg) and `.hero-inner` (centered `max-width: 1100px` grid) — stats box now aligns with the features section below
- **Dark/light balance**: Hero is a centered black card with `border-radius: 6px` and gold bottom border; cream `var(--surface)` shows on left and right sides; features section, white cards, and quick links use the light theme

---

### 5. Login pages
**Files:** `frontend/login.html`, `frontend/instructor-login.html`
- **Theme fix**: `.page-body` background changed from `var(--black)` to `var(--surface)`; aside text changed from `#fff/#bbb` to `var(--text)/var(--text-muted)`; notice cards changed from dark `#141414` to white with subtle shadow
- **Layout**: Asides compacted toward center — `.aside-left { justify-self: end }` and `.aside-right { justify-self: start }`, both capped at `max-width: 260px` so content doesn't stretch to screen edges
- **API**: Both pages use `http://13.217.196.158:3000` (fixed from localhost)

---

### 6. Course pages
**Files:** `frontend/course.html`, `frontend/course-details.html`
- **course.html**: Page width overridden to `max-width: 1210px` (~10% wider); search bar wrapped in a white `.search-area` card with shadow; inputs/buttons increased from 40px → 44px; dropdowns widened to 210px; table padding increased; "Sign in to add or drop courses." made a gold link to `login.html`
- **course-details.html**: `<section class="hero">` replaced with `<div class="page">` so `flex: 1` from `styles.css` applies and footer stays at the bottom

---

### 7. Instructor dashboard
**File:** `frontend/instructor.html`
- Removed hard redirect to `login.html` when no instructor session exists — page now opens freely for preview
- Shows empty state with "Sign in as instructor" link when not logged in
- Fixed API base URL from `http://localhost:3000` to `http://13.217.196.158:3000`

---

## Completed

- ✅ Ram AI chatbot on all public pages, connected to AWS `POST /ai/chat`
- ✅ Chat resets on browser close (sessionStorage); persists across page navigation within session
- ✅ Single global `styles.css` — no duplicate styles across pages
- ✅ Gold, fonts, banner height, and subtitles standardized across all pages
- ✅ Shared footer via `footer.html` + `footer.js`
- ✅ Instructor dashboard accessible without login (preview mode)
- ✅ All API URLs pointing to AWS server (`http://13.217.196.158:3000`)
