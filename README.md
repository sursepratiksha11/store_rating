# Shelfie — Store Rating Platform
Stack: **Express.js + PostgreSQL** (backend) · **React + Vite** (frontend)

## Run it
1. Create a database:  `createdb shelfie`
2. Backend
   ```
   cd backend && cp .env.example .env     # edit DATABASE_URL / JWT_SECRET
   npm install && npm run migrate && npm run seed && npm run dev
   ```
3. Frontend (new terminal)
   ```
   cd frontend && npm install && npm run dev
   ```
4. Open http://localhost:5173 — default admin: `admin@shelfie.com` / `Admin@12345`
