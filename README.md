# Team Task Manager

A full-stack Team Task Management application built with FastAPI and React.

## 🚀 Features
- **Authentication**: JWT-based login/signup.
- **RBAC**: Admin and Member roles.
- **Projects**: Admins can create projects and add members.
- **Tasks**: Create, assign, and track task status (Todo → In Progress → Completed).
- **Dashboard**: Real-time stats — total projects, tasks, pending, overdue.
- **Task Detail**: Dedicated page with inline editing for due date and assignee.

## 🏗 System Design

### Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                    │
│                                                          │
│   React (Vite) + React Router + Axios + Lucide Icons     │
│                                                          │
│   Pages:                                                 │
│   ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌────────┐  │
│   │  Login   │ │ Dashboard │ │  Project   │ │  Task  │  │
│   │  Signup  │ │  (Stats)  │ │  Details   │ │ Detail │  │
│   └──────────┘ └───────────┘ └────────────┘ └────────┘  │
│                       │                                  │
└───────────────────────┼──────────────────────────────────┘
                        │ HTTP (REST API)
                        │ Authorization: Bearer <JWT>
┌───────────────────────┼──────────────────────────────────┐
│                  SERVER (FastAPI)                         │
│                       │                                  │
│   ┌───────────────────▼──────────────────────┐           │
│   │           CORS Middleware                │           │
│   └───────────────────┬──────────────────────┘           │
│                       │                                  │
│   ┌───────────────────▼──────────────────────┐           │
│   │         JWT Auth Middleware               │           │
│   │   (get_current_user / check_admin)        │           │
│   └───────────────────┬──────────────────────┘           │
│                       │                                  │
│   ┌─────────┐ ┌───────▼───┐ ┌──────────┐ ┌───────────┐  │
│   │  Auth   │ │ Projects  │ │  Tasks   │ │ Dashboard │  │
│   │ Routes  │ │  Routes   │ │  Routes  │ │  Routes   │  │
│   └────┬────┘ └─────┬─────┘ └────┬─────┘ └─────┬─────┘  │
│        │            │            │              │        │
│   ┌────▼────────────▼────────────▼──────────────▼─────┐  │
│   │              CRUD Layer (crud.py)                  │  │
│   └────────────────────┬──────────────────────────────┘  │
│                        │                                 │
│   ┌────────────────────▼──────────────────────────────┐  │
│   │          SQLAlchemy ORM (models.py)                │  │
│   └────────────────────┬──────────────────────────────┘  │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │
                ┌────────▼────────┐
                │   SQLite / DB   │
                │   (sql_app.db)  │
                └─────────────────┘
```

### Database Schema (ER Diagram)

```
┌──────────────────────┐       ┌──────────────────────────┐
│        users         │       │        projects           │
├──────────────────────┤       ├──────────────────────────┤
│ id (PK)              │       │ id (PK)                  │
│ email (UNIQUE)       │◄──┐   │ name                     │
│ hashed_password      │   │   │ description              │
│ full_name            │   └───│ owner_id (FK → users.id) │
│ role (admin/member)  │       └──────────┬───────────────┘
└──────────┬───────────┘                  │
           │                              │
           │    ┌─────────────────────┐   │
           │    │  project_members    │   │
           │    │  (Association Table)│   │
           │    ├─────────────────────┤   │
           └────│ user_id (FK)        │   │
                │ project_id (FK)     │───┘
                └─────────────────────┘

┌────────────────────────────────┐
│            tasks               │
├────────────────────────────────┤
│ id (PK)                       │
│ title                         │
│ description                   │
│ status (todo/in_progress/     │
│         completed)            │
│ priority (low/medium/high)    │
│ due_date                      │
│ created_at                    │
│ project_id (FK → projects.id) │
│ assignee_id (FK → users.id)   │
└────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/signup` | ✗ | Any | Register a new user |
| POST | `/auth/login` | ✗ | Any | Login, returns JWT |
| GET | `/auth/me` | ✓ | Any | Get current user info |
| GET | `/dashboard/stats` | ✓ | Any | Dashboard statistics |
| GET | `/projects` | ✓ | Any | List user's projects |
| POST | `/projects` | ✓ | Admin | Create a new project |
| POST | `/projects/{id}/members` | ✓ | Admin | Add member to project |
| POST | `/projects/{id}/tasks` | ✓ | Any | Create task in project |
| GET | `/tasks/{id}` | ✓ | Any | Get task details |
| PUT | `/tasks/{id}` | ✓ | Any | Update task (partial) |

### Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────────────┐
│                    ADMIN                         │
│                                                  │
│  ✓ Create projects                               │
│  ✓ Add members to projects                       │
│  ✓ Create / update / assign tasks                │
│  ✓ Set due dates                                 │
│  ✓ View dashboard & all project data             │
├─────────────────────────────────────────────────┤
│                    MEMBER                        │
│                                                  │
│  ✓ View assigned projects                        │
│  ✓ Create tasks in projects                      │
│  ✓ Update task status                            │
│  ✗ Cannot create projects                        │
│  ✗ Cannot add/remove members                     │
│  ✗ Cannot assign tasks or set due dates          │
└─────────────────────────────────────────────────┘
```

### Request Flow

```
User Action (e.g. "Create Task")
        │
        ▼
React Component → Axios API call
        │
        ▼
Axios Interceptor (attaches JWT token)
        │
        ▼
FastAPI receives request
        │
        ▼
CORS Middleware → JWT Dependency (validates token)
        │
        ▼
Route Handler → CRUD function → SQLAlchemy → SQLite
        │
        ▼
Pydantic schema validates response → JSON returned
        │
        ▼
React updates UI state
```

## 🛠 Tech Stack
- **Backend**: FastAPI, SQLAlchemy, SQLite, Pydantic, python-jose (JWT), passlib (bcrypt).
- **Frontend**: React (Vite), React Router, Axios, Lucide Icons, Vanilla CSS.
- **Deployment**: Docker (multi-stage build), Railway-ready.

## 📦 Setup & Installation

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. `pip install -r requirements.txt`
5. `python main.py`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Environment Variables (backend/.env)
```
DATABASE_URL=sqlite:///./sql_app.db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

## 🌐 Deployment
This app is configured for **Railway**. Simply connect your GitHub repo and Railway will use the provided `Dockerfile` to build and deploy.

Set the environment variables in your Railway service settings before deploying.

## 📁 Project Structure

```
Team Task Management/
├── backend/
│   ├── .env                # Environment variables
│   ├── main.py             # FastAPI app entry point & routes
│   ├── models.py           # SQLAlchemy ORM models
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── crud.py             # Database operations
│   ├── auth.py             # JWT auth & RBAC helpers
│   ├── database.py         # DB engine & session config
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Router & AuthContext
│   │   ├── api.js          # Axios instance & API methods
│   │   ├── index.css       # Global styles
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Signup.jsx
│   │       ├── Dashboard.jsx
│   │       ├── ProjectDetails.jsx
│   │       └── TaskDetail.jsx
│   ├── index.html
│   └── package.json
├── .gitignore
├── Dockerfile
└── README.md
```
