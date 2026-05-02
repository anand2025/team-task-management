from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import models, schemas, crud, auth, database
from database import engine

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Team Task Manager API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Routes
@app.post("/auth/signup", response_model=schemas.Token)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    crud.create_user(db=db, user=user)
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, email=form_data.email)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# Dashboard Route
@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_dashboard_stats(db, current_user.id)

# Project Routes
@app.get("/projects", response_model=List[schemas.Project])
def read_projects(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_projects(db, current_user.id)

@app.post("/projects", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.check_admin)):
    return crud.create_project(db=db, project=project, user_id=current_user.id)

@app.post("/projects/{project_id}/members", response_model=schemas.Project)
def add_member(project_id: int, user_email: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.check_admin)):
    project = crud.add_member_to_project(db, project_id, user_email)
    if not project:
        raise HTTPException(status_code=404, detail="Project or User not found")
    return project

# Task Routes
@app.post("/projects/{project_id}/tasks", response_model=schemas.Task)
def create_task(project_id: int, task: schemas.TaskCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.create_task(db=db, task=task, project_id=project_id)

@app.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.update_task(db, task_id, task_update)

@app.get("/tasks/{task_id}", response_model=schemas.Task)
def read_task(task_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
