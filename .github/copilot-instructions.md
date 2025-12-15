# Copilot Instructions for Projet-js

## Big Picture Architecture
- **Frontend**: Static HTML/CSS/JS files in the project root (e.g., `index.html`, `login.html`, `feed.js`, etc.).
- **Backend**: Node.js/Express app in `backend/` folder. Handles API routes, database migrations, and serves static files.
- **Database**: PostgreSQL, with migrations and schema management in `backend/*.sql` and `backend/server.js`.
- **API Routes**: RESTful endpoints under `/api/*` (auth, users, posts, messages, friends, content).
- **Frontend/Backend Integration**: Frontend fetches data from backend API endpoints (see `server.js` for route mapping).

## Developer Workflows
- **Start Backend**: From `backend/`, run `npm start` or `node server.js` (port 3000).
- **Database Setup**: On server start, migrations run automatically (see `initializeDatabase` in `server.js`).
- **Frontend**: Open HTML files directly or serve via backend static server.
- **Testing**: No formal test suite; see `test-api.js` and `test-db.js` for manual test scripts.
- **Debugging**: Console logs are used for error reporting. Uncaught exceptions and rejections are logged in `server.js`.

## Project-Specific Patterns
- **Controllers**: All business logic is in `backend/controllers/*Controller.js`.
- **Routes**: API endpoints are defined in `backend/routes/*.js` and mounted in `server.js`.
- **Middleware**: Auth logic in `backend/middleware/auth.js`.
- **Migrations**: Database schema changes are handled in `server.js` and `backend/migrations/*.sql`.
- **Static Files**: Served from project root via Express static middleware.
- **User Profile Fixes**: See `PROFILE_PHOTO_FIX.md` and `PROFILE_UPDATE_FIX.md` for manual update instructions.

## Integration Points & Dependencies
- **PostgreSQL**: Connection config in `backend/config/db.js`.
- **Authentication**: JWT-based, see `authController.js` and `middleware/auth.js`.
- **Password Hashing**: Uses `bcryptjs`.
- **External Libraries**: Express, body-parser, cors, jsonwebtoken, pg.

## Examples
- To add a new API route: create a controller in `controllers/`, a route in `routes/`, and mount it in `server.js`.
- To update the database schema: add SQL to `migrations/` or update logic in `initializeDatabase` in `server.js`.
- To debug backend: add `console.log` statements or check error logs in terminal.

## Key Files & Directories
- `backend/server.js`: Main backend entry, migrations, API route mounting.
- `backend/controllers/`: Business logic for each resource.
- `backend/routes/`: API route definitions.
- `backend/config/db.js`: Database connection config.
- `backend/migrations/`: SQL migration scripts.
- `PROFILE_PHOTO_FIX.md`, `PROFILE_UPDATE_FIX.md`: Manual profile update instructions.
- `test-api.js`, `test-db.js`: Manual test scripts.

---
If any section is unclear or missing, please specify what needs improvement for your workflow.
