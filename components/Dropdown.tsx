
import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  minWidth?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange, minWidth = 'w-48' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(opt => opt.value === value)?.label || options[0]?.label;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center">
      <label className="text-sm text-slate-400 mr-2 shrink-0">{label}:</label>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between bg-slate-800/80 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white ${minWidth}`}
        >
          <span className="truncate">{selectedLabel}</span>
          <Icon name="chevron-down" className="w-4 h-4 ml-2 shrink-0" />
        </button>
        {isOpen && (
          <div className={`absolute z-10 mt-1 bg-slate-800 rounded-md shadow-lg border border-slate-700 ${minWidth}`}>
            <ul className="py-1 max-h-60 overflow-y-auto">
              {options.map(option => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-700 ${value === option.value ? 'bg-sky-600 text-white' : 'text-slate-300'}`}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
