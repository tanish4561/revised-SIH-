import requests
import json

BASE_URL = 'http://127.0.0.1:5000'

def test_game():
    # 1. Setup: Login Admin, Create Session, Register/Login Player, Join Session
    print("Setting up game session...")
    
    # Admin Login
    admin_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "testadmin", "password": "password123"})
    if admin_resp.status_code != 200:
        print("Admin login failed (maybe run test_auth first?)")
        # Try registering if login fails (idempotent-ish)
        requests.post(f"{BASE_URL}/auth/register", json={"username": "testadmin", "password": "password123", "role": "admin"})
        admin_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "testadmin", "password": "password123"})
    
    admin_token = admin_resp.json()['token']
    
    # Create Session
    headers = {"Authorization": f"Bearer {admin_token}"}
    session_resp = requests.post(f"{BASE_URL}/sessions/", headers=headers, json={"config": {"difficulty": "easy"}})
    session_id = session_resp.json()['session_id']
    print(f"Session {session_id} created.")

    # Player Login/Register
    requests.post(f"{BASE_URL}/auth/register", json={"username": "gameplayer", "password": "password123", "role": "player"})
    player_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "gameplayer", "password": "password123"})
    player_token = player_resp.json()['token']
    
    # Join Session
    player_headers = {"Authorization": f"Bearer {player_token}"}
    requests.post(f"{BASE_URL}/sessions/{session_id}/join", headers=player_headers, json={"game_role": "ChemicalExpert"})
    print("Player joined session.")

    # Start Session
    requests.post(f"{BASE_URL}/sessions/{session_id}/start", headers=headers)
    print("Session started.")

    # 2. Submit Metrics
    print("\nSubmitting Metrics...")
    metrics_payload = {
        "session_id": session_id,
        "metrics": {
            "gas_detected": "Chlorine",
            "containment_success": True,
            "time_taken": 120
        }
    }
    
    resp = requests.post(f"{BASE_URL}/game/submit", headers=player_headers, json=metrics_payload)
    print(f"Submit Status: {resp.status_code}")
    print(f"Submit Response: {resp.json()}")

if __name__ == "__main__":
    test_game()
