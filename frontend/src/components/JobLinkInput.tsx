import React, { useState } from 'react';
import { Link, ExternalLink, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

interface JobLinkInputProps {
  value: string;
  onChange: (value: string) => void;
}

const JobLinkInput: React.FC<JobLinkInputProps> = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsValid(validateUrl(newValue));
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className={`
          relative overflow-hidden rounded-2xl transition-all duration-300
          ${isFocused ? 'scale-105' : 'hover:scale-102'}
        `}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-accent-secondary/5 to-accent-tertiary/5 animate-pulse-slow" />
          
          <div className={`
            relative glass-card p-6 transition-all duration-300
            ${isFocused ? 'shadow-accent' : 'hover:shadow-glass'}
          `}>
            <div className="absolute top-2 right-2 w-1 h-1 bg-accent-primary rounded-full animate-pulse" />
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-accent-secondary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full blur-md animate-pulse-slow" />
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-full p-2 border border-white/20">
                    <Link className="w-6 h-6 text-accent-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white gradient-text">
                    Job Posting Link
                  </h3>
                  <p className="text-neutral-400 text-sm">
                    Paste the job posting URL here
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="url"
                  value={value}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="https://linkedin.com/jobs/view/..."
                  className="input-field w-full pr-12"
                />
                
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {value && (
                    <div className="flex items-center space-x-2">
                      {isValid ? (
                        <CheckCircle className="w-5 h-5 text-accent-secondary animate-scale-in" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-accent-primary animate-scale-in" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {value && !isValid && (
                <div className="mt-3 flex items-center space-x-2 text-accent-primary text-sm animate-fade-in">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please enter a valid URL</span>
                </div>
              )}
              
              {value && isValid && (
                <div className="mt-3 flex items-center space-x-2 text-accent-secondary text-sm animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <span>Valid URL format</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card p-4 animate-fade-in">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-accent-secondary mt-0.5 animate-pulse" />
          <div>
            <p className="text-white font-medium mb-1">Supported Platforms</p>
            <p className="text-neutral-400 text-sm">
              LinkedIn, Indeed, Glassdoor, Company Career Pages, and more
            </p>
          </div>
        </div>
      </div>
      
      {value && isValid && (
        <div className="flex space-x-3 animate-slide-up">
          <button
            onClick={() => window.open(value, '_blank')}
            className="btn-secondary flex items-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Link</span>
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(value);
              const notification = document.createElement('div');
              notification.className = 'notification success animate-slide-up';
              notification.innerHTML = `
                <div class="flex items-center space-x-3">
                  <div class="w-5 h-5 text-accent-secondary">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <span class="text-white">Link copied to clipboard!</span>
                </div>
              `;
              document.body.appendChild(notification);
              setTimeout(() => notification.remove(), 3000);
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy Link</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default JobLinkInput; 