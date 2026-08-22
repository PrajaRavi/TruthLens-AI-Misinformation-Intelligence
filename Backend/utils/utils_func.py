# vector_store_manager.py
from langchain_community.vectorstores import FAISS
from urllib.parse import urlparse, parse_qs
from langchain_ollama  import OllamaEmbeddings
# Global reference holding your FAISS store
vector_store: FAISS | None = None
embeddings=OllamaEmbeddings(
                model="embeddinggemma:latest",
                temperature=0.5,
                dimensions=512)



def extract_video_id(url: str) -> str:
    """
    Extracts the YouTube video ID from a YouTube URL.

    Supported formats:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://youtube.com/shorts/VIDEO_ID
    - https://youtube.com/embed/VIDEO_ID
    - https://www.youtube.com/live/VIDEO_ID

    Args:
        url (str): YouTube video URL

    Returns:
        str: Video ID

    Raises:
        ValueError: If the URL is invalid or no video ID is found.
    """
  
    parsed_url = urlparse(url)

    # youtu.be/<id>
    if parsed_url.netloc == "youtu.be":
        return parsed_url.path.lstrip("/")

    # youtube.com/watch?v=<id>
    if "youtube.com" in parsed_url.netloc:
        if parsed_url.path == "/watch":
            video_id = parse_qs(parsed_url.query).get("v")
            if video_id:
                return video_id[0]

        # youtube.com/embed/<id>
        if parsed_url.path.startswith("/embed/"):
            return parsed_url.path.split("/")[2]

        # youtube.com/shorts/<id>
        if parsed_url.path.startswith("/shorts/"):
            return parsed_url.path.split("/")[2]

        # youtube.com/live/<id>
        if parsed_url.path.startswith("/live/"):
            return parsed_url.path.split("/")[2]

    return ("Invalid YouTube URL")

def format_docs(retrieved_docs):
  context_text = "\n\n".join(doc.page_content for doc in retrieved_docs)
  return context_text

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