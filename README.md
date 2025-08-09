# Resume Recommender

An AI-powered web application that analyzes your resume against specific job postings to provide personalized optimization recommendations.

## What It Does

This tool helps job seekers improve their resumes by comparing them against actual job requirements. You upload your PDF resume and provide a job posting link, and the AI analyzes how well your resume matches the specific role.

## Features

- **Resume Analysis**: Upload your PDF resume and get AI-powered feedback
- **Job Posting Integration**: Paste any job posting URL (LinkedIn, Indeed, company career pages, etc.)
- **Personalized Recommendations**: Get specific suggestions based on your actual experience and the job requirements
- **Interactive Chat**: Ask follow-up questions about your resume optimization
- **Modern UI**: Clean, responsive interface with glassmorphism design

## How it works

1. Upload your PDF resume
2. Paste a job posting URL
3. Get AI analysis with:
   - Current resume score (0-100)
   - Missing skills from the job requirements
   - Experience gaps
   - Content improvement suggestions
   - Specific examples based on your background
   - Formatting recommendations
   - ATS optimization tips

## Tech Stack

### Backend
- **Flask**: Python web framework
- **LangChain**: AI/LLM integration
- **Google Gemini 2.0 Flash**: AI model for analysis
- **PyPDF**: PDF parsing
- **BeautifulSoup**: Web scraping for job postings

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Lucide React**: Icons

### Utilization

- Without having to copy the github repo and deploying everything locally, feel free to use it here: https://resume-recommender.onrender.com/

## Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google AI API key

### Backend Setup
```bash
pip install -r requirements.txt
```

Create a `.env` file:
```
GOOGLE_API_KEY=your_google_ai_api_key
LANGSMITH_API_KEY=your_langsmith_key
```

### Frontend Setup
```bash
cd frontend
npm install
```

### Running the Application Locally
```bash
# Backend (port 3050)
python app.py

# Frontend (port 3000)
cd frontend
npm start
```

## API Endpoints

- `POST /analyze`: Analyze resume against job posting
- `POST /chat`: Interactive chat with AI about resume optimization
- `GET /health`: Health check

## Rate Limiting

The application includes a daily rate limiter (100 calls per day) to manage API usage.

## File Structure

```
resume-recommender/
├── app.py              # Flask server
├── main.py             # AI analysis logic
├── requirements.txt    # Python dependencies
├── frontend/          # React application
│   ├── src/
│   │   ├── components/ # UI components
│   │   └── App.tsx    # Main application
│   └── package.json   # Node dependencies
└── temp_uploads/      # Temporary file storage
```

## Limitations

- Only supports PDF resume uploads
- Requires valid job posting URLs
- Daily API call limits apply
- Job posting content extraction may not work for all sites

## Contributing

Feel free to submit issues or pull requests for improvements.
