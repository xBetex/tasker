#!/usr/bin/env python3
"""
Database migration script to add sla_date and completion_date columns to tasks table.
"""

import sqlite3
import os
from pathlib import Path

def migrate_database():
    """Add sla_date and completion_date columns to the tasks table."""
    
    # Get the database path
    db_path = Path(__file__).parent / "task_manager.db"
    
    if not db_path.exists():
        print(f"Database file not found at {db_path}")
        print("Creating new database with updated schema...")
        return
    
    print(f"Migrating database at {db_path}")
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [column[1] for column in cursor.fetchall()]
        
        migrations_needed = []
        
        if 'sla_date' not in columns:
            migrations_needed.append("ALTER TABLE tasks ADD COLUMN sla_date TEXT")
            
        if 'completion_date' not in columns:
            migrations_needed.append("ALTER TABLE tasks ADD COLUMN completion_date TEXT")
        
        if not migrations_needed:
            print("Database is already up to date!")
            return
        
        # Execute migrations
        for migration in migrations_needed:
            print(f"Executing: {migration}")
            cursor.execute(migration)
        
        # Commit changes
        conn.commit()
        print("Migration completed successfully!")
        
        # Show updated table structure
        cursor.execute("PRAGMA table_info(tasks)")
        columns = cursor.fetchall()
        print("\nUpdated table structure:")
        for column in columns:
            print(f"  {column[1]} ({column[2]})")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database() 