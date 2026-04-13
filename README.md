# Hostel Room Allocation System

Full-stack starter scaffold for a DBMS college project.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Express + TypeScript + Prisma
- Database: MySQL

## Project Structure

```text
ROOM_ALLOCATION/
  client/
  server/
  database/
  docs/
```

## Quick Start

1. Install dependencies in both apps:
   - `cd client && npm install`
   - `cd ../server && npm install`
2. Create a MySQL database named `hostel_room_allocation`.
3. Copy `server/.env.example` to `server/.env` and fill in your DB URL.
4. Start the backend:
   - `cd server`
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
   - optional sample data: `npm run prisma:seed`
   - `npm run dev`
5. Start the frontend:
   - `cd client`
   - `npm run dev`

## Local Checks

- API health: `http://localhost:4000/api/dashboard/health`
- Dashboard summary: `http://localhost:4000/api/dashboard/summary`
- Local testing guide: `docs/local-testing.md`

## Deployment

- Frontend target: Vercel
- Backend target: Railway
- Database target: Railway MySQL

### Frontend env

- copy `client/.env.example` to `client/.env`
- set `VITE_API_BASE_URL`

### Backend env

- copy `server/.env.example` to `server/.env`
- set `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN`

## MVP Modules

- Authentication
- Students
- Hostels
- Rooms
- Allocations
- Complaints
- Fees
- Reports dashboard
