import { TruncatedText } from '../TruncatedText/TruncatedText';

interface CellRendererProps {
  value: any;
  maxLength?: number;
}

/**
 * Smart cell renderer that handles different data types
 */
export function CellRenderer({ value, maxLength = 150 }: CellRendererProps) {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <span className="text-slate-400">—</span>;
  }
  
  // Handle boolean
  if (typeof value === 'boolean') {
    return (
      <span className={value ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}>
        {value ? '✓ Yes' : '✗ No'}
      </span>
    );
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    const joined = value.join(', ');
    if (joined.length > maxLength) {
      return <TruncatedText text={joined} maxLength={maxLength} />;
    }
    return <span className="break-words">{joined}</span>;
  }
  
  // Handle objects
  if (typeof value === 'object') {
    const stringified = JSON.stringify(value, null, 2);
    return <TruncatedText text={stringified} maxLength={maxLength} />;
  }
  
  const stringValue = String(value);
  
  // Handle URLs
  const isUrl = /^https?:\/\//i.test(stringValue);
  if (isUrl) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={stringValue}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline break-all line-clamp-2"
          onClick={(e) => e.stopPropagation()}
          title={stringValue}
        >
          {stringValue}
        </a>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(stringValue);
          }}
          className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          title="Copy URL"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    );
  }
  
  // Handle email addresses
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue);
  if (isEmail) {
    return (
      <a
        href={`mailto:${stringValue}`}
        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {stringValue}
      </a>
    );
  }
  
  // Handle long text
  if (stringValue.length > maxLength) {
    return <TruncatedText text={stringValue} maxLength={maxLength} />;
  }
  
  // Default text rendering
  return <span className="break-words">{stringValue}</span>;
}
