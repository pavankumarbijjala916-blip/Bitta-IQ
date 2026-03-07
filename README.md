# BATT IQ – Battery Health Monitoring System

AI-powered battery health monitoring and sustainable disposal recommendations.

## Tech stack

- **Vite** – Build tool
- **React** – UI
- **TypeScript** – Typing
- **Tailwind CSS** – Styling
- **shadcn/ui** – Components
- **Supabase** – Auth & database

## Local setup

1. Clone the repo and go to the project folder:
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. Install dependencies:
   ```sh
   npm i
   ```

3. Copy `.env.example` to `.env` and set your Supabase (and any other) variables.

4. Start the dev server:
   ```sh
   npm run dev
   ```

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build
- `npm run preview` – Preview production build
- `npm run lint` – Run ESLint

## Deploy

Build the app with `npm run build` and deploy the `dist` folder to your host (Vercel, Netlify, etc.).
