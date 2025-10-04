import React, { useId, useMemo } from 'react';
import Icon from './Icon';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value?: string;
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
  placeholder = '請選擇',
  disabled,
  emptyMessage = '目前沒有可用的選項',
}) => {
  const selectId = useId();

  const normalizedValue = typeof value === 'string' ? value : '';

  const hasValue = useMemo(
    () => options.some(option => option.value === normalizedValue),
    [options, normalizedValue]
  );
  const selectValue = hasValue ? normalizedValue : '';
  const isEmpty = options.length === 0;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="relative">
      <select
        id={selectId}
        value={selectValue}
        onChange={handleChange}
        disabled={disabled || isEmpty}
        className="w-full appearance-none rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 pr-10 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isEmpty ? (
          <option value="" disabled>
            {emptyMessage}
          </option>
        ) : (
          <>
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </>
        )}
      </select>
      <Icon
        name="chevron-down"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </div>
  );
};

export default SearchableSelect;
