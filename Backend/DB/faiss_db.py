from langchain_community.vectorstores import FAISS
from app.config import llms

vector_store: FAISS | None = None

def get_vector_store() -> FAISS:
    global vector_store
    if vector_store is None:
        raise ValueError("Vector store is empty! Please upload documents first.")
    return vector_store

async def update_vector_store(chunks):
    try:
        global vector_store
        if(vector_store!=None):
            all_ids = list(vector_store.index_to_docstore_id.values())
            if(len(all_ids)!=0):
                clear_db()
        if vector_store is None:
            # Initialize if first time
            vector_store = await FAISS.afrom_texts(chunks, llms.embeddings)
            
            # ! here i am using from_text so during storing chunks i do not have to wrap document inside Document wrapper means i can provide simple str as chunk
            # ! but internally faiss will apply the Document wrapper in all the str as chunk so during retrieval i will get all chunks with Document wrapper

        else:
            # Add to existing in-memory store
            await vector_store.afrom_texts(chunks,embedding=llms.embeddings)
    except Exception as e:
        print("error in update_vector_store")
        print(str(e))
        


def clear_db():
    "-----------------have to implement-------------------------"
    "langchain does not provide any builtin method for delete for this i have to use faiss builtin"
    # 1. Fetch all Document IDs stored in the vectorstore
    all_ids = list(vector_store.index_to_docstore_id.values())

    # Option A: Inspect or fetch all Document objects before deleting
    all_documents = [vector_store.docstore.search(doc_id) for doc_id in all_ids]
    print(f"Fetched {len(all_documents)} documents to delete.")

    # 2. Delete all documents from FAISS using their IDs
    if all_ids:
        success = vector_store.delete(ids=all_ids)
        print("Deletion successful:", success)