# System Flow: HR Onboarding Knowledge Assistant

This document explains the flow of core operations (document upload, query, and admin actions) both as step-by-step arrows and as Mermaid diagrams.

---

## 1. Document Upload Flow

**Step-by-step:**

```
User (AdminDashboard Upload) 
  ↓
POST /upload (FastAPI endpoint)
  ↓
routers.upload_document (backend/routers.py)
  ↓
pipeline.process_and_store (backend/pipeline.py)
  ↓
ChromaDB: Store vectors with metadata
```

**Mermaid:**
```mermaid
flowchart TD
    A[User: AdminDashboard Upload] -->|POST /upload| B[FastAPI /upload endpoint]
    B --> C[routers.upload_document]
    C --> D[pipeline.process_and_store]
    D --> E[ChromaDB: Store vectors]
```

---

## 2. Employee Query Flow

**Step-by-step:**

```
User (ChatInterface) 
  ↓
POST /query (FastAPI endpoint)
  ↓
routers.query_documents (backend/routers.py)
  ↓
pipeline.query_hr_docs (backend/pipeline.py)
  ↓
ChromaDB: Retrieve vectors
  ↓
OpenAI: Generate answer
  ↓
Auto-categorize query (Benefits/Leave/Conduct/General)
  ↓
Increment persistent usage stats
  ↓
Return answer + category + citations to frontend
```

**Mermaid:**
```mermaid
flowchart TD
    A[User: ChatInterface] -->|POST /query| B[FastAPI /query endpoint]
    B --> C[routers.query_documents]
    C --> D[pipeline.query_hr_docs]
    D --> E[ChromaDB: Retrieve vectors]
    E --> F[OpenAI: Generate answer]
    F --> G[Auto-categorize query]
    G --> H[Increment usage stats]
    H --> I[Return answer + category + citations]
```

---

## 3. Admin: List, Delete, and Stats

**Step-by-step:**

```
User (AdminDashboard)
  ↓
GET /documents, DELETE /documents/{filename}, GET /stats (FastAPI endpoints)
  ↓
routers.list_documents / delete_document / get_stats
  ↓
File system & pipeline.delete_document_vectors (for delete)
  ↓
ChromaDB: Update vector store (no persist() needed on delete)
  ↓
Backend persists document categories
  ↓
Return status/data to frontend
```

**Mermaid:**
```mermaid
flowchart TD
    A[User: AdminDashboard] -->|GET /documents| B[routers.list_documents]
    A -->|DELETE /documents/filename| C[routers.delete_document]
    A -->|GET /stats| D[routers.get_stats]
    B --> E[File system operations]
    C --> F[pipeline.delete_document_vectors]
    D --> G[Retrieve usage statistics]
    E --> H[Return document list]
    F --> I[ChromaDB: Update vectors]
    G --> J[Return stats data]
    I --> K[Return deletion status]
```

---

For more details, see the code in `backend/routers.py` and `backend/pipeline.py`.
