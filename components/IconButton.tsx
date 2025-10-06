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
  default: 'app-icon-btn app-icon-btn--ghost',
  primary: 'app-icon-btn app-icon-btn--primary',
  danger: 'app-icon-btn app-icon-btn--danger',
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
    className={`${toneClasses[tone]} ${className}`.trim()}
  >
    <Icon name={isLoading ? 'loader-circle' : icon} className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
  </button>
);

export default IconButton;
