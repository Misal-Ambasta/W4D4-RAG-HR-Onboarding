from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os
import datetime

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

from pipeline import process_and_store, query_hr_docs, delete_document_vectors

@router.post("/upload", tags=["Documents"])
async def upload_document(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[-1].lower()
    if ext not in [".pdf", ".docx", ".txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file type.")
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    try:
        chunk_count = process_and_store(file_path, metadata={"filename": file.filename})
    except Exception as e:
        return {"filename": file.filename, "status": "error", "error": str(e)}
    return {"filename": file.filename, "status": "ready", "chunks": chunk_count}

from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str

def increment_query_count():
    path = os.path.join(os.path.dirname(__file__), "query_count.txt")
    try:
        with open(path, "r+") as f:
            count = int(f.read().strip() or 0) + 1
            f.seek(0)
            f.write(str(count))
            f.truncate()
    except FileNotFoundError:
        with open(path, "w") as f:
            f.write("1")

def get_query_count():
    path = os.path.join(os.path.dirname(__file__), "query_count.txt")
    try:
        with open(path, "r") as f:
            return int(f.read().strip() or 0)
    except FileNotFoundError:
        return 0

@router.post("/query", tags=["Query"])
async def query_documents(req: QueryRequest):
    increment_query_count()
    answer, results, category = query_hr_docs(req.query)
    return {
        "answer": answer,
        "category": category,
        "results": [
            {"score": float(score), "snippet": doc.page_content[:100]} for doc, score in results
        ]
    }

@router.get("/stats", tags=["Admin"])
async def get_stats():
    query_count = get_query_count()
    return {
        "total_documents": len([name for name in os.listdir(UPLOAD_DIR) if os.path.isfile(os.path.join(UPLOAD_DIR, name))]),
        "total_queries": query_count,
    }


@router.get("/documents", tags=["Admin"])
async def list_documents():
    documents = []
    for filename in os.listdir(UPLOAD_DIR):
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.isfile(file_path):
            documents.append({
                "filename": filename,
                "upload_date": datetime.datetime.fromtimestamp(os.path.getctime(file_path)).isoformat(),
                "status": "ready", 
                "category": "General" 
            })
    return documents

@router.delete("/documents/{filename}", tags=["Admin"])
async def delete_document(filename: str):
    print(f"[DELETE] Received filename: {filename}")
    file_path = os.path.join(UPLOAD_DIR, filename)
    print(f"[DELETE] Constructed file_path: {file_path}")
    print(f"[DELETE] Files in UPLOAD_DIR: {os.listdir(UPLOAD_DIR)}")
    if not os.path.exists(file_path):
        print(f"[DELETE] File not found: {file_path}")
        raise HTTPException(status_code=404, detail="File not found.")
    
    try:
        os.remove(file_path)
        deleted_count = delete_document_vectors(filename)
        print(f"[DELETE] File deleted: {file_path}, vectors removed: {deleted_count}")
        return {"filename": filename, "status": "deleted", "vectors_removed": deleted_count}
    except Exception as e:
        print(f"[DELETE] Exception: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {e}")


@router.get("/stats", tags=["Admin"])
async def get_stats():
    # Placeholder for more advanced stats
    query_count = 0 
    return {
        "total_documents": len([name for name in os.listdir(UPLOAD_DIR) if os.path.isfile(os.path.join(UPLOAD_DIR, name))]),
        "total_queries": query_count,
    }
