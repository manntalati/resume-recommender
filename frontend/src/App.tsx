import React, { useState } from 'react';
import { Upload, Link, Send, FileText, Star, CheckCircle, AlertCircle, Lightbulb, MessageCircle } from 'lucide-react';
import ResumeUpload from './components/ResumeUpload';
import JobLinkInput from './components/JobLinkInput';
import ChatInterface from './components/ChatInterface';
import RecommendationCard from './components/RecommendationCard';

interface Recommendation {
  id: string;
  type: 'rating' | 'missing' | 'improvement' | 'suggestion';
  title: string;
  content: string;
  icon: React.ReactNode;
  color: string;
}

function App() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobLink, setJobLink] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeFile || !jobLink) {
      alert('Please upload a resume and provide a job posting link');
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          type: 'rating',
          title: 'Current Resume Score',
          content: 'Your resume currently scores 65/100. With the suggested improvements, you can reach 85-90/100.',
          icon: <Star className="w-5 h-5" />,
          color: 'text-beige-500'
        },
        {
          id: '2',
          type: 'missing',
          title: 'Missing Key Skills',
          content: 'Add specific technical skills mentioned in the job posting: React.js, TypeScript, AWS, Docker',
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-red-400'
        },
        {
          id: '3',
          type: 'improvement',
          title: 'Experience Enhancement',
          content: 'Quantify your achievements with specific metrics and numbers to make your experience more impactful',
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-green-400'
        },
        {
          id: '4',
          type: 'suggestion',
          title: 'Professional Summary',
          content: 'Add a compelling professional summary at the top that directly addresses the job requirements',
          icon: <Lightbulb className="w-5 h-5" />,
          color: 'text-blue-400'
        }
      ];
      
      setRecommendations(mockRecommendations);
      setHasAnalyzed(true);
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-beige-500" />
              <h1 className="text-2xl font-bold text-white">Resume Recommender</h1>
            </div>
            <p className="text-gray-400 text-sm">AI-Powered Resume Optimization</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!hasAnalyzed ? (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Optimize Your Resume</h2>
              <p className="text-gray-400">Upload your resume and provide a job posting link to get personalized recommendations</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-beige-500" />
                  Upload Your Resume
                </h3>
                <ResumeUpload 
                  onFileSelect={setResumeFile} 
                  selectedFile={resumeFile}
                />
              </div>
              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Link className="w-5 h-5 mr-2 text-beige-500" />
                  Job Posting Link
                </h3>
                <JobLinkInput 
                  value={jobLink}
                  onChange={setJobLink}
                />
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={handleAnalyze}
                disabled={!resumeFile || !jobLink || isAnalyzing}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Get Recommendations
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Your Recommendations</h2>
              <p className="text-gray-400">Based on your resume and the job posting</p>
            </div>
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                />
              ))}
            </div>
            <div className="mt-12">
              <ChatInterface />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 