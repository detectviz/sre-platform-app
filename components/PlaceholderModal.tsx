import React from 'react';
import Modal from './Modal';
import Icon from './Icon';

interface PlaceholderModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
}

// FIX: Re-implement the PlaceholderModal to correctly handle props and display a message, resolving type errors across multiple pages. The previous implementation was an empty component causing props to be invalid.
const PlaceholderModal: React.FC<PlaceholderModalProps> = ({ isOpen, onClose, featureName }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="功能開發中"
            width="w-1/3"
            footer={
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">
                    了解
                </button>
            }
        >
            <div className="text-center text-slate-300">
                <Icon name="construction" className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <p className="text-lg">
                    「<strong className="font-semibold text-white">{featureName}</strong>」功能目前正在開發中，敬請期待！
                </p>
            </div>
        </Modal>
    );
};
export default PlaceholderModal;
