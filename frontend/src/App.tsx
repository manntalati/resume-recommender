import React, { useState } from 'react';
import { FileText, Upload, Link, Send, AlertCircle, CheckCircle, Lightbulb, TrendingUp, Target, Zap } from 'lucide-react';
import ResumeUpload from './components/ResumeUpload';
import JobLinkInput from './components/JobLinkInput';
import RecommendationCard from './components/RecommendationCard';
import ChatInterface from './components/ChatInterface';

interface Recommendation {
  id: string;
  type: 'rating' | 'missing' | 'improvement' | 'suggestion' | 'score' | 'target' | 'skills' | 'experience' | 'content' | 'examples' | 'formatting';
  title: string;
  content: string;
  icon: React.ReactNode;
  color: string;
}

function App() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobLink, setJobLink] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analysisNote, setAnalysisNote] = useState<string>('');

  const parseAnalysisResult = (aiResponse: string): Recommendation[] => {
    console.log('Parsing AI response:', aiResponse.substring(0, 500) + '...');
    const recommendations: Recommendation[] = [];
    const scoreMatch = aiResponse.match(/\*\*1\. Current Score \(0-100\):\*\* (\d+)/);
    const targetMatch = aiResponse.match(/\*\*2\. Target Score:\*\* (\d+)/);
    
    console.log('Score match:', scoreMatch);
    console.log('Target match:', targetMatch);
    
    if (scoreMatch && targetMatch) {
      recommendations.push({
        id: 'score',
        type: 'score',
        title: 'Resume Score',
        content: `Current Score: ${scoreMatch[1]}/100 | Target Score: ${targetMatch[1]}/100`,
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-green-500'
      });
    }

    const missingSkillsMatch = aiResponse.match(/\*\*3\. Missing Skills:\*\*([\s\S]*?)(?=\*\*4\.|$)/);
    if (missingSkillsMatch) {
      const skillsContent = missingSkillsMatch[1].trim();
      if (skillsContent && skillsContent !== '*') {
        const cleanedContent = cleanFormatting(skillsContent);
        if (cleanedContent) {
          recommendations.push({
            id: 'missing-skills',
            type: 'missing',
            title: 'Missing Skills',
            content: cleanedContent,
            icon: <AlertCircle className="w-5 h-5" />,
            color: 'text-red-500'
          });
        }
      }
    }

    const experienceMatch = aiResponse.match(/\*\*4\. Experience Gaps:\*\*([\s\S]*?)(?=\*\*5\.|$)/);
    if (experienceMatch) {
      const experienceContent = experienceMatch[1].trim();
      if (experienceContent && experienceContent !== '*') {
        const cleanedContent = cleanFormatting(experienceContent);
        if (cleanedContent) {
          recommendations.push({
            id: 'experience-gaps',
            type: 'experience',
            title: 'Experience Gaps',
            content: cleanedContent,
            icon: <Target className="w-5 h-5" />,
            color: 'text-orange-500'
          });
        }
      }
    }

    const improvementsMatch = aiResponse.match(/\*\*5\. Content Improvements:\*\*([\s\S]*?)(?=\*\*6\.|$)/);
    if (improvementsMatch) {
      const improvementsContent = improvementsMatch[1].trim();
      if (improvementsContent && improvementsContent !== '*') {
        const cleanedContent = cleanFormatting(improvementsContent);
        if (cleanedContent) {
          recommendations.push({
            id: 'content-improvements',
            type: 'improvement',
            title: 'Content Improvements',
            content: cleanedContent,
            icon: <CheckCircle className="w-5 h-5" />,
            color: 'text-blue-500'
          });
        }
      }
    }

    const examplesMatch = aiResponse.match(/\*\*6\. Specific Examples:\*\*([\s\S]*?)(?=\*\*7\.|$)/);
    if (examplesMatch) {
      const examplesContent = examplesMatch[1].trim();
      if (examplesContent && examplesContent !== '*') {
        const cleanedContent = cleanFormatting(examplesContent);
        if (cleanedContent) {
          recommendations.push({
            id: 'specific-examples',
            type: 'examples',
            title: 'Specific Examples',
            content: cleanedContent,
            icon: <Lightbulb className="w-5 h-5" />,
            color: 'text-purple-500'
          });
        }
      }
    }

    const formattingMatch = aiResponse.match(/\*\*7\. Formatting Suggestions:\*\*([\s\S]*?)(?=\*\*|$)/);
    if (formattingMatch) {
      const formattingContent = formattingMatch[1].trim();
      if (formattingContent && formattingContent !== '*') {
        const cleanedContent = cleanFormatting(formattingContent);
        if (cleanedContent) {
          recommendations.push({
            id: 'formatting-suggestions',
            type: 'formatting',
            title: 'Formatting Suggestions',
            content: cleanedContent,
            icon: <Zap className="w-5 h-5" />,
            color: 'text-yellow-500'
          });
        }
      }
    }

    return recommendations;
  };

  const cleanFormatting = (content: string): string => {
    return content
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^[•\*]\s*/gm, '')
      .replace(/^\s*[•\*]\s*/gm, '')
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/gm, '')
      .replace(/^([^:]+):/gm, '**$1:**')
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.trim())
      .join('\n\n')
      .trim();
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jobLink) {
      alert('Please upload a resume and provide a job posting link');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisNote('');
    
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('job_link', jobLink);

      console.log('Sending request to /analyze...');
      console.log('Resume file:', resumeFile.name);
      console.log('Job link:', jobLink);

      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Backend response:', data);
      
      if (data.status === 'success') {
        if (data.message && data.message.includes("Since the job posting content couldn't be extracted automatically")) {
          setAnalysisNote('Note: Job posting content couldn\'t be extracted automatically. Analysis based on general resume optimization best practices.');
        }
        
        console.log('Parsing analysis result...');
        const parsedRecommendations = parseAnalysisResult(data.message || '');
        console.log('Parsed recommendations:', parsedRecommendations);
        setRecommendations(parsedRecommendations);
        setHasAnalyzed(true);
      } else {
        console.error('Analysis failed:', data.error);
        alert('Analysis failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    setHasAnalyzed(false);
    setRecommendations([]);
    setAnalysisNote('');
    setResumeFile(null);
    setJobLink('');
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
              {analysisNote && (
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">{analysisNote}</p>
                </div>
              )}
            </div>
            {/* Back Button */}
            <div className="text-left">
              <button
                onClick={handleBack}
                className="btn-secondary mb-4 px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition"
              >
                ← Back
              </button>
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