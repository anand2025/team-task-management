from sqlalchemy.orm import Session
import models, schemas, auth
from datetime import datetime

# User Operations
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Project Operations
def get_projects(db: Session, user_id: int):
    # Get projects where user is owner or member
    return db.query(models.Project).filter(
        (models.Project.owner_id == user_id) | 
        (models.Project.members.any(id=user_id))
    ).all()

def create_project(db: Session, project: schemas.ProjectCreate, user_id: int):
    db_project = models.Project(**project.dict(), owner_id=user_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def add_member_to_project(db: Session, project_id: int, user_email: str):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    user = db.query(models.User).filter(models.User.email == user_email).first()
    if not project or not user:
        return None
    if user not in project.members:
        project.members.append(user)
        db.commit()
    return project

# Task Operations
def create_task(db: Session, task: schemas.TaskCreate, project_id: int):
    db_task = models.Task(**task.dict(), project_id=project_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        for key, value in task_update.dict(exclude_unset=True).items():
            setattr(db_task, key, value)
        db.commit()
        db.refresh(db_task)
    return db_task

def get_dashboard_stats(db: Session, user_id: int):
    projects = get_projects(db, user_id)
    project_ids = [p.id for p in projects]
    
    tasks = db.query(models.Task).filter(models.Task.project_id.in_(project_ids)).all()
    
    pending_tasks = [t for t in tasks if t.status != models.TaskStatus.COMPLETED]
    overdue_tasks = [t for t in tasks if t.due_date and t.due_date < datetime.utcnow() and t.status != models.TaskStatus.COMPLETED]
    
    return schemas.DashboardStats(
        total_projects=len(projects),
        total_tasks=len(tasks),
        pending_tasks=len(pending_tasks),
        overdue_tasks=len(overdue_tasks)
    )
