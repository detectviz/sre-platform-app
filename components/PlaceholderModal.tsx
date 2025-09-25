import React from 'react';
import Modal from './Modal';
import Icon from './Icon';

interface PlaceholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

const PlaceholderModal: React.FC<PlaceholderModalProps> = ({ isOpen, onClose, featureName }) => {
  return (
    <Modal
      title="功能開發中"
      isOpen={isOpen}
      onClose={onClose}
      width="w-1/3"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md"
        >
          了解
        </button>
      }
    >
      <div className="text-center py-8">
        <Icon name="construction" className="w-16 h-16 mx-auto mb-4 text-slate-500" />
        <h2 className="text-xl font-bold text-white mb-2">"{featureName}" 功能即將推出</h2>
        <p className="text-slate-400">我們的團隊正在努力開發此功能，敬請期待！</p>
      </div>
    </Modal>
  );
};

export default PlaceholderModal;