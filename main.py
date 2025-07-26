from langchain.chat_models import init_chat_model
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.documents import Document
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
import os

os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
if not os.environ.get("GOOGLE_API_KEY"):
  os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

def job_posting(link):
    try:
        loader = WebBaseLoader(link)
        docs = loader.load()
        
        if not docs:
            print("No documents loaded from job posting URL")
            return "Unable to extract job posting content"
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        all_splits = text_splitter.split_documents(docs)
        job_content = "\n".join([doc.page_content for doc in all_splits])
        
        if len(job_content.strip()) < 100:
            return f"Job posting content extracted: {job_content}"
        
        job_analysis_prompt = f"""
        Analyze this job posting and extract the key requirements, skills, and qualifications needed for this position.
        JOB POSTING CONTENT: {job_content}
        Please extract and list:
            1. Required skills and technologies (be specific, don't list generic tech skills unless mentioned)
            2. Required experience and qualifications
            3. Preferred qualifications
            4. Job responsibilities
            5. Industry/domain knowledge needed
        IMPORTANT: Only list skills and requirements that are actually mentioned in the job posting. Do not add generic skills like "AWS, Docker, React" unless they are specifically mentioned.
        Format your response clearly with these sections.
        """
        
        job_prompt = ChatPromptTemplate.from_template(job_analysis_prompt)
        job_chain = LLMChain(llm=llm, prompt=job_prompt)
        analyzed_job = job_chain.run({})
        
        print(f"Job analysis completed, length: {len(analyzed_job)}")
        return analyzed_job
        
    except Exception as e:
        try:
            important_info = []
            for doc in all_splits:
                important_info.append(doc.page_content)
            fallback_content = "\n".join(important_info)
            return fallback_content
        except:
            return f"Error extracting job posting: {str(e)}"

def extract_resume_info(pdf_path):
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    all_splits = text_splitter.split_documents(docs)
    important_info = []
    for doc in all_splits:
        important_info.append(doc.page_content)
    return "\n".join(important_info)

llm = init_chat_model("gemini-2.0-flash", model_provider="google_genai")

def create_analysis_prompt(resume_info, job_info):
    return f"""
        You are an expert resume reviewer and career coach. Your task is to analyze a resume against a specific job posting and provide detailed, actionable feedback.
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
        CRITICAL INSTRUCTIONS:
            - ONLY suggest skills and experience that are actually mentioned in the job requirements above
            - Do NOT suggest generic tech skills (like AWS, Docker, React, TypeScript) unless they are specifically required in the job posting
            - Base all recommendations on the actual job posting content provided
            - Focus on the specific industry, role, and requirements mentioned in the job posting
            - Provide specific examples from their resume that could be enhanced to match job requirements
            - Do not suggest adding fake or non-existent experience
            - If the job posting doesn't mention specific technical skills, don't suggest adding them
        IMPORTANT: The job requirements above are the ONLY skills and qualifications you should reference. Do not add generic suggestions.
        Please structure your response clearly with these sections and be specific about what the job actually requires.
    """

def analyze_resume_and_job(resume_info, job_info):
    try:
        prompt_text = create_analysis_prompt(resume_info, job_info)
        prompt = ChatPromptTemplate.from_template(prompt_text)
        chain = LLMChain(llm=llm, prompt=prompt)
        result = chain.run({})
        
        return {
            'success': True,
            'analysis': result,
            'resume_info': resume_info,
            'job_info': job_info
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def chat_with_ai(resume, user_message, context=None, job_requirements=None):
    try:
        chat_prompt = ChatPromptTemplate.from_template(f"""
            You are helping a user improve their resume for a specific job. You have access to their ACTUAL resume content and the job requirements below.
            USER'S RESUME CONTENT: {resume}
            JOB REQUIREMENTS: {job_requirements if job_requirements else 'No specific job requirements provided'}
            USER'S QUESTION: {user_message}
            PREVIOUS ANALYSIS: {context if context else 'None'}
            INSTRUCTIONS:
                1. You MUST use the resume content above to provide specific advice
                2. You MUST reference the specific job requirements when making suggestions
                3. If asked for examples, reference their actual experience from the resume
                4. If asked for a professional summary, create one based on their real background AND the job requirements
                5. If asked for project examples, use their actual projects from the resume that align with job needs
                6. If asked for skills to add, suggest based on the specific job requirements, not generic skills
                7. DO NOT give generic advice - everything must be based on their resume content AND the job requirements
                8. Reference specific companies, roles, skills, or projects from their resume
                9. DO NOT suggest generic tech skills (AWS, Docker, React, TypeScript) unless they are in the job requirements
                10. Focus on the specific industry and role mentioned in the job requirements
            RESPONSE REQUIREMENTS:
                - Start your response by referencing something specific from their resume
                - Connect your advice to the specific job requirements
                - Provide concrete examples based on their actual experience
                - Be specific about what they can add or modify to match the job requirements
                - Use their real background, not generic suggestions
                - Only suggest skills that are actually mentioned in the job requirements
            Example format: "Based on your experience as [specific role] at [company] and the job's requirement for [specific skill], you could add: [specific example]"
        """)
        
        chat_chain = LLMChain(llm=llm, prompt=chat_prompt)
        response = chat_chain.run({})
        
        return {
            'success': True,
            'response': response
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
    
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")