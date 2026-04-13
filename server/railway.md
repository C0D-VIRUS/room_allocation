# Railway Deployment Notes

Set these variables in Railway:

- `PORT`
- `NODE_ENV=production`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `DATABASE_URL`

Recommended:

- `CORS_ORIGIN=https://your-frontend-domain.vercel.app`
- `DATABASE_URL` should point to the Railway MySQL instance

Railway can run the backend with:

- Build command: `npm install && npm run build`
- Start command: `npm run start`

