# Local Testing Guide

## Start the app

Backend:

```powershell
cd "C:\Users\VIRAJ KALE\Desktop\ROOM_ALLOCATION\server"
npm.cmd run dev
```

Frontend:

```powershell
cd "C:\Users\VIRAJ KALE\Desktop\ROOM_ALLOCATION\client"
npm.cmd run dev
```

## Useful local URLs

- Frontend: `http://localhost:5173`
- API root: `http://localhost:4000`
- API health: `http://localhost:4000/api/dashboard/health`
- Dashboard summary: `http://localhost:4000/api/dashboard/summary`

## Demo login

- Email: `admin@hostel.local`
- Password: `admin123`

## Quick test flow

1. Log in to the dashboard.
2. Add a student.
3. Add a hostel and room.
4. Create an allocation.
5. Raise a complaint.
6. Add a fee record.
7. Open reports and dashboard pages to verify counts and summaries.

