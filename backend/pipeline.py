import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
# Use langchain_chroma as the new Chroma vectorstore integration
from langchain_chroma import Chroma
from dotenv import load_dotenv
import docx2txt
import PyPDF2

load_dotenv()

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)

def extract_text(file_path):
    ext = os.path.splitext(file_path)[-1].lower()
    if ext == ".pdf":
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            return "\n".join(page.extract_text() or "" for page in reader.pages)
    elif ext == ".docx":
        return docx2txt.process(file_path)
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    else:
        raise ValueError("Unsupported file type.")

def process_and_store(file_path, metadata=None):
    text = extract_text(file_path)
    chunks = text_splitter.split_text(text)
    vectordb = Chroma(persist_directory=CHROMA_DB_PATH, embedding_function=embeddings)
    vectordb.add_texts(chunks, metadatas=[metadata or {}]*len(chunks))
    vectordb.persist()
    return len(chunks)

def categorize_query(query: str) -> str:
    q = query.lower()
    if any(word in q for word in ["benefit", "insurance", "health", "salary", "pay", "bonus"]):
        return "Benefits"
    if any(word in q for word in ["leave", "vacation", "holiday", "absence", "sick", "time off", "pto"]):
        return "Leave"
    if any(word in q for word in ["conduct", "policy", "rule", "discipline", "behavior", "ethic"]):
        return "Conduct"
    return "General"

def query_hr_docs(query, metadata_filter=None):
    vectordb = Chroma(persist_directory=CHROMA_DB_PATH, embedding_function=embeddings)
    results = vectordb.similarity_search_with_score(query, k=5, filter=metadata_filter)
    # Compose context for LLM prompt
    context = "\n".join([doc.page_content for doc, _ in results])
    prompt = f"You are an HR assistant. Use ONLY the context below to answer the user's question.\n\nContext:\n{context}\n\nQuestion: {query}\n\nAnswer as helpfully as possible."
    llm = ChatOpenAI(model="gpt-4", temperature=0)
    answer = llm.invoke(prompt).content
    category = categorize_query(query)
    return answer, results, category

def delete_document_vectors(filename):
    vectordb = Chroma(persist_directory=CHROMA_DB_PATH, embedding_function=embeddings)
    # This is a bit of a workaround as ChromaDB's delete implementation can be tricky.
    # We get the IDs of the documents to delete based on metadata.
    results = vectordb.get(where={"filename": filename})
    if results and results['ids']:
        vectordb.delete(ids=results['ids'])
        return len(results['ids'])
    return 0
