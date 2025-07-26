import React from 'react';
import { Link } from 'lucide-react';

interface JobLinkInputProps {
  value: string;
  onChange: (value: string) => void;
}

const JobLinkInput: React.FC<JobLinkInputProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Link className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/job-posting"
          className="input-field pl-10 w-full"
        />
      </div>
      <p className="text-sm text-gray-400">
        Paste the URL of the job posting you want to apply for
      </p>
    </div>
  );
};

export default JobLinkInput; 