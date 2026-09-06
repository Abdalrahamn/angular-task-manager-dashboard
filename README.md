# Task Manager

An Angular 21 task-management dashboard for creating, prioritising, assigning, filtering, moving, and completing work. It uses a local json-server API so the assignment can be run and assessed without external services.

## Requirements and quick start

- Node.js 22 (the pinned npm version is declared in `package.json`)

```bash
corepack npm install
corepack npm run data       # refresh generated task fixtures and db.json
corepack npm run start:all  # API at :3000 and app at :4200
```

Open `http://localhost:4200`. To run each process separately, use `npm run start:api` and `npm start`.

`data-fetching/generate-data.js` is the supplied generator. `data-fetching/prepare-db.js` converts its task and statistics output into the json-server `db.json` shape. json-server exposes `/tasks` and `/statistics`.

### Environment configuration

The local API base URL is configured in `src/environments/environment.ts` and defaults to `http://localhost:3000`. Keep it aligned with the port passed to `start:api` if the backend port changes. This assignment currently has one environment file; there are no secrets or external service credentials to configure.

## Implemented features

- Dashboard statistics derived from the current tasks, search across title and description, status tabs, priority and assignee filters, and clear-filter feedback.
- Kanban columns with same-column reordering and cross-column status changes through drag and drop or the accessible task action menu.
- Create and edit dialogs, delete confirmation, dynamic tags, loading skeletons, empty states, retryable read errors, and mutation notifications.
- Analytics for completion rate, overdue rate, status, priority, and tasks per assignee. Chart.js is deferred until the analytics content is rendered.
- Team summaries derived from task assignees, including assigned, in-progress, and completed counts.
- Responsive desktop/mobile navigation. `/calendar` and `/settings` are intentional placeholder routes, while `/tasks` provides a focused create-task entry point and directs users to the dashboard board.

## Data and API contract

json-server returns arrays directly rather than the wrapped `TasksResponse` and `StatisticsResponse` examples in `DATA_README.md`:

- `GET /tasks` returns `Task[]`; `POST /tasks`, `PUT /tasks/:id`, `PATCH /tasks/:id`, and `DELETE /tasks/:id` provide CRUD operations.
- `GET /statistics` returns `Statistic[]`. It supplies card metadata and historical change labels; live metric values are calculated from `/tasks`.

A task contains the following fields:

- `id`, `title`, and `description`: strings.
- `status`: `todo`, `in_progress`, or `done`.
- `priority`: `low`, `medium`, or `high`.
- `dueDate`, `createdAt`, and `updatedAt`: date/ISO date strings.
- `completedAt`: an ISO date string or `null`; it is set when a task moves to Done and cleared when it leaves Done.
- `isOverdue`: an optional derived boolean for an open task whose due date has passed.
- `assignee`: an object containing `id`, `name`, `avatar`, and `email`.
- `tags`: a string array.

The task form requires non-whitespace title and description values, a priority, status, due date, and an assignee. New tasks cannot use a past due date; an existing overdue task can still be edited. Tags are dynamic and optional after blank values are trimmed out.

## Commands

| Command                           | What it does                                              |
| --------------------------------- | --------------------------------------------------------- |
| `npm run lint`                    | Runs ESLint on Angular source and templates.              |
| `npm run format:check`            | Verifies Prettier formatting.                             |
| `npm test`                        | Runs the unit and component suite once.                   |
| `npm run test:coverage`           | Runs the suite with its enforced coverage thresholds.     |
| `npm run test:e2e`                | Runs focused Playwright browser smoke tests.              |
| `npm run build`                   | Produces the production build.                            |
| `npx playwright install chromium` | Installs the local browser once before running E2E tests. |

The browser suite starts the app and API itself. It covers CRUD, search/filter feedback, status persistence through the UI, delete confirmation/removal, and mobile navigation. Tests create and delete their own task, so they do not require a specific fixture record.

## Architecture

```
src/app/
  core/       application shell, interceptors, notification service
  features/   lazy dashboard, analytics, team, task, and placeholder routes
  shared/     task data access/store, models, validators, dialogs, reusable UI
e2e/          focused Playwright smoke coverage
```

`TaskStoreService` is the stable task-domain façade consumed by components, rather than the owner of every task concern. `TaskFilterStore`, `TaskBoardStore`, `TaskActivityStore`, and `TaskMutationService` respectively own filter state, local/optimistic board state, activity history, and write lifecycle/error handling. This keeps the component API small while giving future domains such as comments or projects a focused place to grow. Pure filtering, grouping, ordering, activity seeding, and analytics calculations remain in `task-store.helpers.ts`.

### Signals, state, and HTTP

Signals are a good fit for the local, synchronous view state: filters and activity are writable signals; board columns, statistics, assignees, and analytics are computed from them and the task resource. This makes dependencies explicit and keeps OnPush templates subscription-free.

NgRx would add actions, reducers, effects, selectors, and global ceremony for a single aggregate with a small mutation surface. The store service is deliberately the simpler boundary here.

`httpResource` serves the read model for `GET /tasks` and `GET /statistics`, including loading and error state. `HttpClient` performs POST, PUT, PATCH, and DELETE because writes need explicit completion and failure handling. Mutation failures show a notification; read failures render a retryable inline state. Cross-column moves optimistically update the board, then restore the server order and reload if the PATCH fails. Same-column order is local because the API has no rank field.

### Cache contract

The GET interceptor caches successful responses for 30 seconds and retries failed GETs once. It never invalidates on a write. `TaskService` is the sole invalidation owner: a successful task write evicts and reloads only `/tasks` (including item/query variants). `/statistics` is generated, independent historical data, so task CRUD does not evict it. An explicit read retry evicts and reloads both resources. Writes are never automatically retried.

Current dashboard metrics are derived from the task board, so they reflect task changes immediately. The separate statistics resource is retained for its external/historical role rather than treated as mutable task state.

### Styling, responsiveness, accessibility, and performance

Tailwind is used for layout, spacing, responsive utilities, and small common states. SCSS holds design tokens, component-specific styling, pseudo-elements, and more complex visual rules. The responsive layout keeps the desktop sidebar at large widths, switches to drawer navigation on narrower screens, stacks controls on mobile, and allows the Kanban board to scroll horizontally rather than compress cards below usable widths.

Accessibility decisions include a skip link and landmarked main content, labelled native form controls, visible focus rings, Angular Material dialog focus handling, a live notification area, semantic buttons, and a keyboard-operable action menu. The Playwright smoke suite verifies the mobile navigation path.

Performance measures include lazy feature routes, OnPush components, signals/computed derivation, tracked lists, a deferred Chart.js view, scoped GET caching, and no unnecessary statistics refetch after task mutations.

## Testing and CI

The testing pyramid is intentionally small at the browser layer: colocated unit/component/service tests protect domain logic, forms, cache behavior, dialogs, view states, application bootstrap, provider wiring, and every lazy route loader; Playwright validates the highest-risk user journey in a real browser. Coverage enforces 100% statements, branches, functions, and lines without excluding bootstrap, configuration, or route files, while behavioral regression protection remains the priority.

GitHub Actions (`.github/workflows/ci.yml`) runs on pushes and pull requests targeting `main`: clean install, formatting, linting, coverage tests, production build, and Chromium smoke tests.

### Error and failure behavior

- A failed GET is retried once. If it still fails, the affected task, team, or analytics view shows an inline error state with a Retry action.
- Writes are not retried automatically, which avoids duplicate mutations. Create/edit, delete, and status failures show a user notification and leave the dialog or UI available for another attempt.
- Cross-column moves are optimistic; a failed status PATCH rolls the task back and refreshes server state.
- The mutation service prevents concurrent task writes while one request is pending.

### Last verified quality status

Verified locally on 2026-09-07 with Node.js 22:

- `npm test`: 40 test files and 139 tests passed; 100% statements, branches, functions, and lines.
- `npm run lint`: passed with no lint errors.
- `npm run build`: production build passed; the initial bundle was 634.18 kB and remained within the configured 650 kB warning and 1 MB error budgets.
- `npm run test:e2e`: all applicable browser journeys passed. The desktop project runs the CRUD journey, and the mobile project runs the responsive-navigation journey; each project deliberately ignores the other project's non-applicable journey.

No unit-test, browser-test, lint, or production-build failures were present at the time of this review.

## Known limitations and future improvements

- json-server has no task ranking field, so same-column drag order is intentionally session-local.
- `/statistics` is source data rather than an endpoint updated by task CRUD; current dashboard metrics are therefore derived from `/tasks`.
- The assignment has no tablet/mobile Figma frames; those layouts extend the supplied desktop visual language.
- Calendar and Settings are placeholders, and users are derived from task data rather than managed through a dedicated `/users` endpoint.
- Authentication, authorization, server-side validation, pagination, and multi-user synchronization are outside the mock-backend scope.
- Natural next steps are persisting a rank field, adding dedicated user/calendar/settings APIs, adding an Angular production environment file, and running accessibility and Lighthouse audits in CI.

## Submission notes

Husky runs lint-staged before commits and commitlint for conventional commit messages. The project includes a `.gitignore` for generated output, dependencies, coverage, and editor/cache files. Before submitting from a fresh clone, run the quality commands above and configure the repository remote for the intended host.

## License

Assignment / evaluation use.
