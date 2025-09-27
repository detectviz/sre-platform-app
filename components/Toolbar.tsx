import React from 'react';
import Icon from './Icon';
import { PAGE_CONTENT } from '../constants/pages';

const { GLOBAL: globalContent } = PAGE_CONTENT;

interface BatchActionToolbarProps {
    count: number;
    onClear: () => void;
    children: React.ReactNode;
}

const BatchActionToolbar: React.FC<BatchActionToolbarProps> = ({ count, onClear, children }) => {
    return (
        <div className="flex justify-between items-center bg-sky-900/50 border border-sky-700/80 rounded-lg px-4 py-2 mb-4 animate-fade-in-down">
            <div className="flex items-center space-x-4">
                <button onClick={onClear} className="p-1.5 rounded-full text-slate-300 hover:bg-slate-700/50 hover:text-white" title={globalContent.CLEAR_SELECTION}>
                    <Icon name="x" className="w-5 h-5" />
                </button>
                <span className="font-semibold text-white">{globalContent.ITEMS_SELECTED(count)}</span>
            </div>
            <div className="flex items-center space-x-2">
                {children}
            </div>
        </div>
    );
};

interface ToolbarProps {
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  selectedCount?: number;
  onClearSelection?: () => void;
  batchActions?: React.ReactNode;
}

const Toolbar: React.FC<ToolbarProps> = ({ leftActions, rightActions, selectedCount = 0, onClearSelection, batchActions }) => {
    if (selectedCount > 0 && onClearSelection && batchActions) {
        return (
            <BatchActionToolbar count={selectedCount} onClear={onClearSelection}>
                {batchActions}
            </BatchActionToolbar>
        );
    }

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-2">
        {leftActions}
      </div>
      <div className="flex items-center space-x-2">
        {rightActions}
      </div>
    </div>
  );
};

export default Toolbar;

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  text: string;
  primary?: boolean;
  danger?: boolean;
  ai?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, text, primary = false, danger = false, ai = false, ...props }) => {
    const baseClasses = "flex items-center text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed";
    const primaryClasses = "text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 focus:ring-sky-500 font-semibold";
    const defaultClasses = "text-slate-300 bg-slate-700/50 border border-slate-600/80 hover:bg-slate-700/80 hover:border-slate-500/80 focus:ring-slate-500";
    const dangerClasses = "text-red-300 bg-red-900/20 border border-red-700/60 hover:bg-red-900/40 hover:border-red-600/80 focus:ring-red-500";
    const aiClasses = "text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 focus:ring-purple-500 font-semibold";

    const getVariantClasses = () => {
        if (ai) return aiClasses;
        if (primary) return primaryClasses;
        if (danger) return dangerClasses;
        return defaultClasses;
    }

    return (
        <button {...props} className={`${baseClasses} ${getVariantClasses()}`}>
            <Icon name={icon} className="w-4 h-4 mr-2"/> {text}
        </button>
    );
};