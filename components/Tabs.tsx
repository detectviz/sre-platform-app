
import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';

interface TabItem {
  label: string;
  path: string;
  icon?: string;
}

interface TabsProps {
  tabs: TabItem[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const activeClassName = "border-b-2 border-sky-400 text-white";
  const inactiveClassName = "border-b-2 border-transparent text-slate-400 hover:text-white hover:border-slate-500";

  return (
    <div className="border-b border-slate-700/50">
      <nav className="flex space-x-6 -mb-px">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end // Use 'end' to match the exact path for index routes
            className={({ isActive }) => 
              `${isActive ? activeClassName : inactiveClassName} flex items-center px-3 py-2 font-medium text-sm transition-colors duration-200`
            }
          >
            {tab.icon && <Icon name={tab.icon} className="w-4 h-4 mr-2" />}
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
