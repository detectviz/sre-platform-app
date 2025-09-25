import React from 'react';
import Icon from './Icon';

interface ContextualKPICardProps {
  title: string;
  value: string;
  description: React.ReactNode;
  icon: string;
  iconBgColor: string;
}

const ContextualKPICard: React.FC<ContextualKPICardProps> = ({ title, value, description, icon, iconBgColor }) => {
  return (
    <div className="glass-card rounded-xl p-5 flex items-center w-full">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-5 shrink-0 ${iconBgColor}`}>
        <Icon name={icon} className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-400 truncate">{title}</p>
        <p className="text-2xl font-bold text-white truncate">{value}</p>
        <p className="text-xs text-slate-400 truncate">{description}</p>
      </div>
    </div>
  );
};

export default ContextualKPICard;