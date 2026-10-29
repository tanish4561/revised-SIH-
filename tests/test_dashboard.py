import requests
import json

BASE_URL = 'http://127.0.0.1:5000'

def test_dashboard():
    print("Fetching Session History...")
    resp = requests.get(f"{BASE_URL}/dashboard/sessions")
    print(f"History Status: {resp.status_code}")
    
    try:
        data = resp.json()
        print(f"Sessions Found: {len(data['sessions'])}")
        if len(data['sessions']) > 0:
            session_id = data['sessions'][0]['id']
            print(f"\nFetching Details for Session {session_id}...")
            
            detail_resp = requests.get(f"{BASE_URL}/dashboard/sessions/{session_id}")
            print(f"Detail Status: {detail_resp.status_code}")
            print(f"Detail Response: {json.dumps(detail_resp.json(), indent=2)}")
    except Exception as e:
        print(f"Error parsing response: {e}")
        print(f"Raw Response: {resp.text}")

if __name__ == "__main__":
    test_dashboard()
