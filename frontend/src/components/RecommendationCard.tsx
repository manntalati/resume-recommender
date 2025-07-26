import React from 'react';

interface Recommendation {
  id: string;
  type: 'rating' | 'missing' | 'improvement' | 'suggestion';
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
        return 'border-beige-500';
      case 'missing':
        return 'border-red-500';
      case 'improvement':
        return 'border-green-500';
      case 'suggestion':
        return 'border-blue-500';
      default:
        return 'border-gray-700';
    }
  };

  return (
    <div className={`card border-l-4 ${getBorderColor(recommendation.type)}`}>
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 ${recommendation.color}`}>
          {recommendation.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {recommendation.title}
          </h3>
          <p className="text-gray-300 leading-relaxed">
            {recommendation.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard; 