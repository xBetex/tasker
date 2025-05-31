from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class TaskBase(BaseModel):
    date: str
    description: str
    status: str
    priority: str

class TaskCreate(TaskBase):
    client_id: str

class Task(TaskBase):
    id: int
    client_id: str
    
    model_config = ConfigDict(from_attributes=True)

class TaskUpdate(BaseModel):
    date: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    client_id: Optional[str] = None

class ClientBase(BaseModel):
    name: str
    company: str
    origin: str

class ClientOnly(ClientBase):
    id: str

class ClientCreate(ClientBase):
    id: str
    tasks: Optional[List[TaskCreate]] = []

class Client(ClientBase):
    id: str
    tasks: List[Task]
    
    model_config = ConfigDict(from_attributes=True)

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    origin: Optional[str] = None

class ClientOnly(ClientBase):
    id: str
    
    model_config = ConfigDict(from_attributes=True) 