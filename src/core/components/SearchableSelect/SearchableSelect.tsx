/**
 * Searchable Select Component
 * A select dropdown with search/filter functionality
 */

import { useState, useRef, useEffect } from 'react';
import { LuChevronDown, LuX, LuSearch } from 'react-icons/lu';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  allowCustom?: boolean;
  className?: string;
}

export function SearchableSelect({
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Select or type...',
  disabled = false,
  required = false,
  allowCustom = true,
  className = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        onBlur?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  const handleSelect = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    setSearchTerm(newValue);
    setIsOpen(true);
    
    if (allowCustom) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredOptions.length > 0) {
      e.preventDefault();
      handleSelect(filteredOptions[0]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="block w-full px-3 py-2 pr-20 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              tabIndex={-1}
            >
              <LuX size={16} className="text-slate-400" />
            </button>
          )}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            tabIndex={-1}
          >
            <LuChevronDown
              size={16}
              className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
              {allowCustom ? (
                <div className="flex items-center gap-2">
                  <LuSearch size={14} />
                  <span>Type to add "{inputValue}"</span>
                </div>
              ) : (
                'No options found'
              )}
            </div>
          ) : (
            <ul className="py-1">
              {filteredOptions.map((option, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-900 dark:text-white transition-colors"
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
