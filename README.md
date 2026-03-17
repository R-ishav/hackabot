# UniVent

**UniVent** is a campus event management website created for the *easy management of events on campus*.

It helps college societies and students manage campus events in one place: society admins can publish events, and students can explore events, register, and navigate to the event venue using the website.

## Key Features

### Society Admins
- List/publish events with important details (title, description, date/time, venue, etc.)
- Keep event information updated for students

### Students
- Browse upcoming campus events
- View complete event details
- Register for events through the website
- Navigate to the venue (via map links)

## Tech Stack

- **React** — frontend UI
- **Vite** — fast dev server + build tool
- **ESLint** — linting / code quality

## Getting Started (Local Setup)

### 1) Install dependencies
```bash
npm install
```

### 2) Start the development server
```bash
npm run dev
```

Vite will print a local URL (commonly `http://localhost:5173`). Open it in your browser.

## Build & Preview

### Production build
```bash
npm run build
```

### Preview production build locally
```bash
npm run preview
```

## Scripts

- `npm run dev` — run locally in development mode
- `npm run build` — create an optimized production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

## Notes / Future Improvements

- Role-based authentication (Society Admin vs Student)
- Admin dashboard for managing events and registrations
- Capacity limits, waitlists, and registration confirmations
- Calendar integration and reminders
- Better venue support using coordinates + embedded maps

## Hackathon Context

This project was built for the Hackabot hackathon.
