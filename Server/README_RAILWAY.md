# Railway Backend Deployment

This backend is an Express + Sequelize + MySQL service. Railway should deploy it from the `Server` directory.

## 1. Create Railway Services

1. Create a new Railway project.
2. Add a MySQL database service.
3. Add a backend service from the GitHub repository.
4. Set the backend service root directory to `Server`.
5. Generate a public domain for the backend service after it deploys.

## 2. Backend Variables

Add these variables to the backend service. Use Railway reference variables for the MySQL values:

```env
NODE_ENV=production
DB_HOST=${{ MySQL.MYSQLHOST }}
DB_PORT=${{ MySQL.MYSQLPORT }}
DB_USER=${{ MySQL.MYSQLUSER }}
DB_PASS=${{ MySQL.MYSQLPASSWORD }}
DB_NAME=${{ MySQL.MYSQLDATABASE }}
DB_DIALECT=mysql
JWT_SECRET=replace_with_a_long_random_secret
SUPER_ADMIN_EMAIL=demo-superadmin@example.com
SUPER_ADMIN_PASSWORD=replace_with_a_strong_demo_password
DUMMY_PASSWORD=replace_with_a_strong_demo_user_password
FRONTEND_ORIGIN=https://your-frontend-domain.vercel.app
STRIPE_SECRET_KEY=sk_test_replace_if_stripe_is_used
```

Do not set `PORT`; Railway provides it automatically.

If you prefer a single URL, set `MYSQL_URL=${{ MySQL.MYSQL_URL }}` instead of the individual `DB_*` variables.

## 3. Database Setup

The Docker entrypoint runs migrations automatically on startup.

Run seeders once after the first successful deploy:

```bash
npm run db:seed
```

You can run this from a Railway shell/CLI context so the production database variables are available.

## 4. File Uploads

The app writes uploaded files to `uploads/clients`, `uploads/lawyers`, and `uploads/case-documents`.

For a demo, attach a Railway volume to the backend at:

```text
/app/uploads
```

Railway volumes are mounted as root. If upload writes fail with permissions errors, set this backend variable:

```env
RAILWAY_RUN_UID=0
```

For longer-term production, move uploads to S3-compatible object storage.

## 5. Frontend Variable

Set this in the frontend host, for example Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.up.railway.app
```

Then redeploy the frontend. The backend `FRONTEND_ORIGIN` must match the deployed frontend origin exactly.
