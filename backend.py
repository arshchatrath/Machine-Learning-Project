import os
import shutil
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import image_segmentation

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
PEOPLE_DIR = "./People"
DATASET_DIR = "./Dataset"
OUTPUT_DIR = "./output"

# Ensure directories exist
os.makedirs(PEOPLE_DIR, exist_ok=True)
os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Mount static files for serving images
app.mount("/static/people", StaticFiles(directory=PEOPLE_DIR), name="people")
app.mount("/static/dataset", StaticFiles(directory=DATASET_DIR), name="dataset")
app.mount("/static/output", StaticFiles(directory=OUTPUT_DIR), name="output")

@app.post("/upload/person")
async def upload_person(file: UploadFile = File(...)):
    try:
        file_location = f"{PEOPLE_DIR}/{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        return {"info": f"file '{file.filename}' saved at '{file_location}'"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/dataset")
async def upload_dataset(files: List[UploadFile] = File(...)):
    saved_files = []
    try:
        for file in files:
            file_location = f"{DATASET_DIR}/{file.filename}"
            with open(file_location, "wb+") as file_object:
                shutil.copyfileobj(file.file, file_object)
            saved_files.append(file.filename)
        return {"info": f"Saved {len(saved_files)} files", "files": saved_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/images/people")
async def list_people_images():
    files = [f for f in os.listdir(PEOPLE_DIR) if os.path.isfile(os.path.join(PEOPLE_DIR, f))]
    return {"images": files}

@app.get("/images/dataset")
async def list_dataset_images():
    files = [f for f in os.listdir(DATASET_DIR) if os.path.isfile(os.path.join(DATASET_DIR, f))]
    return {"images": files}

@app.post("/classify")
async def run_classification():
    try:
        # Re-run processing
        print("Processing known people...")
        image_segmentation.processKnownPeopleImages(path=PEOPLE_DIR + "/")
        print("Processing dataset...")
        image_segmentation.processDatasetImages(path=DATASET_DIR + "/")
        
        return {"status": "Classification complete"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results")
async def get_results():
    # The output directory structure is ./output/<Name>/<Image>
    # We want to return a structure like { "Name": ["image1.jpg", "image2.jpg"] }
    results = {}
    if os.path.exists(OUTPUT_DIR):
        for name in os.listdir(OUTPUT_DIR):
            person_dir = os.path.join(OUTPUT_DIR, name)
            if os.path.isdir(person_dir):
                images = [f for f in os.listdir(person_dir) if os.path.isfile(os.path.join(person_dir, f))]
                results[name] = images
    return results

@app.post("/reset")
async def reset_data():
    try:
        # Clear People
        for f in os.listdir(PEOPLE_DIR):
            os.remove(os.path.join(PEOPLE_DIR, f))
        # Clear Dataset
        for f in os.listdir(DATASET_DIR):
            os.remove(os.path.join(DATASET_DIR, f))
        # Clear Output
        if os.path.exists(OUTPUT_DIR):
            shutil.rmtree(OUTPUT_DIR)
            os.makedirs(OUTPUT_DIR)
        # Clear pickles
        if os.path.exists("known_encodings.pickle"):
            os.remove("known_encodings.pickle")
        if os.path.exists("dataset_encodings.pickle"): 
            os.remove("dataset_encodings.pickle")
            
        return {"status": "Data reset complete"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
