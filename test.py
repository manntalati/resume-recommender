from langchain.chat_models import init_chat_model
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.documents import Document
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.output_parsers import StrOutputParser
import threading
from datetime import datetime
import os

os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

class RateLimiter: 
    def __init__(self, limit=100):
        self.limit = limit
        self.counter = 0
        self.lock = threading.lock()
        self.date = datetime.now().date()

    def check(self):
        with self.lock:
            today = datetime.now().date()
            if today != self.date:
                self.date = today
                self.counter = 0
            if self.counter > self.limit:
                raise Exception("100 Calls Reached Today")
            else:
                self.counter += 1

class RateLimiterRunnable:
    def __init__(self, runnable, limiter: RateLimiter):
        self.runnable = runnable
        self.limiter = limiter
    
    def invoke(self, input, config=None, **kwargs):
        self.limiter.check()
        return self.runnable.invoke(input, config=config, **kwargs)

daily_limit = RateLimiter(limit=100)

llm = init_chat_model("gemini-2.0-flash", model_provider="google_genai")
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

def job_posting(link):
    loader = WebBaseLoader(link)
    docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    all_splits = text_splitter.split_documents(docs)
    job_content = "\n".join([doc.page_content for doc in all_splits])
    return job_content
    
def extract_resume_info(pdf_path):
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    all_splits = text_splitter.split_documents(docs)
    important_info = []
    for doc in all_splits:
        important_info.append(doc.page_content)
    return "\n".join(important_info)

def analyze_resume_and_job(resume_info, job_info):
    resume = extract_resume_info(resume_info)
    job = job_posting(job_info)
    prompt = ChatPromptTemplate.from_template("You are an expert resume reviewer and career coach. Your task is to analyze a resume against a specific job posting and provide detailed, actionable feedback.\n RESUME CONTENT: {resume_info} \nANALYZED JOB REQUIREMENTS: {job_info} \nANALYSIS REQUIREMENTS: 1. **Current Score (0-100)**: Rate how well the resume matches the specific job requirements listed above, 2. **Target Score**: What the score should be after implementing recommendations, 3. **Missing Skills**: Identify specific skills from the job requirements that are NOT in the resume, 4. **Experience Gaps**: Point out missing experience requirements from the job posting, 5. **Content Improvements**: Suggest specific improvements to existing content based on job requirements, 6. **Specific Examples**: Provide concrete examples based on their actual experience that align with job needs, 7. **Formatting Suggestions**: Recommend layout and presentation improvements\n CRITICAL INSTRUCTIONS: - ONLY suggest skills and experience that are actually mentioned in the job requirements above, - Base all recommendations on the actual job posting content provided, - Focus on the specific industry, role, and requirements mentioned in the job posting, - Provide specific examples from their resume that could be enhanced to match job requirements, - Do not suggest adding fake or non-existent experience, - If the job posting doesn't mention specific technical skills, don't suggest adding them, IMPORTANT: The job requirements above are the ONLY skills and qualifications you should reference. Do not add generic suggestions., Please structure your response clearly with these sections and be specific about what the job actually requires.")
    chain = prompt | llm | StrOutputParser()
    result = RateLimiterRunnable(chain, daily_limit)
    input = {"resume_info": resume, "job_info": job}
    result.invoke(input=input)
    return result
    

print(analyze_resume_and_job("Jake_s_Resume__Anonymous_.pdf", "https://www.prizepicks.com/position?gh_jid=6660981003&utm_source=Simplify&gh_src=Simplify"))