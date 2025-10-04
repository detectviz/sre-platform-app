import React, { useEffect, useId, useState } from 'react';
import Icon from './Icon';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = '輸入關鍵字快速搜尋',
  disabled,
  emptyMessage = '沒有符合的選項',
}) => {
  const inputId = useId();
  const datalistId = `${inputId}-options`;
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const selected = options.find(opt => opt.value === value);
    if (selected) {
      setDisplayValue(selected.label);
    } else if (!value) {
      setDisplayValue('');
    }
  }, [options, value]);

  const handleChange = (next: string) => {
    setDisplayValue(next);
    const matchedOption = options.find(opt => opt.value === next || opt.label === next);
    if (matchedOption) {
      onChange(matchedOption.value);
    }
  };

  const handleBlur = () => {
    const matchedOption = options.find(opt => opt.value === displayValue || opt.label === displayValue);
    if (!matchedOption) {
      const selected = options.find(opt => opt.value === value);
      setDisplayValue(selected ? selected.label : '');
    }
  };

  return (
    <div className="relative flex items-center rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/30">
      <Icon name="search" className="mr-2 h-4 w-4 text-slate-400" />
      <input
        list={datalistId}
        id={inputId}
        value={displayValue}
        onChange={event => handleChange(event.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
        aria-autocomplete="list"
        aria-expanded="false"
        role="combobox"
      />
      <datalist id={datalistId}>
        {options.length === 0 ? (
          <option value="" disabled>
            {emptyMessage}
          </option>
        ) : (
          options.map(option => (
            <option key={option.value} value={option.label} />
          ))
        )}
      </datalist>
    </div>
  );
};

export default SearchableSelect;
