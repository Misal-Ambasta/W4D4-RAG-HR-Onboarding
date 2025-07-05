# HR Onboarding Knowledge Assistant (RAG)

A modern AI-powered assistant to automate HR onboarding Q&A using Retrieval-Augmented Generation (RAG).

---

## 🚀 Project Overview
This project replaces manual HR induction calls with an interactive AI assistant. Employees can instantly query company policies, benefits, leave policies, and employment terms from uploaded HR documents. Admins can manage documents, monitor usage, and keep the knowledge base up to date.

---

## ✨ Features
- **Document Upload:** Upload PDF, DOCX, and TXT HR documents via a beautiful admin dashboard.
- **Automated Processing:** Extracts, chunks, and embeds HR content using OpenAI and LangChain, storing vectors in ChromaDB.
- **Conversational AI:** Employees chat with the assistant to get instant answers, with policy citations and source snippets.
- **Query Categorization:** All queries are auto-tagged (Benefits, Leave, Conduct, General) and usage stats are tracked persistently.
- **Admin Dashboard:** Manage documents, view status, delete files, update categories, and see real usage stats.
- **Document Category Persistence:** Categories are stored and updated in the backend, not just client-side.
- **Rich Metadata:** All vectors are stored with document metadata for precise retrieval.
- **Modern UI:** Built with React and TailwindCSS for a polished, responsive experience.

---

## 🛠️ Tech Stack
- **Backend:** FastAPI (Python), LangChain (modular: langchain, langchain-openai, langchain-chroma, langchain-text-splitters), ChromaDB (via LangChain), OpenAI Embeddings
- **Frontend:** Vite + React (TypeScript), TailwindCSS
- **Other:** Python-dotenv, docx2txt, PyPDF2

---

## 📁 Directory Structure
```
backend/        # FastAPI app, pipeline, routers
frontend/       # Vite + React app (admin, chat, styles)
chroma_db/      # Vector store (auto-created)
.env.example    # Example environment variables
flow.md         # System flow diagrams and endpoint mapping
```

---

## ⚡ Setup & Usage
1. **Clone the repo:**
   ```
   git clone <this-repo-url>
   cd <project-root>
   ```
2. **Backend:**
   - Create `.env` from `.env.example` and set your OpenAI API key.
   - Install Python dependencies:
     ```
     cd backend
     pip install -r ../requirements.txt
     ```
   - Run FastAPI:
     ```
     uvicorn main:app --reload
     ```
3. **Frontend:**
   - Install dependencies:
     ```
     cd ../frontend
     npm install
     ```
   - Start Vite dev server:
     ```
     npm run dev
     ```
4. **Access the App:**
   - Open [http://localhost:5173](http://localhost:5173) in your browser.
   - Use the Admin Dashboard to upload and manage documents.
   - Use the Chat tab to interact with the HR Assistant.

---

## 📊 System Flow & Endpoints
See [`flow.md`](./flow.md) for detailed step-by-step and Mermaid diagrams of how documents and queries flow through the system.

---

## 📝 License
MIT License