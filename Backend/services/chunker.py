from langchain_classic.text_splitter import RecursiveJsonSplitter
from langchain_core.documents import Document

def perform_chunk(chunk_size=400,data={}):
  "this function is going to perform chunking and return all the chunks"
  splitter=RecursiveJsonSplitter(max_chunk_size=chunk_size)
  chunks=splitter.split_json(data)
  docs=[]
  for chunk in chunks:
    # docs.append(Document(page_content=str(chunk),metadata={"by":"analysis chatboat"}))
    docs.append(str(chunk))
  return docs



