# SwitchOn — Project Management Dashboard

**Company Project 2 · **

A frontend-only project management dashboard built with React and TypeScript.
SwitchOn gives a team one place to see every project it is running, how far each one
has progressed, which tasks are late, and what is due next — and to create and
move tasks through the workflow.

There is no backend, database or authentication. All data is fetched over HTTP
from a static mock API, and anything the user creates or edits is layered on top
and kept in the browser

---

## Live application

|              |                                            |
| ------------ | ------------------------------------------ |
| Deployed app | _add your Vercel URL here after deploying_ |
| Repository   | _add your GitHub URL here after pushing_   |

---

## Features

### Dashboard (`/dashboard`)

- Totals for projects, active projects, completed projects and projects on hold
- Totals for tasks, completed tasks, in-progress tasks and overdue tasks
- Overall completion rate across the portfolio
- Upcoming deadlines for the next 14 days, plus anything already late, covering
  both project deadlines and individual task deadlines
- Per-project progress bars derived from each project's task list
- A tasks-by-status breakdown and a recent-activity feed
- A sortable portfolio table summarising every project

### Projects (`/projects`)

- Every project as a card showing client, description, tags, team, progress and
  deadline
- Search across name, client, description and tags (debounced by 250 ms)
- Filter by status — All / Active / On Hold / Completed — with live counts
- Sort by deadline, progress or name
- The status filter is stored in the URL (`/projects?status=active`), so filtered
  views can be linked to and survive a refresh
- Press <kbd>/</kbd> anywhere on the page to jump into the search box, and
  <kbd>Esc</kbd> to clear it

### Project details (`/projects/:projectId`)

- Project information, client, tags and full description
- Start date, due date, a plain-English timeline ("Due in 9 days") and an overdue
  task count
- Progress bar based on completed vs total tasks
- The project's tasks, filterable by status, each with an inline status control
- Team members with the number of tasks each has completed
- The project's recent activity

### Task management

- Create a task from anywhere via **New task** in the header, or from a project
  page via **Add task**
- A fully controlled form with validation on title, project and due date
- Set status, priority, assignee and due date on creation
- Update status, priority, assignee and due date from the task detail page, or
  move a task one step along the workflow with a single button
- Edit any task through the same form

### Task details (`/tasks/:taskId`)

- Full task information with status, priority and an overdue flag
- Breadcrumbs back to the parent project
- Inline controls for every editable field

### Workflow

```
To Do → In Progress → In Review → Completed
```

### Light and dark mode

- The whole interface is themed in both light and dark
- With no saved choice the app follows the operating system, and keeps following
  it if that setting changes while the tab is open
- The header toggle saves an explicit choice to `localStorage`
  (`switchon.theme.v1`); double-clicking it hands control back to the system
- An inline script in `index.html` applies the theme before first paint, so a
  dark-mode visitor never sees a flash of the light theme
- Every text/background pair on every route was checked against WCAG AA
  (4.5:1 body text, 3:1 large text) in both themes

### States

Every data-driven view handles all three states:

- **Loading** — skeleton cards and spinners while the mock API responds (it has a
  deliberate 700 ms delay so the loading states are visible)
- **Error** — a message plus a **Try again** button that re-runs the request
- **Empty** — distinct copy for "no projects match your filters" (with a clear
  button), "this project has no tasks yet", "nothing in this status", and an
  unknown project or task id

---

## Technologies used

| Area       | Choice                                   |
| ---------- | ---------------------------------------- |
| Framework  | React 19 (function components only)      |
| Language   | TypeScript 5 (strict mode)               |
| Build tool | Vite 8                                   |
| Styling    | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| Routing    | React Router 7                           |
| Linting    | oxlint                                   |
| Hosting    | Vercel                                   |

### Required technical features — where to find each one

| Requirement                           | Where                                                                                                                                                                                           |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Function components                   | Every component in `src/components` and `src/pages`                                                                                                                                             |
| TypeScript interfaces and typed props | `src/types/index.ts`, and the props interface at the top of each component                                                                                                                      |
| Typed function arguments and events   | `ChangeEvent<HTMLSelectElement>` in `src/components/TaskCard.tsx`, `FormEvent<HTMLFormElement>` in `src/components/TaskForm.tsx`                                                                |
| Tailwind CSS                          | `src/index.css` plus utility classes throughout                                                                                                                                                 |
| Responsive design                     | Mobile-first layouts; a collapsible nav in `src/components/Navbar.tsx`                                                                                                                          |
| React Router, multiple pages          | `src/App.tsx`                                                                                                                                                                                   |
| API / mock data fetching              | `src/api/client.ts` fetching `public/api/*.json`                                                                                                                                                |
| Loading, error and empty states       | `src/components/StateViews.tsx`, used by every page                                                                                                                                             |
| Controlled form with validation       | `src/components/TaskForm.tsx`                                                                                                                                                                   |
| `useState`                            | Filters, form values, dialog visibility — e.g. `src/pages/Projects.tsx`                                                                                                                         |
| `useEffect`                           | Fetching in `src/hooks/useFetch.ts`; keyboard listener in `src/pages/Projects.tsx`                                                                                                              |
| `useContext` for global state         | `src/context/` + `src/hooks/useWorkspace.ts`; a second context in `src/context/ThemeProvider.tsx` + `src/hooks/useTheme.ts` drives light/dark                                                   |
| Custom hooks                          | `useFetch`, `useWorkspace`, `useTheme`, `useLocalStorage`, `useDebouncedValue`, `useDocumentTitle`, `useDashboardStats`, `useProjectProgress`, `useUpcomingDeadlines`                           |
| Practical `useRef`                    | <kbd>/</kbd> focuses the search input (`src/pages/Projects.tsx`); focus capture and restore in `src/components/Modal.tsx`; skipping the redundant first write in `src/hooks/useLocalStorage.ts` |
| Lazy loading                          | `ProjectDetail` and `TaskDetail` are `React.lazy` imports behind a `Suspense` boundary in `src/App.tsx` — they build into their own JS chunks                                                   |

---

## Routes

| Route                  | Page                                           |
| ---------------------- | ---------------------------------------------- |
| `/`                    | Landing page with an overview of the workspace |
| `/dashboard`           | Portfolio dashboard                            |
| `/projects`            | Project list with search, filter and sort      |
| `/projects/:projectId` | Project details (lazy loaded)                  |
| `/tasks/:taskId`       | Task details (lazy loaded)                     |
| `*`                    | 404 page                                       |

---

## Data source

The app talks to a **mock API**: four static JSON documents served from
`public/api/`, requested with `fetch` exactly as a real HTTP endpoint would be.

| Endpoint             | Contents                                        |
| -------------------- | ----------------------------------------------- |
| `/api/projects.json` | 7 projects across active, on-hold and completed |
| `/api/tasks.json`    | 35 tasks spread across those projects           |
| `/api/members.json`  | 8 team members                                  |
| `/api/activity.json` | 18 activity entries                             |

`src/api/client.ts` requests all four in parallel, adds a 700 ms delay so the
loading states are observable, and rejects on a non-`ok` response so the error
state can be exercised.

**New and updated data.** Tasks the user creates or edits are held in React
state via the Context API and mirrored into `localStorage` under the key
`switchon.workspace.v1`. On load, saved changes take precedence over the fetched
tasks, so work survives a refresh. **Reset demo data** in the header clears the
saved copy and returns to the data served by the mock API.

Progress percentages, overdue counts and deadline lists are never stored — they
are derived from the task list every render, so they stay correct as soon as a
task changes.

---

## Project structure

```
src/
├── api/client.ts              Mock API client
├── components/                Reusable UI (cards, badges, modal, form, states)
├── context/                   Workspace context + provider (global state)
├── hooks/                     useFetch, useWorkspace, useLocalStorage, useStats, …
├── pages/                     Home, Dashboard, Projects, ProjectDetail, TaskDetail, NotFound
├── types/index.ts             Shared domain types
├── utils/                     Date helpers and status label/style maps
├── App.tsx                    Routes + Suspense boundary
└── main.tsx                   Entry point: Router → Provider → App
public/api/                    The mock API's JSON documents
```

---

## Setup instructions

**Requirements:** Node.js 20.19+ (or 22.12+) and npm.

```bash
git clone <your-repository-url>
cd company-project-2
npm install
npm run dev
```

The dev server runs at <http://localhost:5174>.

### Available scripts

| Command           | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                       |
| `npm run build`   | Type-check with `tsc -b`, then build to `dist/` |
| `npm run preview` | Serve the production build locally              |
| `npm run lint`    | Run oxlint                                      |

---

## Deploying to Vercel

1. Push the repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Vercel detects Vite automatically — build command `npm run build`, output
   directory `dist`.
4. Deploy.

`vercel.json` rewrites all non-`/api` paths to `index.html`, so opening a deep
link such as `/projects/p1` directly returns the app instead of a 404.

---

## Accessibility notes

- Every control has a visible label or an `aria-label`, and focus is visible
  throughout
- The create/edit dialog traps Tab, closes on Escape, moves focus to the first
  field on open and returns it to the trigger on close
- Loading regions use `role="status"`, errors use `role="alert"`
- Progress bars expose `role="progressbar"` with the current value
- Filter buttons report their state with `aria-pressed`
