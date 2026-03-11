# Copilot Instructions for CampusProject

## Project Overview
- **Type:** React frontend (Vite) + Node.js backend (server.js)
- **Frontend:** Located in `src/` (main entry: `main.jsx`, root component: `App.jsx`)
- **Backend:** Node server in `server.js` (run with `node server.js`)
- **Static files:** Served from `public/` (uploads, assets)

## Key Workflows
- **Start server:** Use VS Code task "Restart Node Server" or run `node server.js` from workspace root.
- **Frontend dev:** Use Vite dev server (not explicitly documented; typically `npm run dev`).
- **Build:** Vite config in `vite.config.js`, Tailwind in `tailwind.config.js`, PostCSS in `postcss.config.js`.
- **Lint:** ESLint config in `eslint.config.js`.

## Architecture & Patterns
- **Component structure:**
  - UI components in `src/components/` (e.g., `Navbar.jsx`, `EventCard.jsx`)
  - Dashboards in `src/dashboards/` (e.g., `AdminDashboard.jsx`)
  - Shared data/constants in `src/data/constants.js`
- **Styling:** Tailwind CSS (`index.css`, `App.css`, config files)
- **Routing:** Not explicitly documented; check for React Router usage in `main.jsx` or `App.jsx`.
- **Modals:** Modal components (e.g., `EditUserModal.jsx`, `PosterModal.jsx`) follow a pattern of state-driven visibility and props for data.

## Conventions
- **File naming:** PascalCase for components, camelCase for variables/functions.
- **Assets:** Place images and static files in `src/assets/` or `public/`.
- **Uploads:** User-uploaded files go in `public/uploads/`.
- **No TypeScript:** Project uses plain JavaScript (see README).

## Integration Points
- **External dependencies:**
  - React, Vite, Tailwind, ESLint (see `package.json`)
  - Node.js for backend
- **Communication:** Frontend likely communicates with backend via HTTP (check `server.js` for API routes).

## Examples
- **Add a new component:** Place in `src/components/`, use PascalCase, import in `App.jsx` or relevant dashboard.
- **Update server logic:** Edit `server.js`, restart with VS Code task or `node server.js`.
- **Add a dashboard:** Place in `src/dashboards/`, link from `Navbar.jsx` or main app.

## References
- [src/components/](src/components/) for UI patterns
- [src/dashboards/](src/dashboards/) for dashboard structure
- [server.js](server.js) for backend logic
- [package.json](package.json) for dependencies/scripts
- [README.md](README.md) for Vite/React setup

---
_If any section is unclear or missing, please provide feedback to improve these instructions._
