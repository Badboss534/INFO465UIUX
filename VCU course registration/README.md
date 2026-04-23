# VCU Course Registration Portal for Summer 2026

Updated Web APplication that allows Virginia Commonwealth University students and instructors to search, enroll in, and manage Summer 2026 course registrations

---
## Team

INFO 465 — UI/UX Design & Development, Spring 2026

- Tasrique - Frontend like Website UI/UX
- Viana - Backend like Database and Chatbox AI
- Omer - 
- Christian - 

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Frontend Pages](#frontend-pages)
- [Backend API](#backend-api)
- [Database](#database)
- [AI Chatbots](#ai-chatbots)
- [Getting Started](#getting-started)
- [CI/CD Pipeline](#cicd-pipeline)

---

## Overview

This portal supports:

- **Student login** via student ID with a personalized registration dashboard
- **Instructor login** via email to view rosters and sessions
- **Course search** with filters for department, keyword, and modality
- **Enrollment management** with business rule enforcement (6-class limit, 18-credit cap, no duplicates, capacity checks)
- **Two AI chatbot assistants** for registration help and general VCU questions

Live backend: `http://13.217.196.158:3000`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express v5 |
| ORM | Prisma |
| Database | PostgreSQL |
| AI | Anthropic Claude API |
| Seed Data | Faker.js |
| Testing | Jest |
| Linting | JSHint |
| CI/CD | GitLab CI |

---

## Project Structure

```
INFO465UIUX/
├── VCU course registration/
│   ├── frontend/                  # All client-side files
│   │   ├── home.html
│   │   ├── login.html
│   │   ├── instructor-login.html
│   │   ├── course.html
│   │   ├── course-details.html
│   │   ├── registration.html
│   │   ├── instructor.html
│   │   ├── footer.html
│   │   ├── styles.css
│   │   ├── chatbot.js             # Registration AI chatbot
│   │   ├── ram-chatbot.js         # General-purpose Ram chatbot
│   │   └── footer.js
│   ├── src/
│   │   └── server.js              # Express API server
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seed.js                # Seed script (Faker.js)
│   │   └── migrations/
│   ├── package.json
│   └── prisma.config.ts
├── validatePalindrome.js          # Utility (CI test target)
├── validatePalindrome.test.js
├── package.json                   # Root Jest config
└── .gitlab-ci.yml
```

---

## Frontend Pages

All pages are static HTML served from the `frontend/` directory with shared CSS.

| File | Purpose |
|---|---|
| `home.html` | Landing page — hero section, feature cards, registration stats |
| `login.html` | Student login — authenticates by student ID number |
| `instructor-login.html` | Instructor login — authenticates by email address |
| `course.html` | Public course search — filter by keyword and department |
| `course-details.html` | Individual course page — lists all sessions with seat availability |
| `registration.html` | Student dashboard — "My Courses" and "Add a Course" tabs (requires login) |
| `instructor.html` | Instructor dashboard — session list and roster management |
| `footer.html` | Shared footer component injected via `footer.js` |

### Styling

`styles.css` defines the full design system:

- **Colors:** VCU gold `#C9A84C`, black `#0D0D0D`, plus CSS variables for surface and text
- **Fonts:** DM Sans (body), EB Garamond (headings)
- **Components:** cards, pills, seat availability bars, modals, skeleton loaders, responsive nav
- **Breakpoint:** `≤860px` for mobile layout

---

## Backend API

`src/server.js` is an Express v5 API running on **port 3000**. It uses Prisma Client for all database queries and CORS is enabled for frontend access.

### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/login/student` | Authenticate student by ID |
| `POST` | `/login/instructor` | Authenticate instructor by email |
| `GET` | `/departments` | List all departments |
| `GET` | `/courses` | List all courses (filterable by `department`) |
| `GET` | `/sessions` | List all sessions (filterable by `keyword`, `department`) |
| `GET` | `/sessions/:id` | Get a single session |
| `GET` | `/sessions/:id/roster` | Get enrolled students for a session |
| `GET` | `/students/:id/enrollments` | Get all enrollments for a student |
| `GET` | `/instructors/:id/sessions` | Get all sessions for an instructor |
| `POST` | `/enrollments` | Enroll a student in a session |
| `DELETE` | `/enrollments` | Drop a student from a session |
| `POST` | `/ai/chat` | Proxy to Claude API for chatbot requests |

### Enrollment Business Rules

The `POST /enrollments` endpoint enforces the following before confirming registration:

- Student cannot exceed **6 enrolled classes**
- Student cannot exceed **18 total credits**
- Student cannot enroll in the **same course twice**
- Session must have **available capacity**

---

## Database

The database is managed with **Prisma ORM** backed by **PostgreSQL**.

### Schema (`prisma/schema.prisma`)

| Model | Key Fields |
|---|---|
| `Department` | `code`, `name`, `school` |
| `Course` | `code`, `title`, `description`, `credits`, `prerequisites`, `departmentId` |
| `Session` | `sectionId`, `courseId`, `instructorId`, `meetingDays`, `startTime`, `endTime`, `modality`, `capacity`, `enrollmentCount` |
| `Student` | `studentNumber`, `name`, `email`, `virginiaResident`, `homeCountry` |
| `Instructor` | `name`, `email`, `departmentId` |
| `Enrollment` | `studentId`, `sessionId`, `enrollmentDate`, `status` |

### Seeding (`prisma/seed.js`)

The seed script uses **Faker.js** to generate realistic test data:

- 4 departments: INFO, MKTG, ACCT, FINA
- 9 instructors
- Multiple courses with sessions across modalities (in-person, online, hybrid)
- Sample student accounts with existing enrollments

Run the seed:

```bash
cd "VCU course registration"
npx prisma db seed
```

### Migrations

```bash
npx prisma migrate dev
```

Two migrations exist:
- `20260402` — initial schema
- `20260407` — field additions and refinements

---

## AI Chatbots

### Registration Chatbot (`frontend/chatbot.js`)

Available only on `registration.html` for logged-in students.

- Gold FAB button (bottom-right corner)
- Reads `currentUser` and `enrolledSessions` from the page to build a dynamic system prompt with full student context
- Validates time conflicts, credit limits (18 max), and class limits (6 max) client-side before enrolling
- Parses `[SUGGEST:sessionId]` tags from Claude responses to render inline **Add / Skip** buttons for direct enrollment without a page reload
- Conversation capped at 40 messages

### Ram Chatbot (`frontend/ram-chatbot.js`)

Available on all public pages except `registration.html`.

- VCU mascot (Ram) avatar with VCU-branded black and gold header
- 4 quick-reply suggestion buttons shown on first open (hidden after first use)
- Chat history persists via `sessionStorage` — resets when the browser is closed
- Answers general VCU questions and guides users to the right pages

### AI Proxy

Both chatbots POST to `/ai/chat` on the backend, which proxies the request to the **Anthropic Claude API**. The API key is stored server-side in an environment variable and is never exposed to the client.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Anthropic API key

### Installation

```bash
# Clone the repo
git clone https://github.com/Badboss534/INFO465UIUX.git
cd INFO465UIUX

# Install backend dependencies
cd "VCU course registration"
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and fill in:
#   DATABASE_URL=postgresql://user:password@localhost:5432/vcu_registration
#   ANTHROPIC_API_KEY=your_key_here

# Run database migrations
npx prisma migrate deploy

# Seed the database with sample data
npx prisma db seed

# Start the API server
node src/server.js
```

The API will be available at `http://localhost:3000`. Open any HTML file from `frontend/` in your browser (or serve with a static file server).

### Running Tests

From the repository root:

```bash
npm test
```

---

## CI/CD Pipeline

Defined in `.gitlab-ci.yml` with three jobs:

| Job | Tool | What it checks |
|---|---|---|
| `test` | Jest | Unit tests for `validatePalindrome.js` |
| `jshint` | JSHint | Static analysis of all JavaScript files; outputs `jshint-report.txt` |
| `secret_detection` | GitLab SAST | Scans for accidentally committed secrets or credentials |

---
