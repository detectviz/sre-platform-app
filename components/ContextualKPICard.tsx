
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
    <div className="glass-card rounded-xl p-5 flex items-center">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-5 ${iconBgColor}`}>
        <Icon name={icon} className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
};

export default ContextualKPICard;
