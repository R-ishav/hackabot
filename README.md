For the past few years, I haven't been able to share much on LinkedIn due to account restrictions. Now that I'm back, I'm excited to showcase some of the projects I've worked on throughout my journey.

One of them is UniVent, a campus event navigation platform that I built during my 2nd year.

The idea came from a problem I experienced firsthand as a student.

On most campuses, event information is scattered across WhatsApp groups, Instagram stories, posters, and word of mouth. Students often miss opportunities simply because they never hear about them in time. Event organizers struggle to reach the right audience, track registrations, and manage attendance efficiently.

I wanted to build a solution that could bring everything into one place.

Introducing UniVent 🚀

A centralized platform that helps students discover and participate in campus events while giving organizers the tools they need to manage them effectively.

What UniVent offers

For Students:
• Discover ongoing and upcoming events in one place
• Register instantly for events
• Receive digital tickets with QR codes
• View event details, venues, and locations

For Organizers:
• Create and publish events
• Upload posters and event details
• Manage registrations efficiently
• Scan and verify QR-code tickets during entry
• Export attendance records for analysis and reporting

Technologies Used
• React + Vite
• Tailwind CSS
• Node.js & Express.js
• MongoDB
• QR Code Generation & Verification
• Location Search & Mapping Features

What I learned while building it
• Developing a complete full-stack application from scratch
• Designing scalable backend APIs and database structures
• Managing file uploads and user-generated content
• Integrating QR-based ticketing workflows
• Creating smoother user experiences through continuous iteration
• Debugging real-world challenges involving API integrations, environment configurations, deployment issues, and authentication flows

More importantly, this project taught me how technology can solve everyday problems that students face.

Building UniVent was both challenging and incredibly rewarding, and it remains one of my favorite projects because it was inspired by a real need within the student community.

I'd be happy to share a demo or discuss the development process with anyone interested.


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
