import React, { useEffect } from 'react';
import Icon from './Icon';

interface DrawerProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  extra?: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({ title, isOpen, onClose, children, width = 'w-2/3', extra }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
      
      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full bg-slate-900/80 backdrop-filter backdrop-blur-xl border-l border-slate-700/50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${width} ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700/50 shrink-0">
          <h2 className="text-lg font-semibold text-white truncate pr-4">{title}</h2>
          <div className="flex items-center space-x-2">
            {extra}
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white">
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;