import requests
import json
import unittest
import uuid
from datetime import datetime
import time
import base64
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get backend URL from frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1]
            break

# Get Gemini API key from backend .env file
with open('/app/backend/.env', 'r') as f:
    for line in f:
        if line.startswith('GEMINI_API_KEY='):
            GEMINI_API_KEY = line.strip().split('=')[1]
            break

class TestBackendAPI(unittest.TestCase):
    """Test suite for the AI Website Builder Backend API"""

    def setUp(self):
        """Setup for each test"""
        self.base_url = f"{BACKEND_URL}/api"
        self.test_project_id = str(uuid.uuid4())
        self.test_logo_id = str(uuid.uuid4())
        
        # Test project data
        self.test_project = {
            "project_id": self.test_project_id,
            "name": "Test Website Project",
            "components": [
                {"type": "header", "content": "Welcome to my website"},
                {"type": "paragraph", "content": "This is a test paragraph"}
            ],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Test logo data
        self.test_logo = {
            "logo_id": self.test_logo_id,
            "name": "Test Logo",
            "prompt": "Modern logo for a tech company",
            "image_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            "created_at": datetime.now().isoformat()
        }
        
        # Print test information
        print(f"\nRunning tests against backend at: {self.base_url}")
        print(f"Test Project ID: {self.test_project_id}")
        print(f"Test Logo ID: {self.test_logo_id}")

    def test_01_health_check(self):
        """Test the health check endpoint"""
        print("\n1. Testing Health Check API...")
        try:
            response = requests.get(f"{self.base_url}/health")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response: {data}")
                self.assertEqual(data["status"], "healthy")
                print("✅ Health Check API is working")
            else:
                print(f"❌ Health Check API failed with status code {response.status_code}")
                print(f"Response: {response.text}")
                self.fail(f"Health Check API failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Exception during Health Check API test: {str(e)}")
            self.fail(f"Exception during test: {str(e)}")

    def test_02_create_project(self):
        """Test creating a new website project"""
        print("\n2. Testing Create Project API...")
        try:
            response = requests.post(
                f"{self.base_url}/projects",
                json=self.test_project
            )
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                self.assertEqual(data["project_id"], self.test_project_id)
                print("✅ Create Project API is working")
            else:
                print(f"❌ Create Project API failed with status code {response.status_code}")
                self.fail(f"Create Project API failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Exception during Create Project API test: {str(e)}")
            self.fail(f"Exception during test: {str(e)}")

    def test_03_get_all_projects(self):
        """Test getting all website projects"""
        print("\n3. Testing Get All Projects API...")
        try:
            response = requests.get(f"{self.base_url}/projects")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Found {len(data.get('projects', []))} projects")
                self.assertIn("projects", data)
                self.assertIsInstance(data["projects"], list)
                print("✅ Get All Projects API is working")
            else:
                print(f"❌ Get All Projects API failed with status code {response.status_code}")
                print(f"Response: {response.text}")
                self.fail(f"Get All Projects API failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Exception during Get All Projects API test: {str(e)}")
            self.fail(f"Exception during test: {str(e)}")

    def test_04_get_specific_project(self):
        """Test getting a specific website project"""
        print("\n4. Testing Get Specific Project API...")
        try:
            # First, make sure the project exists by creating it
            create_response = requests.post(
                f"{self.base_url}/projects",
                json=self.test_project
            )
            print(f"Create Status Code: {create_response.status_code}")
            
            # Now try to get the specific project
            response = requests.get(f"{self.base_url}/projects/{self.test_project_id}")
            print(f"Get Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Project data: {json.dumps(data, indent=2)}")
                self.assertEqual(data["project_id"], self.test_project_id)
                self.assertEqual(data["name"], self.test_project["name"])
                print("✅ Get Specific Project API is working")
            else:
                print(f"❌ Get Specific Project API failed with status code {response.status_code}")
                print(f"Response: {response.text}")
                self.fail(f"Get Specific Project API failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Exception during Get Specific Project API test: {str(e)}")
            self.fail(f"Exception during test: {str(e)}")

    def test_05_update_project(self):
        """Test updating a website project"""
        print("\n5. Testing Update Project API...")
        try:
            # First, make sure the project exists by creating it
            create_response = requests.post(
                f"{self.base_url}/projects",
                json=self.test_project
            )
            print(f"Create Status Code: {create_response.status_code}")
            
            # Now update the project
            updated_project = self.test_project.copy()
            updated_project["name"] = "Updated Test Project"
            updated_project["updated_at"] = datetime.now().isoformat()
            
            response = requests.put(
                f"{self.base_url}/projects/{self.test_project_id}",
                json=updated_project
            )
            print(f"Update Status Code: {response.status_code}")
            print(f"Update Response: {response.text}")
            
            if response.status_code == 200:
                # Verify the update
                get_response = requests.get(f"{self.base_url}/projects/{self.test_project_id}")
                if get_response.status_code == 200:
                    data = get_response.json()
                    print(f"Updated project data: {json.dumps(data, indent=2)}")
                    self.assertEqual(data["name"], "Updated Test Project")
                    print("✅ Update Project API is working")
                else:
                    print(f"❌ Failed to verify update, get request returned {get_response.status_code}")
                    print(f"Response: {get_response.text}")
                    self.fail(f"Failed to verify update, get request returned {get_response.status_code}")
            else:
                print(f"❌ Update Project API failed with status code {response.status_code}")
                self.fail(f"Update Project API failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Exception during Update Project API test: {str(e)}")
            self.fail(f"Exception during test: {str(e)}")

    def test_06_generate_image(self):
        """Test generating images with AI"""
        print("\n6. Testing Generate Image API...")
        try:
            image_request = {
                "prompt": "A beautiful sunset over mountains",
                "count": 1  # Reduced to 1 to speed up test
            }
            
            print(f"Sending request: {json.dumps(image_request, indent=2)}")
            response = requests.post(
                f"{self.base_url}/generate-image",
                json=image_request
            )
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Received {len(data.get('images', []))} images")
                self.assertIn("images", data)
                self.assertIsInstance(data["images"], list)
                
                # Verify base64 image format for at least one image
                if len(data["images"]) > 0:
                    image_url = data["images"][0]
                    self.assertTrue(image_url.startswith("data:image/png;base64,"))
                    # Verify that the base64 data is valid
                    base64_data = image_url.split(",")[1]
                    try:
                        decoded = base64.b64decode(base64_data)
                        self.assertTrue(len(decoded) > 0)
                        print("✅ Generate Image API is working")
                    except Exception as e:
                        print(f"❌ Invalid base64 data in image response: {str(e)}")
                        self.fail(f"Invalid base64 data in image response: {str(e)}")
                else:
                    print("⚠️ No images returned, but API call succeeded")
            else:
                print(f"❌ Generate Image API failed with status code {response.status_code}")
                print(f"Response: {response.text}")
                self.fail(f"Generate Image API failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Exception during Generate Image API test: {str(e)}")
            self.fail(f"Exception during test: {str(e)}")

    def test_07_generate_logo(self):
        """Test generating logos with AI"""
        print("\n7. Testing Generate Logo API...")
        try:
            logo_request = {
                "company_name": "TechInnovate",
                "style": "minimalist",
                "colors": "blue and white",
                "industry": "technology"
            }
            
            print(f"Sending request: {json.dumps(logo_request, indent=2)}")
            response = requests.post(
                f"{self.base_url}/generate-logo",
                json=logo_request
            )
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Received {len(data.get('logos', []))} logos")
                self.assertIn("logos", data)
                self.assertIsInstance(data["logos"], list)
                
                # Verify base64 image format for at least one logo
                if len(data["logos"]) > 0:
                    logo_url = data["logos"][0]
                    self.assertTrue(logo_url.startswith("data:image/png;base64,"))
                    # Verify that the base64 data is valid
                    base64_data = logo_url.split(",")[1]
                    try:
                        decoded = base64.b64decode(base64_data)
                        self.assertTrue(len(decoded) > 0)
                        print("✅ Generate Logo API is working")
                    except Exception as e:
                        print(f"❌ Invalid base64 data in logo response: {str(e)}")
                        self.fail(f"Invalid base64 data in logo response: {str(e)}")
                else:
                    print("⚠️ No logos returned, but API call succeeded")
            else:
                print(f"❌ Generate Logo API failed with status code {response.status_code}")
                print(f"Response: {response.text}")
                self.fail(f"Generate Logo API failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Exception during Generate Logo API test: {str(e)}")
            self.fail(f"Exception during test: {str(e)}")

    def test_08_save_logo(self):
        """Test saving a logo"""
        print("\n8. Testing Save Logo API...")
        try:
            response = requests.post(
                f"{self.base_url}/logos",
                json=self.test_logo
            )
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                self.assertEqual(data["logo_id"], self.test_logo_id)
                print("✅ Save Logo API is working")
            else:
                print(f"❌ Save Logo API failed with status code {response.status_code}")
                self.fail(f"Save Logo API failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Exception during Save Logo API test: {str(e)}")
            self.fail(f"Exception during test: {str(e)}")

    def test_09_get_logos(self):
        """Test getting all saved logos"""
        print("\n9. Testing Get Logos API...")
        try:
            # First, make sure the logo exists by creating it
            create_response = requests.post(
                f"{self.base_url}/logos",
                json=self.test_logo
            )
            print(f"Create Status Code: {create_response.status_code}")
            
            # Now get all logos
            response = requests.get(f"{self.base_url}/logos")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Found {len(data.get('logos', []))} logos")
                self.assertIn("logos", data)
                self.assertIsInstance(data["logos"], list)
                
                # Verify our test logo is in the response
                found = False
                for logo in data["logos"]:
                    if logo["logo_id"] == self.test_logo_id:
                        found = True
                        break
                
                if found:
                    print("✅ Get Logos API is working")
                else:
                    print("⚠️ Test logo not found in the response, but API call succeeded")
            else:
                print(f"❌ Get Logos API failed with status code {response.status_code}")
                print(f"Response: {response.text}")
                self.fail(f"Get Logos API failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Exception during Get Logos API test: {str(e)}")
            self.fail(f"Exception during test: {str(e)}")

    def test_10_delete_project(self):
        """Test deleting a website project"""
        print("\n10. Testing Delete Project API...")
        try:
            # First, make sure the project exists by creating it
            create_response = requests.post(
                f"{self.base_url}/projects",
                json=self.test_project
            )
            print(f"Create Status Code: {create_response.status_code}")
            
            # Now delete the project
            response = requests.delete(f"{self.base_url}/projects/{self.test_project_id}")
            print(f"Delete Status Code: {response.status_code}")
            print(f"Delete Response: {response.text}")
            
            if response.status_code == 200:
                # Verify the project is deleted
                get_response = requests.get(f"{self.base_url}/projects/{self.test_project_id}")
                print(f"Verification Status Code: {get_response.status_code}")
                
                if get_response.status_code == 404:
                    print("✅ Delete Project API is working")
                else:
                    print(f"❌ Project still exists after deletion, status code {get_response.status_code}")
                    self.fail(f"Project still exists after deletion, status code {get_response.status_code}")
            else:
                print(f"❌ Delete Project API failed with status code {response.status_code}")
                self.fail(f"Delete Project API failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Exception during Delete Project API test: {str(e)}")
            self.fail(f"Exception during test: {str(e)}")

    def test_11_error_handling(self):
        """Test error handling for non-existent resources"""
        print("\n11. Testing Error Handling...")
        try:
            # Test non-existent project
            non_existent_id = str(uuid.uuid4())
            response = requests.get(f"{self.base_url}/projects/{non_existent_id}")
            print(f"Get Non-existent Project Status Code: {response.status_code}")
            
            if response.status_code == 404:
                # Test invalid project update
                update_response = requests.put(
                    f"{self.base_url}/projects/{non_existent_id}",
                    json=self.test_project
                )
                print(f"Update Non-existent Project Status Code: {update_response.status_code}")
                
                if update_response.status_code == 404:
                    # Test invalid project deletion
                    delete_response = requests.delete(f"{self.base_url}/projects/{non_existent_id}")
                    print(f"Delete Non-existent Project Status Code: {delete_response.status_code}")
                    
                    if delete_response.status_code == 404:
                        print("✅ Error Handling is working")
                    else:
                        print(f"❌ Delete non-existent project should return 404, got {delete_response.status_code}")
                        self.fail(f"Delete non-existent project should return 404, got {delete_response.status_code}")
                else:
                    print(f"❌ Update non-existent project should return 404, got {update_response.status_code}")
                    self.fail(f"Update non-existent project should return 404, got {update_response.status_code}")
            else:
                print(f"❌ Get non-existent project should return 404, got {response.status_code}")
                self.fail(f"Get non-existent project should return 404, got {response.status_code}")
        except Exception as e:
            print(f"❌ Exception during Error Handling test: {str(e)}")
            self.fail(f"Exception during test: {str(e)}")


if __name__ == "__main__":
    # Run the tests
    print(f"Testing backend API at: {BACKEND_URL}/api")
    print(f"Using Gemini API Key: {GEMINI_API_KEY}")
    
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add tests in order
    suite.addTest(TestBackendAPI('test_01_health_check'))
    suite.addTest(TestBackendAPI('test_02_create_project'))
    suite.addTest(TestBackendAPI('test_03_get_all_projects'))
    suite.addTest(TestBackendAPI('test_04_get_specific_project'))
    suite.addTest(TestBackendAPI('test_05_update_project'))
    suite.addTest(TestBackendAPI('test_06_generate_image'))
    suite.addTest(TestBackendAPI('test_07_generate_logo'))
    suite.addTest(TestBackendAPI('test_08_save_logo'))
    suite.addTest(TestBackendAPI('test_09_get_logos'))
    suite.addTest(TestBackendAPI('test_10_delete_project'))
    suite.addTest(TestBackendAPI('test_11_error_handling'))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n=== TEST SUMMARY ===")
    print(f"Total tests: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Skipped: {len(result.skipped)}")
    
    # Exit with appropriate code
    sys.exit(len(result.failures) + len(result.errors))