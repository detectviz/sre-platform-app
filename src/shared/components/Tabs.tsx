
import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';

interface TabItem {
  label: string;
  path: string;
  icon?: string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const activeClassName = "border-b-[3px] border-sky-500 text-white";
  const inactiveClassName = "border-b-[3px] border-transparent text-slate-400 hover:text-slate-100 hover:border-sky-700/60";
  const baseClassName = "flex items-center px-3 py-2 font-medium text-sm transition-colors duration-200";
  const disabledClassName = "border-b-[3px] border-transparent text-slate-600 cursor-not-allowed opacity-50";

  return (
    <div className="border-b border-slate-700/50">
      <nav className="flex space-x-6 -mb-px">
        {tabs.map((tab) => {
          if (tab.disabled) {
            return (
              <span
                key={tab.path}
                className={`${baseClassName} ${disabledClassName}`}
                title="此功能僅商業版支援"
              >
                {tab.icon && <Icon name={tab.icon} className="w-4 h-4 mr-2" />}
                {tab.label}
              </span>
            );
          }
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end // Use 'end' to match the exact path for index routes
              className={({ isActive }) => 
                `${baseClassName} ${isActive ? activeClassName : inactiveClassName}`
              }
            >
              {tab.icon && <Icon name={tab.icon} className="w-4 h-4 mr-2" />}
              {tab.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;