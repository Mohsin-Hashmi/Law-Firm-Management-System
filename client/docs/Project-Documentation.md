## Law Firm Management System — Project Documentation

### 1. Executive Summary
The Law Firm Management System is a multi-tenant web platform for law firms to manage firms, lawyers, clients, cases, appointments, documents, and billing. It provides role-based access control (Super Admin, Firm Admin, Lawyer, Client), responsive dashboards, and secure file handling.

### 2. Architecture Overview
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Ant Design components, Redux Toolkit for state.
- Backend: Node.js (Express), Sequelize ORM, MySQL/PostgreSQL (via Sequelize), JWT-based auth, role/permission middleware.
- File storage: Local `uploads/` served statically with CORS.
- Deployment: Docker support for server (Dockerfile, ECS task), Vercel/Next for client.

High-level flow:
- User authenticates → receives JWT cookie → requests hit API with CORS + cookies → backend enforces roles/permissions → returns data consumed by Redux store and pages.

### 3. Tech Stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS, Ant Design, `next-themes`, `react-hot-toast`.
- State: Redux Toolkit (slices for user, firm, lawyers, clients, cases).
- Backend: Express, Sequelize, bcryptjs, cors, cookie-parser, dotenv.
- Charts: `recharts`.
- Icons/UI: Ant Design icons.

### 4. Monorepo Structure
- `client/` Next.js app (App Router).
  - `src/app/(pages)/` route groups for Super Admin and Firm Admin features.
  - `src/app/components/` shared UI (Header, Footer, DashboardLayout, stats cards, modals, sidebar nav).
  - `src/app/store/` Redux slices and provider.
  - `src/app/service/` API wrappers.
  - `src/app/utils/` constants/helpers; `globals.css` for global styles.
  - `public/images/` assets.
- `server/` Express API.
  - `src/routes/` route modules: `user`, `superAdmin`, `admin`, `client`, `case`, `lawyer`, `role`.
  - `src/controllers/` request handlers.
  - `src/models/` Sequelize models and associations.
  - `src/middlewares/` auth, permission checks.
  - `src/migrations/` schema changes.
  - `uploads/` static files for documents and profile images.

### 5. Environment & Configuration
- Frontend env:
  - API base URL constants in `client/src/app/utils/constant.ts`.
  - Next config in `client/next.config.ts`.
- Backend env (via `.env`):
  - `PORT`, `DATABASE_URL` or individual DB vars, `JWT_SECRET`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `FRONTEND_ORIGIN`.
  - CORS allowed origins are assembled in `server/src/app.js`.

### 6. Database Schema (Sequelize)
Key entities (based on migrations/models):
- Users, Roles, Permissions, RolePermissions
- Firms, UserFirm mapping, Firm status
- Lawyers, Clients (linked to Users)
- Cases, CaseLawyers, CaseDocuments (with uploader, file paths)

Relations (typical):
- User 1..* UserFirm ..* Firm
- Firm 1..* Lawyer, Firm 1..* Client, Firm 1..* Case
- Case ..* CaseDocuments, Case ..* CaseLawyers ..* Lawyer
- Role ..* RolePermissions ..* Permission; User belongs to Role

### 7. Authentication, Authorization & Multi‑tenancy
- Auth: JWT stored in cookies; login/signup via `/auth` routes.
- Multi-tenant hint: middleware extracts subdomain (`req.firmSubdomain`) for tenant scoping if required by routes.
- Authorization: `middlewares/checkPermission.js` & `constants/permissions.js` enforce resource-level actions. Super Admin routes are isolated under `/super-admin`; firm-scoped routes under `/firm-admin`. Client and Lawyer access restricted by role.

### 8. Backend API Surface (High-level)
Base: `server/src/app.js`
- `GET /` healthcheck
- `POST /auth/login`, `POST /auth/signup`, `POST /auth/logout`, `GET /auth/me` (in `routes/user.js`)
- Super Admin (`/super-admin`): manage firms, lawyers, clients, platform stats (see `routes/superAdmin.js`)
- Firm Admin (`/firm-admin`):
  - Firms, users, roles, permissions
  - Clients: CRUD, list, details (`routes/client.js`)
  - Cases: CRUD, list, details, documents (`routes/case.js`)
  - Admin: switching firms, role assignment (`routes/admin.js`)
- Lawyers (`/lawyers`): lawyer resources
- Roles (`/roles`): role and permission endpoints

Note: Refer to controller files for parameter details and shapes:
- `src/controllers/*.controller.js` implement input validation, DB operations, and responses.

### 9. Frontend Application Structure
- Routing (App Router):
  - Public marketing pages: `page.tsx`, `our-services`, `about-us`.
  - Auth pages: `auth/`.
  - Dashboards:
    - `/dashboard` (role-based view selection: Firm Admin, Lawyer, Client, others)
    - Super Admin: `/super-admin/dashboard`, `/super-admin/get-firms`, `/super-admin/get-lawyers`, `/super-admin/get-clients`, cases views, details pages.
    - Firm Admin: clients, lawyers, cases CRUD: `/get-clients`, `/get-lawyers`, `/get-cases`, detail & edit routes, upload documents.

- Shared UI:
  - `DashboardLayout`: responsive sidebar + header, theme toggle, firm switch.
  - Stats components: `FirmStats`, `LawyerStats`, `ClientView`, `PlatformStats`.
  - Modals: assign role, view firms, reset password, status modals.
  - Sidebar: `components/sidebar/NavLinks*` (permissions gated).

### 10. State Management
- Redux slices: `userSlice`, `firmSlice`, `lawyerSlice`, `clientSlice`, `caseSlice`.
- Provider wrapper: `src/app/store/Providers.tsx`.
- API calls: `src/app/service/*API.tsx` centralize axios/fetch usage; actions dispatched to slices on success.

### 11. UI/UX & Responsiveness
- Tailwind mobile-first responsive classes across pages.
- Header: mobile hamburger menu.
- Dashboard sidebar: collapsible & mobile overlay.
- Tables: wrapped with `overflow-x-auto` + AntD `scroll={{ x: 'max-content' }}` for horizontal scroll on narrow devices.
- Images: responsive `next/image` usage with constrained sizes.

### 12. File Uploads
- Case documents uploaded to `server/uploads/case-documents/` (and clients/lawyers folders), served via `GET /uploads/...` with CORS.
- Frontend pages: upload via `upload-case-documents`, view via `get-case-documents` modal/table.

### 13. Error Handling & Logging
- Global error handler in Express returns JSON 500 with message and error.
- Client toasts (react-hot-toast) for success/failure UX.

### 14. Security Considerations
- CORS restricted to configured origins.
- Cookies with `trust proxy` enabled for secure deployments.
- Passwords hashed with bcrypt.
- Role/permission checks on sensitive routes.

### 15. Deployment
- Server: Dockerfile and `ecs-task-def.json` for AWS ECS; environment variables injected at runtime.
- Client: Next.js deployable to Vercel; Tailwind build; dark mode supported.

### 16. Local Development
1) Server
```
cd server
cp .env.example .env  # create and fill required envs
npm install
npm run dev
```
2) Client
```
cd client
npm install
npm run dev
```

### 17. Testing Guidance
- Manual testing across roles: Super Admin, Firm Admin, Lawyer, Client.
- Verify permissions on CRUD endpoints.
- Validate document upload/view/delete flows.
- Responsiveness checks: 360px, 768px, 1024px, 1280px.

### 18. Performance & Accessibility
- Use pagination and server-side filtering where applicable.
- Ensure alt text on images; sufficient color contrast in dark mode.
- Avoid layout shifts with fixed image sizes.

### 19. Troubleshooting
- CORS errors: confirm `FRONTEND_ORIGIN` and allowedOrigins in `server/src/app.js`.
- Auth issues: check cookies, JWT secret, reverse proxy headers.
- DB connection: validate `.env` and Sequelize config.
- Missing uploads: verify `/uploads` static path and file permissions.

### 20. API Endpoint Catalog (Quick Index)
Note: Exact signatures in route files; below is a quick index by resource.
- Auth: `/auth/login`, `/auth/signup`, `/auth/logout`, `/auth/me`.
- Firms (Super Admin): list, detail, create/update status, delete.
- Lawyers: list, detail, create, update status, delete; firm scoped under `/firm-admin`, platform under `/super-admin`.
- Clients: list, detail, create, update status, delete; firm and platform scopes similar to lawyers.
- Cases: list, detail, create, update, assign lawyers, delete.
- Case Documents: list, upload, delete; static served from `/uploads`.
- Roles & Permissions: create roles, list/set permissions, assign to users.

### 21. Glossary
- Firm: tenant/business entity using the system.
- Case: legal case record belonging to a firm.
- Client: a customer of the firm; may upload/view documents per permission.
- Lawyer: legal professional within a firm.
- Super Admin: platform-wide administrator.
- Firm Admin: tenant admin with full access to their firm.

### 22. Change Log (Template)
- v1.0.0: Initial release — core CRUD, dashboards, uploads, RBAC, responsive UI.

### 23. How to Export This Documentation to PDF
Option A (VS Code/Editor):
- Open this file and print to PDF (File → Print → Destination: Save as PDF).

Option B (CLI, using `puppeteer` or `wkhtmltopdf`):
- Convert Markdown to HTML (e.g., `marked`, `pandoc`) then to PDF.
  - Pandoc example:
  ```
  pandoc client/docs/Project-Documentation.md -o client/docs/Project-Documentation.pdf --from gfm --pdf-engine=wkhtmltopdf
  ```

Option C (Browser):
- View the Markdown rendered in a Markdown preview and Print → Save as PDF.

---
Maintainers: Uptech Sol Internship — Law Firm Management System
License: Proprietary (or fill in as applicable)




