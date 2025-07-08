from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import pymongo
from pymongo import MongoClient
import uuid
import base64
import asyncio
import google.generativeai as genai
from PIL import Image
import io
import requests

load_dotenv()

app = FastAPI(title="Website Builder API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = MongoClient(MONGO_URL)
db = client.websitebuilder
projects_collection = db.projects
logos_collection = db.logos

# Initialize Gemini AI
genai.configure(api_key=GEMINI_API_KEY)

# Pydantic models
class WebsiteProject(BaseModel):
    project_id: str
    name: str
    components: List[dict]
    created_at: str
    updated_at: str

class LogoProject(BaseModel):
    logo_id: str
    name: str
    prompt: str
    image_data: str  # base64 encoded
    created_at: str

class ImageGenerationRequest(BaseModel):
    prompt: str
    count: Optional[int] = 1

class LogoGenerationRequest(BaseModel):
    company_name: str
    style: str
    colors: Optional[str] = ""
    industry: Optional[str] = ""

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Website Builder API is running"}

# Website Builder endpoints
@app.post("/api/projects")
async def create_project(project: WebsiteProject):
    try:
        project_dict = project.dict()
        projects_collection.insert_one(project_dict)
        return {"message": "Project created successfully", "project_id": project.project_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects")
async def get_projects():
    try:
        projects = list(projects_collection.find({}, {"_id": 0}))
        return {"projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str):
    try:
        project = projects_collection.find_one({"project_id": project_id}, {"_id": 0})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/projects/{project_id}")
async def update_project(project_id: str, project: WebsiteProject):
    try:
        project_dict = project.dict()
        result = projects_collection.update_one(
            {"project_id": project_id}, 
            {"$set": project_dict}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"message": "Project updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    try:
        result = projects_collection.delete_one({"project_id": project_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"message": "Project deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# AI Image Generation endpoints
@app.post("/api/generate-image")
async def generate_image(request: ImageGenerationRequest):
    try:
        # Use the Gemini model for image generation
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Generate images based on the prompt
        images = []
        for _ in range(request.count):
            response = model.generate_content(
                request.prompt,
                generation_config={"response_mime_type": "image/png"}
            )
            
            # Extract image data from response
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    image_bytes = part.inline_data.data
                    base64_image = base64.b64encode(image_bytes).decode('utf-8')
                    images.append(f"data:image/png;base64,{base64_image}")
        
        return {"images": images}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

# Logo Generation endpoints
@app.post("/api/generate-logo")
async def generate_logo(request: LogoGenerationRequest):
    try:
        # Create detailed prompt for logo generation
        prompt = f"Create a modern professional logo for {request.company_name}"
        if request.style:
            prompt += f" in {request.style} style"
        if request.colors:
            prompt += f" using {request.colors} colors"
        if request.industry:
            prompt += f" suitable for {request.industry} industry"
        prompt += ", clean background, high quality, professional design"
        
        # Use the Gemini model for logo generation
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Generate logos based on the prompt
        logos = []
        for _ in range(4):  # Generate 4 logo variations
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "image/png"}
            )
            
            # Extract image data from response
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    image_bytes = part.inline_data.data
                    base64_image = base64.b64encode(image_bytes).decode('utf-8')
                    logos.append(f"data:image/png;base64,{base64_image}")
        
        return {"logos": logos, "prompt": prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logo generation failed: {str(e)}")

@app.post("/api/logos")
async def save_logo(logo: LogoProject):
    try:
        logo_dict = logo.dict()
        logos_collection.insert_one(logo_dict)
        return {"message": "Logo saved successfully", "logo_id": logo.logo_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/logos")
async def get_logos():
    try:
        logos = list(logos_collection.find({}, {"_id": 0}))
        return {"logos": logos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)