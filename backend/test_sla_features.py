#!/usr/bin/env python3
"""
Test script for SLA and completion date features.
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def test_sla_features():
    """Test SLA and completion date functionality."""
    
    print("🧪 Testing SLA and Completion Date Features")
    print("=" * 50)
    
    # Test 1: Create a client
    print("\n1. Creating test client...")
    client_data = {
        "id": "TEST_SLA_001",
        "name": "Test Client SLA",
        "company": "SLA Test Company",
        "origin": "API Test"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/clients-only/", json=client_data)
        if response.status_code == 200:
            print("✅ Client created successfully")
        elif response.status_code == 400 and "already exists" in response.text:
            print("ℹ️  Client already exists, continuing...")
        else:
            print(f"❌ Failed to create client: {response.status_code}")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure the server is running on port 8000")
        return
    
    # Test 2: Create a task with SLA
    print("\n2. Creating task with SLA date...")
    sla_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
    task_data = {
        "date": datetime.now().strftime('%Y-%m-%d'),
        "description": "Test task with SLA",
        "status": "pending",
        "priority": "high",
        "client_id": "TEST_SLA_001",
        "sla_date": sla_date
    }
    
    response = requests.post(f"{BASE_URL}/tasks/", json=task_data)
    if response.status_code == 200:
        task = response.json()
        task_id = task['id']
        print(f"✅ Task created with ID: {task_id}")
        print(f"   SLA Date: {task.get('sla_date', 'None')}")
        print(f"   Completion Date: {task.get('completion_date', 'None')}")
    else:
        print(f"❌ Failed to create task: {response.status_code}")
        print(response.text)
        return
    
    # Test 3: Update task status to completed
    print("\n3. Marking task as completed...")
    update_data = {
        "status": "completed"
    }
    
    response = requests.put(f"{BASE_URL}/tasks/{task_id}", json=update_data)
    if response.status_code == 200:
        updated_task = response.json()
        print("✅ Task marked as completed")
        print(f"   Status: {updated_task['status']}")
        print(f"   Completion Date: {updated_task.get('completion_date', 'None')}")
        
        if updated_task.get('completion_date'):
            print("✅ Completion date was automatically set!")
        else:
            print("❌ Completion date was not set automatically")
    else:
        print(f"❌ Failed to update task: {response.status_code}")
        print(response.text)
        return
    
    # Test 4: Update task status back to pending
    print("\n4. Changing task status back to pending...")
    update_data = {
        "status": "pending"
    }
    
    response = requests.put(f"{BASE_URL}/tasks/{task_id}", json=update_data)
    if response.status_code == 200:
        updated_task = response.json()
        print("✅ Task status changed to pending")
        print(f"   Status: {updated_task['status']}")
        print(f"   Completion Date: {updated_task.get('completion_date', 'None')}")
        
        if not updated_task.get('completion_date'):
            print("✅ Completion date was automatically cleared!")
        else:
            print("❌ Completion date was not cleared automatically")
    else:
        print(f"❌ Failed to update task: {response.status_code}")
        print(response.text)
        return
    
    # Test 5: Create task with overdue SLA
    print("\n5. Creating task with overdue SLA...")
    overdue_sla = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d')
    overdue_task_data = {
        "date": datetime.now().strftime('%Y-%m-%d'),
        "description": "Overdue task for testing",
        "status": "in progress",
        "priority": "high",
        "client_id": "TEST_SLA_001",
        "sla_date": overdue_sla
    }
    
    response = requests.post(f"{BASE_URL}/tasks/", json=overdue_task_data)
    if response.status_code == 200:
        overdue_task = response.json()
        print(f"✅ Overdue task created with ID: {overdue_task['id']}")
        print(f"   SLA Date: {overdue_task.get('sla_date')} (overdue)")
        print(f"   Status: {overdue_task['status']}")
    else:
        print(f"❌ Failed to create overdue task: {response.status_code}")
    
    # Test 6: Get client with all tasks
    print("\n6. Retrieving client with all tasks...")
    response = requests.get(f"{BASE_URL}/clients/TEST_SLA_001")
    if response.status_code == 200:
        client = response.json()
        print(f"✅ Retrieved client: {client['name']}")
        print(f"   Total tasks: {len(client['tasks'])}")
        
        for i, task in enumerate(client['tasks'], 1):
            print(f"   Task {i}: {task['description']}")
            print(f"     Status: {task['status']}")
            print(f"     SLA Date: {task.get('sla_date', 'None')}")
            print(f"     Completion Date: {task.get('completion_date', 'None')}")
    else:
        print(f"❌ Failed to retrieve client: {response.status_code}")
    
    print("\n" + "=" * 50)
    print("🎉 SLA Features Test Completed!")
    print("\nNext steps:")
    print("1. Open the frontend at http://localhost:3000")
    print("2. Look for the 'Test Client SLA' client")
    print("3. Verify that SLA dates and completion dates are displayed correctly")
    print("4. Test the visual indicators (red for overdue SLA, green for completion)")

if __name__ == "__main__":
    test_sla_features() 