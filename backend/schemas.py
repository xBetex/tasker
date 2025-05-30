from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class TaskBase(BaseModel):
    date: str
    description: str
    status: str
    priority: str

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    client_id: str
    
    model_config = ConfigDict(from_attributes=True)

class ClientBase(BaseModel):
    name: str
    company: str
    origin: str

class ClientCreate(ClientBase):
    id: str
    tasks: List[TaskCreate]

class Client(ClientBase):
    id: str
    tasks: List[Task]
    
    model_config = ConfigDict(from_attributes=True) 