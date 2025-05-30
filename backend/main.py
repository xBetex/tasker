from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
from typing import List
import os
from pathlib import Path

from models import Base, Client, Task
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
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/clients/", response_model=schemas.Client)
async def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
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
    
    try:
        db.commit()
        db.refresh(db_client)
        return db_client
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/clients/", response_model=List[schemas.Client])
async def get_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    clients = db.query(Client).offset(skip).limit(limit).all()
    return clients

@app.get("/clients/{client_id}", response_model=schemas.Client)
async def get_client(client_id: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

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
    uvicorn.run(app, host="0.0.0.0", port=8000) 