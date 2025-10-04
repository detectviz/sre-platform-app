import React from 'react';
import Icon from './Icon';

export type StatusTone = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const toneClasses: Record<StatusTone, string> = {
  default: 'bg-slate-800/70 text-slate-200 border border-slate-600/60',
  info: 'bg-sky-950/50 text-sky-200 border border-sky-500/40',
  success: 'bg-emerald-950/50 text-emerald-200 border border-emerald-500/40',
  warning: 'bg-amber-950/60 text-amber-200 border border-amber-500/40',
  danger: 'bg-rose-950/60 text-rose-200 border border-rose-500/40',
  neutral: 'bg-slate-900/60 text-slate-300 border border-slate-600/40',
};

export interface StatusTagProps {
  label: React.ReactNode;
  tone?: StatusTone;
  icon?: string;
  className?: string;
  tooltip?: string;
  dense?: boolean;
}

const StatusTag: React.FC<StatusTagProps> = ({ label, tone = 'default', icon, className = '', tooltip, dense }) => {
  const spacingClass = dense ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';
  const visualClass = className && className.trim().length > 0 ? className : toneClasses[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold leading-none rounded-full transition-colors ${spacingClass} ${visualClass}`}
      title={tooltip}
    >
      {icon && <Icon name={icon} className="w-3.5 h-3.5" />}
      <span className="truncate max-w-[12rem]">{label}</span>
    </span>
  );
};

export default StatusTag;
