# vector_store_manager.py
from langchain_community.vectorstores import FAISS
from langchain_ollama  import OllamaEmbeddings
# Global reference holding your FAISS store
vector_store: FAISS | None = None
embeddings=OllamaEmbeddings(
                model="embeddinggemma:latest",
                temperature=0.5,
                dimensions=512)

def get_vector_store() -> FAISS:
    global vector_store
    if vector_store is None:
        raise ValueError("Vector store is empty! Please upload documents first.")
    return vector_store

async def update_vector_store(chunks):
    global vector_store
    if vector_store is None:
        # Initialize if first time
        vector_store = await FAISS.afrom_documents(chunks, embeddings)
    else:
        # Add to existing in-memory store
        await vector_store.aadd_documents(chunks)