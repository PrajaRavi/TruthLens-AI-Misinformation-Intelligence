
import os
from langchain_groq import ChatGroq
from langchain_ollama import ChatOllama
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_nomic import NomicEmbeddings
load_dotenv()
google_fact_api_key=os.getenv("google_fact_api_key")
TAVILY_API_KEY=os.getenv("TAVILY_API_KEY")
hive_api_key=os.getenv("hive_api_key")
GOOGLE_API_KEY=os.getenv("GOOGLE_API_KEY")
nomic_api_key=os.getenv("NOMIC_API_KEY")
groq_api_key2=os.getenv("groq_api_key2")

groq_llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.3, #->it is between 0 to 2  and it is creativity parameter if it is 0 then for same question it will give same ans alway but as we increase this number then our model gives diffrent ans on each time on asking the  same question
    max_tokens=None,
    timeout=None,
    max_retries=2,
)
groq_llm2 = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.3, #->it is between 0 to 2  and it is creativity parameter if it is 0 then for same question it will give same ans alway but as we increase this number then our model gives diffrent ans on each time on asking the  same question
    max_tokens=None,
    api_key=groq_api_key2,
    timeout=None,
    max_retries=2,
)

phi_llm=ChatOllama(
    model="phi4-mini:3.8b",
    temperature=0.4
)
embeddings = NomicEmbeddings(
    nomic_api_key=nomic_api_key,
    model="nomic-embed-text-v1.5", 
    inference_mode="remote"  # This tells LangChain to use the API, not your CPU
)



qwen=ChatOllama(
    model="qwen2.5:0.5b",
    temperature=0.4
)
qwen_coder=ChatOllama(
    model="qwen2.5-coder:3b",
    temperature=0.4
)
gemini_llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash-lite",
    # model="gemini-3.1-flash-lite-image",
    api_key=GOOGLE_API_KEY,
    
    max_tokens=None,
    timeout=None,
    max_retries=2,
)

llama=ChatOllama(
    model="llama3.2:1b",
    temperature=0.4
)
