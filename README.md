# RPromo — Staff Registration

App for the RPromo staffing agency to register and manage temp workers. Workers fill out a
**public registration form**; staff use an **admin dashboard** to filter by region/age/status,
mark someone "do not call again", generate a PDF, and reach out on WhatsApp.

The backend is a **.NET 8 API** (Minimal API + EF Core + SQLite), with real JWT auth for the
dashboard and photos saved to local disk. Built to be swappable: moving from SQLite to
PostgreSQL later is just a provider/connection-string change, no business logic touched.

## Architecture

```
Angular 20 (frontend)                         .NET 8 API (api/RPromo.Api)
  └── PeopleRepository (interface)             ├── /api/auth/login   (public)
        └── ApiPeopleRepository  ───HTTP───►    ├── /api/people       (list: auth · create: public)
              (JWT via interceptor)             ├── /api/people/{id}         (auth)
                                                 ├── /api/people/{id}/status  (auth)
                                                 ├── /api/people/{id}/do-not-call (auth)
                                                 └── /api/photos       (public)
                                                       ├── EF Core → SQLite (rpromo.db)
                                                       └── wwwroot/uploads/photos (photos)
```

- **Swapping the backend later** = write another `PeopleRepository` implementation and change
  **one line** in [`app.config.ts`](frontend/src/app/app.config.ts). Nothing else in the app changes.
- Frontend state via **Angular signals** ([`PeopleStore`](frontend/src/app/core/data/people-store.ts)).
- `apps-script/` stays in the repo as history (the previous Google Sheets/Apps Script backend).

## How to run

### 1. API
```bash
cd api
dotnet run --project RPromo.Api --urls http://localhost:5219
```
First run creates `rpromo.db` (SQLite) automatically. Default dev credentials: `admin` /
`rpromo` (configurable in [`appsettings.json`](api/RPromo.Api/appsettings.json) — in
production, prefer setting `Admin:PasswordHash` via environment variable/user-secrets instead
of plaintext `Admin:Password`).

Swagger at `http://localhost:5219/swagger`.

### 2. Frontend
```bash
cd frontend
npm install
npm start          # http://localhost:4200
npm run build      # production build in dist/
```

The API URL lives in [`src/environments/environment.ts`](frontend/src/environments/environment.ts)
(`apiUrl`, default `http://localhost:5219`).

**Tests:** `dotnet test` from `api/`.

## Routes

| Route | Access | What it is |
|---|---|---|
| `/register` | Public | Registration form (send the link to workers) |
| `/login` | Public | Dashboard sign-in (real username/password via API) |
| `/dashboard` | Protected | Filters, "do not call", PDF, WhatsApp |

## Notes

- **Auth:** real login against the API, JWT stored in `sessionStorage`, attached by
  `authInterceptor`; a 401 logs out and redirects to `/login`.
- **Photos:** resized in the browser before upload, saved to
  `api/RPromo.Api/wwwroot/uploads/photos`, served as static files.
- **Dates** travel as ISO strings (`yyyy-mm-dd`) end to end — same format the frontend already
  used, no type conversion in between.
