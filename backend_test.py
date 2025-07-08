import requests
import json
import unittest
import uuid
from datetime import datetime
import time
import base64
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get backend URL from frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1]
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

    def test_01_health_check(self):
        """Test the health check endpoint"""
        print("\n1. Testing Health Check API...")
        response = requests.get(f"{self.base_url}/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        print("✅ Health Check API is working")

    def test_02_create_project(self):
        """Test creating a new website project"""
        print("\n2. Testing Create Project API...")
        response = requests.post(
            f"{self.base_url}/projects",
            json=self.test_project
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["project_id"], self.test_project_id)
        print("✅ Create Project API is working")

    def test_03_get_all_projects(self):
        """Test getting all website projects"""
        print("\n3. Testing Get All Projects API...")
        response = requests.get(f"{self.base_url}/projects")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("projects", data)
        self.assertIsInstance(data["projects"], list)
        print("✅ Get All Projects API is working")

    def test_04_get_specific_project(self):
        """Test getting a specific website project"""
        print("\n4. Testing Get Specific Project API...")
        response = requests.get(f"{self.base_url}/projects/{self.test_project_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["project_id"], self.test_project_id)
        self.assertEqual(data["name"], self.test_project["name"])
        print("✅ Get Specific Project API is working")

    def test_05_update_project(self):
        """Test updating a website project"""
        print("\n5. Testing Update Project API...")
        updated_project = self.test_project.copy()
        updated_project["name"] = "Updated Test Project"
        updated_project["updated_at"] = datetime.now().isoformat()
        
        response = requests.put(
            f"{self.base_url}/projects/{self.test_project_id}",
            json=updated_project
        )
        self.assertEqual(response.status_code, 200)
        
        # Verify the update
        response = requests.get(f"{self.base_url}/projects/{self.test_project_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Updated Test Project")
        print("✅ Update Project API is working")

    def test_06_generate_image(self):
        """Test generating images with AI"""
        print("\n6. Testing Generate Image API...")
        image_request = {
            "prompt": "A beautiful sunset over mountains",
            "count": 2
        }
        
        response = requests.post(
            f"{self.base_url}/generate-image",
            json=image_request
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("images", data)
        self.assertIsInstance(data["images"], list)
        self.assertEqual(len(data["images"]), 2)
        
        # Verify base64 image format
        for image_url in data["images"]:
            self.assertTrue(image_url.startswith("data:image/png;base64,"))
            # Verify that the base64 data is valid
            base64_data = image_url.split(",")[1]
            try:
                decoded = base64.b64decode(base64_data)
                self.assertTrue(len(decoded) > 0)
            except:
                self.fail("Invalid base64 data in image response")
        
        print("✅ Generate Image API is working")

    def test_07_generate_logo(self):
        """Test generating logos with AI"""
        print("\n7. Testing Generate Logo API...")
        logo_request = {
            "company_name": "TechInnovate",
            "style": "minimalist",
            "colors": "blue and white",
            "industry": "technology"
        }
        
        response = requests.post(
            f"{self.base_url}/generate-logo",
            json=logo_request
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("logos", data)
        self.assertIsInstance(data["logos"], list)
        self.assertEqual(len(data["logos"]), 4)  # Should return 4 variations
        
        # Verify base64 image format for logos
        for logo_url in data["logos"]:
            self.assertTrue(logo_url.startswith("data:image/png;base64,"))
            # Verify that the base64 data is valid
            base64_data = logo_url.split(",")[1]
            try:
                decoded = base64.b64decode(base64_data)
                self.assertTrue(len(decoded) > 0)
            except:
                self.fail("Invalid base64 data in logo response")
        
        print("✅ Generate Logo API is working")

    def test_08_save_logo(self):
        """Test saving a logo"""
        print("\n8. Testing Save Logo API...")
        response = requests.post(
            f"{self.base_url}/logos",
            json=self.test_logo
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["logo_id"], self.test_logo_id)
        print("✅ Save Logo API is working")

    def test_09_get_logos(self):
        """Test getting all saved logos"""
        print("\n9. Testing Get Logos API...")
        response = requests.get(f"{self.base_url}/logos")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("logos", data)
        self.assertIsInstance(data["logos"], list)
        
        # Verify our test logo is in the response
        found = False
        for logo in data["logos"]:
            if logo["logo_id"] == self.test_logo_id:
                found = True
                break
        self.assertTrue(found, "Test logo not found in the response")
        print("✅ Get Logos API is working")

    def test_10_delete_project(self):
        """Test deleting a website project"""
        print("\n10. Testing Delete Project API...")
        response = requests.delete(f"{self.base_url}/projects/{self.test_project_id}")
        self.assertEqual(response.status_code, 200)
        
        # Verify the project is deleted
        response = requests.get(f"{self.base_url}/projects/{self.test_project_id}")
        self.assertEqual(response.status_code, 404)
        print("✅ Delete Project API is working")

    def test_11_error_handling(self):
        """Test error handling for non-existent resources"""
        print("\n11. Testing Error Handling...")
        
        # Test non-existent project
        non_existent_id = str(uuid.uuid4())
        response = requests.get(f"{self.base_url}/projects/{non_existent_id}")
        self.assertEqual(response.status_code, 404)
        
        # Test invalid project update
        response = requests.put(
            f"{self.base_url}/projects/{non_existent_id}",
            json=self.test_project
        )
        self.assertEqual(response.status_code, 404)
        
        # Test invalid project deletion
        response = requests.delete(f"{self.base_url}/projects/{non_existent_id}")
        self.assertEqual(response.status_code, 404)
        
        print("✅ Error Handling is working")


if __name__ == "__main__":
    # Run the tests
    print(f"Testing backend API at: {BACKEND_URL}/api")
    unittest.main(argv=['first-arg-is-ignored'], exit=False)