# Q: 1

## HR Onboarding Knowledge Assistant

Replace time-consuming HR induction calls with an AI assistant that allows new employees to instantly query company policies, benefits, leave policies, and employment terms from uploaded HR documents.

## Requirements

* HR document upload functionality (PDFs, Word docs, policy manuals)
* Text extraction and intelligent chunking for HR content
* Vector embedding storage with metadata filtering
* Conversational interface for employee queries
* Policy citations and source references
* Query categorization (benefits, leave, conduct, etc.)

## Technical Implementation

### Core HR RAG pipeline:

* Multi-format document ingestion (PDF, DOCX, TXT)
* HR-specific text chunking strategies
* Vector database setup (Chroma/FAISS/Pinecone)
* Context-aware retrieval mechanism
* Response generation with policy citations
* Admin dashboard for document management

## Sample Use Cases

* "How many vacation days do I get as a new employee?"
* "What's the process for requesting parental leave?"
* "Can I work remotely and what are the guidelines?"
* "How do I enroll in health insurance?"

## Tech stack
 - FastAPI
 - Vite+React
 - TailwindCSS
 - ChromaDB with rich metadata
 - LangChain - recursive chunking
 - Embeddings - OpenAI text-embedding-3-small
 - Retrieval - Dense Retrieval