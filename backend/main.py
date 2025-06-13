from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
from typing import List
import os
from pathlib import Path
from datetime import datetime, timezone
import uuid

from models import Base, Client, Task, Comment
from database import engine, get_db
import schemas

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Manager API",
    description="API for managing clients and their tasks",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint for Docker health checks"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    }

@app.post("/clients/", response_model=schemas.Client)
async def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    # Check if this is a client with tasks (legacy) or just client data
    if hasattr(client, 'tasks') and client.tasks:
        # Legacy mode: create client with tasks
        db_client = Client(
            id=client.id,
            name=client.name,
            company=client.company,
            origin=client.origin
        )
        db.add(db_client)
        
        for task in client.tasks:
            db_task = Task(
                date=task.date,
                description=task.description,
                status=task.status,
                priority=task.priority,
                client_id=client.id
            )
            db.add(db_task)
    else:
        # New mode: create client only
        db_client = Client(
            id=client.id,
            name=client.name,
            company=client.company,
            origin=client.origin
        )
        db.add(db_client)
    
    try:
        db.commit()
        db.refresh(db_client)
        return db_client
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/clients-only/", response_model=schemas.ClientOnly)
async def create_client_only(client: schemas.ClientOnly, db: Session = Depends(get_db)):
    # Check if client ID already exists
    existing_client = db.query(Client).filter(Client.id == client.id).first()
    if existing_client:
        raise HTTPException(status_code=400, detail="Client with this ID already exists")
    
    db_client = Client(
        id=client.id,
        name=client.name,
        company=client.company,
        origin=client.origin
    )
    db.add(db_client)
    
    try:
        db.commit()
        db.refresh(db_client)
        return db_client
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/clients/", response_model=List[schemas.Client])
async def get_clients(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    clients = db.query(Client).offset(skip).limit(limit).all()
    return clients

@app.get("/clients/all", response_model=List[schemas.Client])
async def get_all_clients(db: Session = Depends(get_db)):
    clients = db.query(Client).all()
    return clients

@app.get("/clients/{client_id}", response_model=schemas.Client)
async def get_client(client_id: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@app.put("/clients/{client_id}", response_model=schemas.Client)
async def update_client(client_id: str, client_update: schemas.ClientUpdate, db: Session = Depends(get_db)):
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Update client fields
    for field, value in client_update.dict(exclude_unset=True).items():
        if value is not None:  # Only update fields that are provided
            setattr(db_client, field, value)
    
    try:
        db.commit()
        db.refresh(db_client)
        return db_client
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/clients/{client_id}", response_model=schemas.ClientOnly)
async def delete_client(client_id: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    try:
        # Delete all associated tasks first
        db.query(Task).filter(Task.client_id == client_id).delete()
        # Then delete the client
        db.delete(client)
        db.commit()
        return client
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/tasks/", response_model=schemas.Task)
async def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    # Verify client exists
    client = db.query(Client).filter(Client.id == task.client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Set completion_date and timestamps if status is 'completed'
    completion_date = None
    completion_timestamp = None
    creation_timestamp = datetime.now(timezone.utc).isoformat()
    
    if task.status == 'completed':
        completion_date = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        completion_timestamp = creation_timestamp
    
    db_task = Task(
        date=task.date,
        description=task.description,
        status=task.status,
        priority=task.priority,
        client_id=task.client_id,
        sla_date=task.sla_date,
        completion_date=completion_date if task.completion_date is None else task.completion_date,
        creation_timestamp=creation_timestamp,
        completion_timestamp=completion_timestamp
    )
    db.add(db_task)
    
    try:
        db.commit()
        db.refresh(db_task)
        return db_task
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/tasks/{task_id}", response_model=schemas.Task)
async def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Store original status to check if it changed
    original_status = db_task.status
    
    # Update task fields
    for field, value in task_update.dict(exclude_unset=True).items():
        if value is not None:  # Only update fields that are provided
            setattr(db_task, field, value)
    
    # Auto-set completion_date and completion_timestamp when status changes to 'completed'
    if task_update.status == 'completed' and original_status != 'completed':
        db_task.completion_date = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        db_task.completion_timestamp = datetime.now(timezone.utc).isoformat()
    # Clear completion_date and completion_timestamp if status changes from 'completed' to something else
    elif original_status == 'completed' and task_update.status != 'completed' and task_update.completion_date is None:
        db_task.completion_date = None
        db_task.completion_timestamp = None
    
    try:
        db.commit()
        db.refresh(db_task)
        return db_task
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/tasks/{task_id}", response_model=schemas.Task)
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    try:
        db.delete(db_task)
        db.commit()
        return db_task
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/tasks/{task_id}/comments/", response_model=schemas.Comment)
async def create_comment(task_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    # Verify task exists
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Generate a unique comment ID
    comment_id = str(uuid.uuid4())[:8]
    
    db_comment = Comment(
        id=comment_id,
        task_id=task_id,
        text=comment.text,
        timestamp=datetime.now(timezone.utc).isoformat(),
        author=comment.author or "User"
    )
    db.add(db_comment)
    
    try:
        db.commit()
        db.refresh(db_comment)
        return db_comment
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/tasks/{task_id}/comments/", response_model=List[schemas.Comment])
async def get_task_comments(task_id: int, db: Session = Depends(get_db)):
    # Verify task exists
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    comments = db.query(Comment).filter(Comment.task_id == task_id).all()
    return comments

@app.delete("/comments/{comment_id}", response_model=schemas.Comment)
async def delete_comment(comment_id: str, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    try:
        db.delete(comment)
        db.commit()
        return comment
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/import-data/")
async def import_data(db: Session = Depends(get_db)):
    try:
        # Get the absolute path to data.json
        current_dir = Path(__file__).parent
        json_path = current_dir / "data.json"
        
        # Read the JSON file
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Import each client and their tasks
        for client_data in data:
            # Check if client already exists
            existing_client = db.query(Client).filter(Client.id == client_data["id"]).first()
            if existing_client:
                continue
                
            db_client = Client(
                id=client_data["id"],
                name=client_data["name"],
                company=client_data["company"],
                origin=client_data["origin"]
            )
            db.add(db_client)
            
            for task_data in client_data["tasks"]:
                db_task = Task(
                    date=task_data["date"],
                    description=task_data["description"],
                    status=task_data["status"],
                    priority=task_data["priority"],
                    client_id=client_data["id"]
                )
                db.add(db_task)
        
        db.commit()
        return {"message": "Data imported successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 