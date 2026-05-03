TEAM TASK MANAGER

A full-stack Team Task Management application built with 
FastAPI and React.


FEATURES

- Authentication: JWT-based login/signup.
- RBAC: Admin and Member roles.
- Projects: Admins can create projects and add members.
- Tasks: Create, assign, and track task status 
         (Todo -> In Progress -> Completed).
- Dashboard: Real-time stats - total projects, tasks, 
             pending, overdue.
- Task Detail: Dedicated page with inline editing for 
               due date and assignee.


                   SYSTEM DESIGN

ARCHITECTURE OVERVIEW

+----------------------------------------------------------+
|                    CLIENT (Browser)                       |
|                                                          |
|   React (Vite) + React Router + Axios + Lucide Icons     |
|                                                          |
|   Pages:                                                 |
|   +----------+ +-----------+ +------------+ +--------+  |
|   |  Login   | | Dashboard | |  Project   | |  Task  |  |
|   |  Signup  | |  (Stats)  | |  Details   | | Detail |  |
|   +----------+ +-----------+ +------------+ +--------+  |
|                       |                                  |
+----------------------------------------------------------+
                        | HTTP (REST API)
                        | Authorization: Bearer <JWT>
+----------------------------------------------------------+
|                  SERVER (FastAPI)                         |
|                       |                                  |
|   +-------------------v----------------------+           |
|   |           CORS Middleware                |           |
|   +-------------------+----------------------+           |
|                       |                                  |
|   +-------------------v----------------------+           |
|   |         JWT Auth Middleware               |           |
|   |   (get_current_user / check_admin)        |           |
|   +-------------------+----------------------+           |
|                       |                                  |
|   +---------+ +-------v---+ +----------+ +-----------+  |
|   |  Auth   | | Projects  | |  Tasks   | | Dashboard |  |
|   | Routes  | |  Routes   | |  Routes  | |  Routes   |  |
|   +----+----+ +-----+-----+ +----+-----+ +-----+-----+  |
|        |            |            |              |        |
|   +----v------------v------------v--------------v-----+  |
|   |              CRUD Layer (crud.py)                  |  |
|   +------------------------+--------------------------+  |
|                            |                             |
|   +------------------------v--------------------------+  |
|   |          SQLAlchemy ORM (models.py)                |  |
|   +------------------------+--------------------------+  |
|                            |                             |
+----------------------------+-----------------------------+
                             |
                    +--------v--------+
                    |   SQLite / DB   |
                    |   (sql_app.db)  |
                    +-----------------+


DATABASE SCHEMA (ER Diagram)
--------------------------------------------------------------

+----------------------+       +--------------------------+
|        users         |       |        projects          |
+----------------------+       +--------------------------+
| id (PK)              |       | id (PK)                  |
| email (UNIQUE)       |<--+   | name                     |
| hashed_password      |   |   | description              |
| full_name            |   +---| owner_id (FK -> users.id) |
| role (admin/member)  |       +-----------+--------------+
+----------+-----------+                   |
           |                               |
           |    +---------------------+    |
           |    |  project_members    |    |
           |    |  (Association Table)|    |
           |    +---------------------+    |
           +----| user_id (FK)        |    |
                | project_id (FK)     |----+
                +---------------------+

+--------------------------------+
|            tasks               |
+--------------------------------+
| id (PK)                       |
| title                         |
| description                   |
| status (todo/in_progress/     |
|         completed)            |
| priority (low/medium/high)    |
| due_date                      |
| created_at                    |
| project_id (FK -> projects.id)|
| assignee_id (FK -> users.id)  |
+--------------------------------+


API ENDPOINTS
--------------------------------------------------------------

  Method   Endpoint                    Auth  Role   Description
  ------   --------                    ----  ----   -----------
  POST     /auth/signup                No    Any    Register new user
  POST     /auth/login                 No    Any    Login, returns JWT
  GET      /auth/me                    Yes   Any    Get current user info
  GET      /dashboard/stats            Yes   Any    Dashboard statistics
  GET      /projects                   Yes   Any    List user's projects
  POST     /projects                   Yes   Admin  Create a new project
  POST     /projects/{id}/members      Yes   Admin  Add member to project
  POST     /projects/{id}/tasks        Yes   Any    Create task in project
  GET      /tasks/{id}                 Yes   Any    Get task details
  PUT      /tasks/{id}                 Yes   Any    Update task (partial)


ROLE-BASED ACCESS CONTROL (RBAC)
--------------------------------------------------------------

  ADMIN:
    [Y] Create projects
    [Y] Add members to projects
    [Y] Create / update / assign tasks
    [Y] Set due dates
    [Y] View dashboard and all project data

  MEMBER:
    [Y] View assigned projects
    [Y] Create tasks in projects
    [Y] Update task status
    [N] Cannot create projects
    [N] Cannot add/remove members
    [N] Cannot assign tasks or set due dates


REQUEST FLOW
--------------------------------------------------------------

  User Action (e.g. "Create Task")
          |
          v
  React Component --> Axios API call
          |
          v
  Axios Interceptor (attaches JWT token)
          |
          v
  FastAPI receives request
          |
          v
  CORS Middleware --> JWT Dependency (validates token)
          |
          v
  Route Handler --> CRUD function --> SQLAlchemy --> SQLite
          |
          v
  Pydantic schema validates response --> JSON returned
          |
          v
  React updates UI state


==============================================================
                        TECH STACK
==============================================================

  Backend:    FastAPI, SQLAlchemy, SQLite, Pydantic, 
              python-jose (JWT), passlib (bcrypt)
  Frontend:   React (Vite), React Router, Axios, 
              Lucide Icons, Vanilla CSS
  Deployment: Docker (multi-stage build), Railway-ready


==============================================================
                   SETUP & INSTALLATION
==============================================================

  Backend:
    1. cd backend
    2. python -m venv venv
    3. venv\Scripts\activate  (Windows)
       source venv/bin/activate  (Mac/Linux)
    4. pip install -r requirements.txt
    5. python main.py

  Frontend:
    1. cd frontend
    2. npm install
    3. npm run dev


==============================================================
                       DEPLOYMENT
==============================================================

This app is configured for Railway. Simply connect your 
GitHub repo and Railway will use the provided Dockerfile 
to build and deploy.

Set the environment variables in your Railway service 
settings before deploying.


==============================================================
                    PROJECT STRUCTURE
==============================================================

  Team Task Management/
  |-- backend/
  |   |-- .env                 (Environment variables)
  |   |-- main.py              (FastAPI app entry point)
  |   |-- models.py            (SQLAlchemy ORM models)
  |   |-- schemas.py           (Pydantic schemas)
  |   |-- crud.py              (Database operations)
  |   |-- auth.py              (JWT auth & RBAC helpers)
  |   |-- database.py          (DB engine & session config)
  |   +-- requirements.txt     (Python dependencies)
  |-- frontend/
  |   |-- src/
  |   |   |-- App.jsx          (Router & AuthContext)
  |   |   |-- api.js           (Axios instance & API)
  |   |   |-- index.css        (Global styles)
  |   |   +-- pages/
  |   |       |-- Login.jsx
  |   |       |-- Signup.jsx
  |   |       |-- Dashboard.jsx
  |   |       |-- ProjectDetails.jsx
  |   |       +-- TaskDetail.jsx
  |   |-- index.html
  |   +-- package.json
  |-- .gitignore
  |-- Dockerfile
  +-- README.md
