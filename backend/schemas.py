from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from models import UserRole, TaskStatus

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.MEMBER

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: str = "medium"
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

class Task(TaskBase):
    id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    owner_id: int
    owner: User
    members: List[User] = []
    tasks: List[Task] = []

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_projects: int
    total_tasks: int
    pending_tasks: int
    overdue_tasks: int
