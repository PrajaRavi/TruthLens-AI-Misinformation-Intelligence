# vector_store_manager.py
from langchain_community.vectorstores import FAISS
from urllib.parse import urlparse, parse_qs
from langchain_ollama  import OllamaEmbeddings
import trafilatura 
from pydantic import BaseModel,Field
from app.config import llms
import re
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


async def extract_webpage_content(url: str) -> dict:

    try:

        downloaded = trafilatura.fetch_url(url)

        if not downloaded:
            raise ValueError(
                "Unable to download webpage"
            )

        # Extract structured object containing metadata + body text
        data = trafilatura.bare_extraction(downloaded)
        
        if data:
            title = data.title          # Extracted page title
            text = data.text         # Main article text
            author = data.author

            if not text or not text.strip():
                raise ValueError(
                    "Could not extract readable content from webpage"
                )

            return {
                "source_type": "webpage",
                "source_url": url,
                "text": str(text),
                "title":title,
                "author":author
            }

    except Exception as e:

        raise ValueError(
            f"Unable to extract webpage content: {str(e)}"
        )

def format_research_output(raw_output) -> str:
    """
    Clean raw LLM research output before passing it
    to the claim assessment node.

    Removes:
    - Markdown code fences
    - Excessive whitespace
    - Repeated blank lines
    - Unnecessary formatting characters

    Preserves:
    - URLs
    - Numbers
    - Punctuation
    - Evidence content
    """

    # Handle LangChain AIMessage
    if hasattr(raw_output, "content"):
        text = raw_output.content
    else:
        text = str(raw_output)

    # Remove markdown code fences
    text = re.sub(r"```(?:text|markdown)?", "", text)
    text = text.replace("```", "")

    # Normalize different newline characters
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove excessive blank lines
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    # Remove leading/trailing whitespace from every line
    lines = [
        line.strip()
        for line in text.split("\n")
        if line.strip()
    ]

    # Join lines into a clean readable report
    text = "\n".join(lines)

    # Remove unnecessary repeated spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove spaces before punctuation
    text = re.sub(r"\s+([,.!?;:])", r"\1", text)

    # Final cleanup
    return text.strip()

class OptimizedQuery(BaseModel):
    query:str = Field(
        description="optimized query."
    )


structured_output=llms.PRIMARY_GROQ_LLM.with_structured_output(OptimizedQuery,method="json_schema")
async def rewrite_query(query="nothing",sys_prompt="just"):
    try:
        result=await structured_output.ainvoke([{"role":"system","content":sys_prompt},{"role":"user","content":query}])
        return result.query
    except Exception as e:
        print("error in rewrite_query")
        print(str(e))
