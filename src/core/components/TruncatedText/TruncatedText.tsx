import { useState } from 'react';

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

/**
 * TruncatedText component
 * Displays text with expand/collapse functionality for long content
 */
export function TruncatedText({ 
  text, 
  maxLength = 100,
  className = '' 
}: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }
  
  const displayText = isExpanded ? text : `${text.slice(0, maxLength)}...`;
  
  return (
    <div className={className}>
      <span className="break-words">{displayText}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="ml-2 text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
}
