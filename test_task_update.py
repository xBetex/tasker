#!/usr/bin/env python3
"""
Script para testar a atualização de tarefas no backend
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_task_update():
    print("🧪 Testando atualização de tarefas...")
    
    try:
        # 1. Buscar todas as tarefas para pegar uma para testar
        print("1️⃣ Buscando clientes e tarefas...")
        response = requests.get(f"{BASE_URL}/clients/")
        if response.status_code == 200:
            clients = response.json()
            if clients and clients[0]['tasks']:
                task = clients[0]['tasks'][0]
                task_id = task['id']
                print(f"✅ Encontrada tarefa ID: {task_id}")
                print(f"   Data atual: {task['date']}")
                print(f"   Descrição: {task['description']}")
                
                # 2. Testar atualização de data
                print(f"\n2️⃣ Testando atualização da tarefa {task_id}...")
                new_data = {
                    "date": "2025-05-01",  # Nova data em formato yyyy-mm-dd
                    "description": task['description'] + " (UPDATED)",
                    "status": task['status'],
                    "priority": task['priority']
                }
                
                update_response = requests.put(
                    f"{BASE_URL}/tasks/{task_id}", 
                    json=new_data
                )
                
                if update_response.status_code == 200:
                    updated_task = update_response.json()
                    print(f"✅ Tarefa atualizada com sucesso!")
                    print(f"   Nova data: {updated_task['date']}")
                    print(f"   Nova descrição: {updated_task['description']}")
                    
                    # 3. Verificar se a mudança persistiu
                    print(f"\n3️⃣ Verificando persistência...")
                    verify_response = requests.get(f"{BASE_URL}/clients/")
                    if verify_response.status_code == 200:
                        updated_clients = verify_response.json()
                        updated_task_from_db = None
                        
                        for client in updated_clients:
                            for t in client['tasks']:
                                if t['id'] == task_id:
                                    updated_task_from_db = t
                                    break
                        
                        if updated_task_from_db:
                            print(f"✅ Dados persistidos corretamente!")
                            print(f"   Data no banco: {updated_task_from_db['date']}")
                            print(f"   Descrição no banco: {updated_task_from_db['description']}")
                            
                            if updated_task_from_db['date'] == "2025-05-01":
                                print("🎉 TESTE PASSOU: Data foi atualizada corretamente!")
                            else:
                                print("❌ TESTE FALHOU: Data não foi atualizada corretamente!")
                        else:
                            print("❌ Erro: Tarefa não encontrada após atualização")
                    else:
                        print("❌ Erro ao verificar persistência")
                else:
                    print(f"❌ Erro na atualização: {update_response.status_code}")
                    print(f"Resposta: {update_response.text}")
            else:
                print("❌ Nenhuma tarefa encontrada para testar")
        else:
            print(f"❌ Erro ao buscar clientes: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Não foi possível conectar ao servidor backend")
        print("💡 Certifique-se de que o servidor esteja rodando em http://localhost:8000")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    test_task_update() 