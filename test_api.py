import requests
import json

# Test the health endpoint
def test_health():
    try:
        response = requests.get('http://localhost:3050/api/health')
        print(f"Health check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

# Test the analyze endpoint (without file upload)
def test_analyze():
    try:
        response = requests.post('http://localhost:3050/api/analyze', 
                               data={'job_link': 'https://example.com'})
        print(f"Analyze endpoint: {response.status_code}")
        return response.status_code in [400, 500]  # Expected to fail without file
    except Exception as e:
        print(f"Analyze test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing API endpoints...")
    test_health()
    test_analyze()
    print("Tests completed.") 