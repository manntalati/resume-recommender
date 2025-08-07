import React, { useState } from 'react';
import { Upload, Link, Send, AlertCircle, CheckCircle, Lightbulb, TrendingUp, Target, Zap, Sparkles, ArrowLeft } from 'lucide-react';
import ResumeUpload from './components/ResumeUpload';
import JobLinkInput from './components/JobLinkInput';
import RecommendationCard from './components/RecommendationCard';
import ChatInterface from './components/ChatInterface';
import AnimatedBackground from './components/AnimatedBackground';

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
  const [resumeContent, setResumeContent] = useState<string>('');
  const [jobContent, setJobContent] = useState<string>('');

  const parseAnalysisResult = (aiResponse: string): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const scoreMatch = aiResponse.match(/\*\*1\. Current Score \(0-100\):\*\* (\d+)/);
    const targetMatch = aiResponse.match(/\*\*2\. Target Score:\*\* (\d+)/);
    
    if (scoreMatch && targetMatch) {
      recommendations.push({
        id: 'score',
        type: 'score',
        title: 'Resume Score',
        content: `Current Score: ${scoreMatch[1]}/100 | Target Score: ${targetMatch[1]}/100`,
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-accent-secondary'
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
            color: 'text-accent-primary'
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
            color: 'text-accent-tertiary'
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
            color: 'text-accent-highlight'
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
            color: 'text-accent-secondary'
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
            color: 'text-accent-tertiary'
          });
        }
      }
    }

    return recommendations;
  };

  const cleanFormatting = (content: string): string => {
    return content
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove italic markdown
      .replace(/^[•\*]\s*/gm, '') // Remove bullet points
      .replace(/^\s*[•\*]\s*/gm, '') // Remove bullet points with spaces
      .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
      .replace(/^\s+|\s+$/gm, '') // Trim whitespace
      .replace(/^([^:]+):/gm, '$1:') // Clean up headers
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        // Clean up the line and make it more readable
        let cleanedLine = line.trim();
        
        // Remove any remaining markdown artifacts
        cleanedLine = cleanedLine.replace(/^\d+\.\s*/, ''); // Remove numbered lists
        cleanedLine = cleanedLine.replace(/^[-*]\s*/, ''); // Remove list markers
        
        // Capitalize first letter if it's a sentence
        if (cleanedLine.length > 0 && /^[a-z]/.test(cleanedLine)) {
          cleanedLine = cleanedLine.charAt(0).toUpperCase() + cleanedLine.slice(1);
        }
        
        return cleanedLine;
      })
      .join('\n\n')
      .trim();
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jobLink) {
      showNotification('Please upload a resume and provide a job posting link', 'error');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisNote('');
    
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('job_link', jobLink);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        if (data.message && data.message.includes("Since the job posting content couldn't be extracted automatically")) {
          setAnalysisNote('Note: Job posting content couldn\'t be extracted automatically. Analysis based on general resume optimization best practices.');
        }
        
        if (data.resume_content) {
          setResumeContent(data.resume_content);
        }
        if (data.job_content) {
          setJobContent(data.job_content);
        }
        
        const parsedRecommendations = parseAnalysisResult(data.message || '');
        setRecommendations(parsedRecommendations);
        setHasAnalyzed(true);
        showNotification('Analysis completed successfully!', 'success');
      } else {
        showNotification('Analysis failed: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      showNotification('Analysis failed. Please try again.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type} animate-slide-up`;
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        ${type === 'success' ? '<div class="w-5 h-5 text-accent-secondary"><svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div>' : '<div class="w-5 h-5 text-accent-primary"><svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg></div>'}
        <span class="text-white">${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const handleBack = () => {
    setHasAnalyzed(false);
    setRecommendations([]);
    setAnalysisNote('');
    setJobLink('');
    setIsAnalyzing(false);
    setResumeContent('');
    setJobContent('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <main className="max-w-6xl mx-auto px-6 py-12 pb-20">
          {!hasAnalyzed ? (
            <div className="space-y-12 animate-fade-in">
              <div className="text-center mb-12">
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary rounded-full blur-3xl opacity-30 animate-pulse-slow" />
                  <div className="relative bg-white/5 backdrop-blur-xl rounded-full p-8 border border-white/10">
                    <Sparkles className="w-16 h-16 text-accent-primary mx-auto animate-bounce-slow" />
                  </div>
                </div>
                
                <h2 className="text-5xl font-bold text-white mb-6 gradient-text">
                  Optimize Your Resume
                </h2>
                <p className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                  Upload your resume and provide a job posting link to get personalized AI-powered recommendations
                </p>
              </div>

              <div className="card-grid">
                <div className="card-hover">
                  <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                    <Upload className="w-6 h-6 mr-3 text-accent-primary" />
                    Upload Your Resume
                  </h3>
                  <ResumeUpload 
                    onFileSelect={setResumeFile} 
                    selectedFile={resumeFile}
                  />
                </div>
                
                <div className="card-hover">
                  <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                    <Link className="w-6 h-6 mr-3 text-accent-secondary" />
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
                  className="btn-gradient disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto text-lg px-12 py-6"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="loading-spinner mr-4"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6 mr-3" />
                      Get AI Recommendations
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4 gradient-text">
                  Your AI Analysis
                </h2>
                <p className="text-neutral-400 text-lg">
                  Based on your resume and the job posting
                </p>
                {analysisNote && (
                  <div className="mt-6 glass-card p-4 border-l-4 border-accent-tertiary">
                    <p className="text-accent-tertiary text-sm">{analysisNote}</p>
                  </div>
                )}
              </div>

              <div className="text-left">
                <button
                  onClick={handleBack}
                  className="btn-secondary flex items-center space-x-2 px-6 py-3 rounded-xl"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Start Over</span>
                </button>
              </div>

              <div className="card-grid pb-8">
                {recommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                  />
                ))}
              </div>

              <div className="mt-16">
                <ChatInterface 
                  resumeContent={resumeContent}
                  jobContent={jobContent}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App; 