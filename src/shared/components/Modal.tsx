import React, { useEffect } from 'react';
import Icon from './Icon';
import { useContentSection } from '@/contexts/ContentContext';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children, footer, width, className }) => {
  const modalContent = useContentSection('MODAL');
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return <></>;

  const finalWidth = width || modalContent?.DEFAULT_WIDTH || 'w-1/2';
  const finalClassName = className || `${modalContent?.BASE_CLASSES || ''} ${finalWidth}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-start pt-20 transition-opacity duration-300" onClick={onClose}>
      <div
        className={finalClassName}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white">
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end p-4 border-t border-slate-700/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;