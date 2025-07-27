import React from 'react';

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
  const getBorderColor = (type: string) => {
    switch (type) {
      case 'rating':
      case 'score':
        return 'border-beige-500';
      case 'missing':
      case 'skills':
        return 'border-red-500';
      case 'improvement':
      case 'content':
        return 'border-green-500';
      case 'suggestion':
      case 'formatting':
        return 'border-blue-500';
      case 'experience':
        return 'border-orange-500';
      case 'examples':
        return 'border-purple-500';
      default:
        return 'border-gray-700';
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="text-gray-300 leading-relaxed mb-3 last:mb-0">
        {paragraph.split('**').map((part, partIndex) => {
          if (partIndex % 2 === 1) {
            return <span key={partIndex} className="font-semibold text-white">{part}</span>;
          }
          return part;
        })}
      </p>
    ));
  };

  return (
    <div className={`card border-l-4 ${getBorderColor(recommendation.type)}`}>
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 ${recommendation.color}`}>
          {recommendation.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-3">
            {recommendation.title}
          </h3>
          <div className="text-gray-300">
            {formatContent(recommendation.content)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard; 