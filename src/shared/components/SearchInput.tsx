import React from 'react';
import Icon from './Icon';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  autoFocus?: boolean;
  clearButtonLabel?: string;
  onClear?: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = '搜尋',
  ariaLabel = '搜尋輸入框',
  className = '',
  autoFocus = false,
  clearButtonLabel = '清除搜尋條件',
  onClear,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleClear = () => {
    onClear?.();
    onChange('');
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm transition focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 ${className}`}
    >
      <Icon name="search" className="h-4 w-4 text-slate-400" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-full p-1 text-slate-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          aria-label={clearButtonLabel}
        >
          <Icon name="x" className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
