import React, { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Lightbulb, Zap, Target, Star, ArrowRight } from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'rating' | 'missing' | 'improvement' | 'suggestion' | 'score' | 'target' | 'skills' | 'experience' | 'content' | 'examples' | 'formatting';
  title: string;
  content: string;
  icon: React.ReactNode;
  color: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getIconComponent = (type: string) => {
    switch (type) {
      case 'score':
        return <TrendingUp className="w-6 h-6" />;
      case 'missing':
        return <AlertCircle className="w-6 h-6" />;
      case 'improvement':
        return <CheckCircle className="w-6 h-6" />;
      case 'examples':
        return <Lightbulb className="w-6 h-6" />;
      case 'formatting':
        return <Zap className="w-6 h-6" />;
      case 'experience':
        return <Target className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getGradientColors = (type: string) => {
    switch (type) {
      case 'score':
        return 'from-accent-secondary to-accent-tertiary';
      case 'missing':
        return 'from-accent-primary to-accent-secondary';
      case 'improvement':
        return 'from-accent-tertiary to-accent-highlight';
      case 'examples':
        return 'from-accent-secondary to-accent-primary';
      case 'formatting':
        return 'from-accent-highlight to-accent-secondary';
      case 'experience':
        return 'from-accent-primary to-accent-tertiary';
      default:
        return 'from-accent-secondary to-accent-primary';
    }
  };

  const getGlowColor = (type: string) => {
    switch (type) {
      case 'score':
        return 'shadow-accent-secondary';
      case 'missing':
        return 'shadow-accent-primary';
      case 'improvement':
        return 'shadow-accent-tertiary';
      case 'examples':
        return 'shadow-accent-secondary';
      case 'formatting':
        return 'shadow-accent-highlight';
      case 'experience':
        return 'shadow-accent-primary';
      default:
        return 'shadow-accent-secondary';
    }
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove italic markdown
      .replace(/^[•*]\s*/gm, '') // Remove bullet points
      .replace(/^\s*[•*]\s*/gm, '') // Remove bullet points with spaces
      .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
      .replace(/^\s+|\s+$/gm, '') // Trim whitespace
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        // Format headers (lines ending with :)
        if (line.includes(':')) {
          const [header, ...rest] = line.split(':');
          if (rest.length > 0) {
            return `<strong>${header.trim()}:</strong> ${rest.join(':').trim()}`;
          }
        }
        return line.trim();
      })
      .join('\n\n');
  };

  const renderFormattedContent = (content: string) => {
    const formattedContent = formatContent(content);
    return formattedContent.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-3 last:mb-0">
        {paragraph.split('\n').map((line, lineIndex) => (
          <span key={lineIndex} dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </p>
    ));
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from closing
    const formattedContent = formatContent(recommendation.content);
    navigator.clipboard.writeText(formattedContent);
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'notification success animate-slide-up';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-5 h-5 text-accent-secondary">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <span class="text-white">Recommendation copied to clipboard!</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from closing
    // Add save functionality here
    const notification = document.createElement('div');
    notification.className = 'notification success animate-slide-up';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-5 h-5 text-accent-secondary">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <span class="text-white">Recommendation saved!</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  return (
    <div
      className={`
        relative group cursor-pointer transition-all duration-500 animate-fade-in
        ${isHovered ? 'scale-105' : 'hover:scale-102'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-accent-secondary/5 to-accent-tertiary/5 animate-pulse-slow rounded-2xl" />
      
      <div className={`
        relative glass-card p-6 transition-all duration-300
        ${isHovered ? getGlowColor(recommendation.type) : 'hover:shadow-glass'}
      `}>
        <div className="absolute top-3 right-3 w-2 h-2 bg-accent-primary rounded-full animate-pulse" />
        <div className="absolute bottom-3 left-3 w-1 h-1 bg-accent-secondary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${getGradientColors(recommendation.type)} rounded-full blur-lg opacity-50 animate-pulse-slow`} />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-full p-3 border border-white/10">
                <div className={`text-${recommendation.color.replace('text-', '')}`}>
                  {getIconComponent(recommendation.type)}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white gradient-text">
                {recommendation.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 bg-gradient-to-r ${getGradientColors(recommendation.type)} rounded-full animate-pulse`} />
                <span className="text-neutral-400 text-sm capitalize">
                  {recommendation.type.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>
          
          <div className={`
            transform transition-transform duration-300
            ${isExpanded ? 'rotate-90' : ''}
          `}>
            <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-white" />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-neutral-300 line-clamp-2">
            {renderFormattedContent(recommendation.content).slice(0, 1)}
          </div>
        </div>
        
        <div className={`
          overflow-hidden transition-all duration-500
          ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="border-t border-white/10 pt-4">
            <div className="scrollable-content formatted-text max-h-80">
              {renderFormattedContent(recommendation.content)}
            </div>
          </div>
        </div>
        
        <div className={`
          flex space-x-3 transition-all duration-300
          ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}>
          <button 
            onClick={handleSave}
            className="btn-secondary flex items-center space-x-2 text-sm"
          >
            <Star className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button 
            onClick={handleCopy}
            className="btn-secondary flex items-center space-x-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy</span>
          </button>
        </div>
        
        {recommendation.type === 'score' && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-neutral-400 mb-2">
              <span>Current Score</span>
              <span>Target Score</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: '75%' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard; 