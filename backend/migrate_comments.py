#!/usr/bin/env python3
"""
Migration script to add comments table to existing database
"""

import sqlite3
import os
from pathlib import Path

def migrate_database():
    # Get database path
    db_path = Path(__file__).parent / "task_manager.db"
    
    if not db_path.exists():
        print("Database file not found. Creating new database with comments support.")
        return
    
    print(f"Migrating database: {db_path}")
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if comments table already exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='comments'
        """)
        
        if cursor.fetchone():
            print("Comments table already exists. Migration not needed.")
            return
        
        # Create comments table
        cursor.execute("""
            CREATE TABLE comments (
                id VARCHAR PRIMARY KEY,
                task_id INTEGER NOT NULL,
                text VARCHAR NOT NULL,
                timestamp VARCHAR NOT NULL,
                author VARCHAR DEFAULT 'User',
                FOREIGN KEY (task_id) REFERENCES tasks (id)
            )
        """)
        
        # Create index for better performance
        cursor.execute("""
            CREATE INDEX idx_comments_task_id ON comments (task_id)
        """)
        
        # Commit changes
        conn.commit()
        print("✅ Successfully added comments table to database!")
        
        # Verify table creation
        cursor.execute("SELECT sql FROM sqlite_master WHERE name='comments'")
        table_sql = cursor.fetchone()
        if table_sql:
            print(f"Table structure: {table_sql[0]}")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
        
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database() 