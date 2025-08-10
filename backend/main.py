from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
import threading
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

class RateLimiter: 
    def __init__(self, limit=100):
        self.limit = limit
        self.counter = 0
        self.lock = threading.Lock()
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

llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.8)
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
    prompt = ChatPromptTemplate.from_template("""You are an expert resume reviewer and career coach. Your task is to analyze a resume against a specific job posting and provide detailed, actionable feedback.

                                              RESUME CONTENT: {resume_info} 
                                              
                                              ANALYZED JOB REQUIREMENTS: {job_info} 

                                              ANALYSIS REQUIREMENTS: 
                                                1. **Current Score (0-100)**: Rate how well the resume matches the specific job requirements listed above
                                                2. **Target Score**: What the score should be after implementing recommendations
                                                3. **Missing Skills**: Identify specific skills from the job requirements that are NOT in the resume
                                                4. **Experience Gaps**: Point out missing experience requirements from the job posting
                                                5. **Content Improvements**: Suggest specific improvements to existing content based on job requirements    
                                                6. **Specific Examples**: Provide concrete examples based on their actual experience that align with job needs
                                                7. **Formatting Suggestions**: Recommend layout and presentation improvements
                                                8. **ATS Score**: Provide the user with an ATS score of their resume to see how well it would perform in the ATS screening aspect
                                              
                                              CRITICAL INSTRUCTIONS: 
                                                - ONLY suggest skills and experience that are actually mentioned in the job requirements above
                                                - Base all recommendations on the actual job posting content provided
                                                - Focus on the specific industry, role, and requirements mentioned in the job posting
                                                - Provide specific examples from their resume that could be enhanced to match job requirements
                                                - Do NOT suggest adding fake or non-existent experience
                                                - If the job posting doesn't mention specific technical skills, don't suggest adding them
                                              
                                              IMPORTANT: The job requirements above are the ONLY skills and qualifications you should reference. Do not add generic suggestions. 
                                              Please structure your response clearly with these sections and be specific about what the job actually requires. 
                                              When returning your result ensure that it is in a format that will be clean and utilized by frontend services. 
                                              The results should still remain accurate but in a better formatted way so that it can be used more seamlessly and look clean from a more user interfact aspect.
                                            """)
    chain = prompt | llm | StrOutputParser()
    result = RateLimiterRunnable(chain, daily_limit)
    input = {"resume_info": resume_info, "job_info": job_info}
    output = result.invoke(input=input)
    
    return {
        'success': True,
        'analysis': output,
        'resume_info': resume_info,
        'job_info': job_info
    }

def chat_with_ai(resume, user_message, context=None, job_requirements=None):
    if not resume or not job_requirements:
        return {
            'success': False,
            'error': 'Missing resume or job requirements data. Please analyze a resume first.'
        }
    chat_prompt = ChatPromptTemplate.from_template("""You are a helpful and friendly career advisor assisting a user in improving their resume for a specific job. You have access to their ACTUAL resume and the job posting.
                                                
                                                   USER'S RESUME CONTENT: {resume}
                                                   
                                                   JOB REQUIREMENTS: {job_requirements}

                                                   USER'S QUESTION: {user_message}

                                                   PREVIOUS ANALYSIS: {context}
                                                   
                                                   INSTRUCTIONS: 
                                                        1. You MUST use the resume content above to provide specific advice
                                                        2. Use a clear, **conversational** tone that's easy for any job seeker to understand
                                                        3. You MUST reference the specific job requirements when making suggestions
                                                        4. If asked for examples, reference their actual experience from the resume
                                                        5. If asked for a professional summary, create one based on their real background AND the job requirements
                                                        6. If asked for project examples, use their actual projects from the resume that align with job needs
                                                        7. If asked for skills to add, suggest based on the specific job requirements, not generic skills
                                                        8. DO NOT give generic advice - everything must be based on their resume content AND the job requirements
                                                        9. Reference specific companies, roles, skills, or projects from their resume
                                                        10. Focus on the specific industry and role mentioned in the job requirements
                                                        11. Ensure that you are not making anything up, it should hold true to what the resume contains
                                                        12. Avoid robotic or overly formal wording — write like you're explaining advice to a friend.
                                                   
                                                   RESPONSE REQUIREMENTS:
                                                        - Start your response by referencing something specific from their resume
                                                        - Connect your advice to the specific job requirements
                                                        - Provide concrete examples based on their actual experience
                                                        - Be specific about what they can add or modify to match the job requirements
                                                        - Use their real background, not generic suggestions
                                                        - Only suggest skills that are actually mentioned in the job requirements
                                                        - Offer one or two **practical, human-friendly** suggestions they can act on
                                                        - Be very succint with the response that you are providing the user
                                                        - VERY IMPORTANT: the user does not need an entire paragraph, the need the truth, brute details, said in a kind way as that will actually help them
                                                   
                                                   Example format: 'Based on your experience as [specific role] at [company] and the job's requirement for [specific skill], you could add: [specific example]'
                                                   
                                                   CRITICAL: Keep it helpful, human, and to-the-point. You are not a robot. You are a friendly, sharp resume coach.
                                                   """)
    chat_chain = chat_prompt | llm | StrOutputParser()
    result = RateLimiterRunnable(chat_chain, daily_limit)
    input = {"resume": resume, "user_message": user_message, "context": context, "job_requirements": job_requirements}
    output = result.invoke(input=input)
    
    return {
        'success': True,
        'response': output
    }