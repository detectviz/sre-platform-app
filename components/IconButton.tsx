import React from 'react';
import Icon from './Icon';

type IconButtonTone = 'default' | 'primary' | 'danger';

interface IconButtonProps {
  icon: string;
  label: string;
  onClick?: () => void;
  tone?: IconButtonTone;
  disabled?: boolean;
  className?: string;
  tooltip?: string;
  isLoading?: boolean;
}

const toneClasses: Record<IconButtonTone, string> = {
  default: 'text-slate-300 hover:bg-slate-700/70 hover:text-white focus-visible:ring-slate-500/60',
  primary: 'text-sky-300 hover:bg-sky-600/20 hover:text-sky-200 focus-visible:ring-sky-500/60',
  danger: 'text-rose-300 hover:bg-rose-600/20 hover:text-rose-200 focus-visible:ring-rose-500/60',
};

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  onClick,
  tone = 'default',
  disabled,
  className = '',
  tooltip,
  isLoading = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={tooltip || label}
    disabled={disabled || isLoading}
    className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-transparent text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 ${toneClasses[tone]} ${className}`}
  >
    <Icon name={isLoading ? 'loader-circle' : icon} className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
  </button>
);

export default IconButton;
