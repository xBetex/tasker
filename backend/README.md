# Task Manager Backend

This is a FastAPI-based backend for the Task Manager application. It uses SQLAlchemy with SQLite for data persistence.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
uvicorn main:app --reload
```

The server will start at `http://localhost:8000`

## API Endpoints

- `POST /clients/`: Create a new client with tasks
- `GET /clients/`: Get all clients (with pagination)
- `GET /clients/{client_id}`: Get a specific client by ID
- `POST /import-data/`: Import data from data.json file

## Database

The application uses SQLite as the database. The database file `task_manager.db` will be created automatically when you first run the application.

## Data Import

To import the initial data:

1. Make sure the `data.json` file is in the same directory as `main.py`
2. Start the server
3. Make a POST request to `/import-data/`

## API Documentation

Once the server is running, you can access:
- Swagger UI documentation at `http://localhost:8000/docs`
- ReDoc documentation at `http://localhost:8000/redoc` 