import requests
import json
import base64

def test_python_service():
    """Test if Python service is working"""
    try:
        response = requests.get('http://localhost:5000/health')
        print(f"✅ Python service health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Python service error: {e}")
        return False

def test_nestjs_connection():
    """Test if we can connect to NestJS"""
    try:
        response = requests.get('http://localhost:3000/health')
        print(f"✅ NestJS health check: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ NestJS connection error: {e}")
        return False

def test_face_registration():
    """Test face registration endpoint"""
    try:
        # Create dummy video frames (base64 encoded images)
        dummy_frame = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        
        registration_data = {
            "employeeId": "test-employee-001",
            "employeeName": "Test Employee",
            "videoFrames": [dummy_frame]
        }
        
        print("🚀 Testing face registration...")
        print(f"Data: {json.dumps(registration_data, indent=2)}")
        
        response = requests.post(
            'http://localhost:5000/process/register',
            json=registration_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📊 Python service response: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Registration successful!")
            print(f"Features extracted: {len(result.get('features', []))}")
            print(f"Quality score: {result.get('quality_score', 'N/A')}")
            return result
        else:
            print(f"❌ Registration failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Registration test error: {e}")
        return None

def test_nestjs_registration():
    """Test if NestJS can receive the registration"""
    try:
        # First get Python service response
        python_result = test_face_registration()
        if not python_result:
            print("❌ Cannot test NestJS without Python service working")
            return False
        
        # Now test NestJS endpoint
        nestjs_data = {
            "employeeId": "test-employee-001",
            "employeeName": "Test Employee",
            "videoFrames": ["dummy_frame"]
        }
        
        print("\n🚀 Testing NestJS registration endpoint...")
        
        response = requests.post(
            'http://localhost:3000/face-encodings/process-registration',
            json=nestjs_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📊 NestJS response: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ NestJS registration successful!")
            print(f"Result: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ NestJS registration failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ NestJS test error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Face Recognition System...\n")
    
    # Test 1: Python service
    print("=" * 50)
    print("Test 1: Python Service")
    print("=" * 50)
    python_ok = test_python_service()
    
    # Test 2: NestJS connection
    print("\n" + "=" * 50)
    print("Test 2: NestJS Connection")
    print("=" * 50)
    nestjs_ok = test_nestjs_connection()
    
    # Test 3: Face registration
    print("\n" + "=" * 50)
    print("Test 3: Face Registration")
    print("=" * 50)
    if python_ok:
        registration_ok = test_face_registration()
    else:
        print("❌ Skipping registration test - Python service not working")
        registration_ok = False
    
    # Test 4: NestJS registration
    print("\n" + "=" * 50)
    print("Test 4: NestJS Registration")
    print("=" * 50)
    if python_ok and nestjs_ok:
        nestjs_reg_ok = test_nestjs_registration()
    else:
        print("❌ Skipping NestJS registration test - services not working")
        nestjs_reg_ok = False
    
    # Summary
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)
    print(f"Python Service: {'✅ OK' if python_ok else '❌ FAILED'}")
    print(f"NestJS Connection: {'✅ OK' if nestjs_ok else '❌ FAILED'}")
    print(f"Face Registration: {'✅ OK' if registration_ok else '❌ FAILED'}")
    print(f"NestJS Registration: {'✅ OK' if nestjs_reg_ok else '❌ FAILED'}")
    
    if python_ok and nestjs_ok and registration_ok and nestjs_reg_ok:
        print("\n🎉 All tests passed! System is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the logs above for details.") 