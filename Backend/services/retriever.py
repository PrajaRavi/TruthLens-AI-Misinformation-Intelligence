from DB.faiss_db import get_vector_store
from flashrank.Ranker import Ranker, RerankRequest

def get_result(query,passages,choice):
  if choice == "Nano":
    ranker = Ranker()
  elif choice == "Small":
    ranker = Ranker(model_name="ms-marco-MiniLM-L-12-v2", cache_dir="/opt")
  elif choice == "Medium":
    ranker = Ranker(model_name="rank-T5-flan", cache_dir="/opt")
  elif choice == "Large":
    ranker = Ranker(model_name="ms-marco-MultiBERT-L-12", cache_dir="/opt")
  rerankrequest = RerankRequest(query=query, passages=passages)
  results = ranker.rerank(rerankrequest)
  print(results)


  return results
def retrieve_data_with_flashrank(query="nothing"):

  try:
    retriever=get_vector_store().as_retriever(kwargs=4,search_type="mmr")
    result=retriever.invoke(query)
    return result
    # result_flashrank_dict=[]
    # for i,data in enumerate(result):
    #   result_flashrank_dict.append({"id":i+1,"text":data.page_content,"meta":{"source":"TrutheLensAI"}})
    # ranked_result=get_result(query,result_flashrank_dict,"Nano")
    # ranked_result_str=[data['text'] for data in ranked_result]
    # return ranked_result_str

  except Exception as e:
    print(str(e))
    return {"success":False,"error":str(e)}