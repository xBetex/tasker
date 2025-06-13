#!/usr/bin/env python3
"""
Migration script to add creation_timestamp and completion_timestamp columns to existing tasks
"""

import sqlite3
from datetime import datetime, timezone
import os

def migrate_timestamps():
    """Add timestamp columns to existing tasks"""
    
    # Get the database path
    db_path = os.path.join(os.path.dirname(__file__), 'task_manager.db')
    
    if not os.path.exists(db_path):
        print("Database file not found. No migration needed.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add creation_timestamp column if it doesn't exist
        if 'creation_timestamp' not in columns:
            print("Adding creation_timestamp column...")
            cursor.execute("ALTER TABLE tasks ADD COLUMN creation_timestamp TEXT")
            
            # Set creation_timestamp for existing tasks (use current time as fallback)
            current_timestamp = datetime.now(timezone.utc).isoformat()
            cursor.execute("UPDATE tasks SET creation_timestamp = ? WHERE creation_timestamp IS NULL", (current_timestamp,))
            print(f"Updated {cursor.rowcount} tasks with creation_timestamp")
        
        # Add completion_timestamp column if it doesn't exist
        if 'completion_timestamp' not in columns:
            print("Adding completion_timestamp column...")
            cursor.execute("ALTER TABLE tasks ADD COLUMN completion_timestamp TEXT")
            
            # Set completion_timestamp for completed tasks (use current time as fallback)
            current_timestamp = datetime.now(timezone.utc).isoformat()
            cursor.execute("UPDATE tasks SET completion_timestamp = ? WHERE status = 'completed' AND completion_timestamp IS NULL", (current_timestamp,))
            print(f"Updated {cursor.rowcount} completed tasks with completion_timestamp")
        
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_timestamps() 