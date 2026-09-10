# Deployment guide

This project is split into two parts:

1. GitHub Pages hosts the frontend static site.
2. A Node/Express API hosts the shared user data.

## 1) Deploy the API

Use Render (free tier is enough for this project):

1. Push this repository to GitHub.
2. In Render, create a New Web Service from the repository.
3. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`
4. Save the service and copy the public URL.

Example URL:

`https://live-with-me-api.onrender.com/api`

## 2) Update the frontend API URL

Create a local `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Then replace the placeholder with the Render URL:

```env
VITE_API_BASE_URL=https://live-with-me-api.onrender.com/api
```

## 3) Rebuild and redeploy the frontend

```bash
npm run build
npm run deploy
```

After this, the live site will use the public API for shared custom cards and saved boards.

## 4) Test the shared flow

1. Log in with an email on one browser/device.
2. Create or save cards and boards.
3. Log in again with the same email on another device.
4. Verify the same cards and boards appear.
