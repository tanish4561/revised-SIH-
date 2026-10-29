import requests
import json

BASE_URL = 'http://127.0.0.1:5000'

def test_sessions():
    # 1. Setup Users
    print("Setting up users...")
    # Admin
    requests.post(f"{BASE_URL}/auth/register", json={"username": "admin2", "password": "password123", "role": "admin"})
    admin_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "admin2", "password": "password123"})
    admin_token = admin_resp.json()['token']

    # Player
    requests.post(f"{BASE_URL}/auth/register", json={"username": "player2", "password": "password123", "role": "player"})
    player_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "player2", "password": "password123"})
    player_token = player_resp.json()['token']

    # 2. Create Session with Assignment
    print("\nCreating Session with Assignment...")
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "config": {"difficulty": "medium"},
        "players": [
            {"username": "player2", "role": "Rescuer"}
        ]
    }
    resp = requests.post(f"{BASE_URL}/sessions/", headers=headers, json=payload)
    print(f"Create Status: {resp.status_code}")
    try:
        print(f"Create Response: {resp.json()}")
        session_id = resp.json()['session_id']
    except:
        print(f"Failed to decode JSON. Raw response: {resp.text}")
        return

    # 3. Player Checks Pending Invites
    print("\nChecking Pending Invites...")
    player_headers = {"Authorization": f"Bearer {player_token}"}
    resp = requests.get(f"{BASE_URL}/sessions/pending", headers=player_headers)
    print(f"Pending Status: {resp.status_code}")
    print(f"Pending Response: {resp.json()}")

    # 4. Player Joins (Accepts Invite)
    print("\nJoining Session...")
    resp = requests.post(f"{BASE_URL}/sessions/{session_id}/join", headers=player_headers)
    print(f"Join Status: {resp.status_code}")
    print(f"Join Response: {resp.json()}")

    # 5. Start Session
    print("\nStarting Session...")
    resp = requests.post(f"{BASE_URL}/sessions/{session_id}/start", headers=headers)
    print(f"Start Status: {resp.status_code}")
    print(f"Start Response: {resp.json()}")

if __name__ == "__main__":
    test_sessions()
