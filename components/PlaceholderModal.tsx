import React from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { useContent } from '../contexts/ContentContext';

interface PlaceholderModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
}

const PlaceholderModal: React.FC<PlaceholderModalProps> = ({ isOpen, onClose, featureName }) => {
    const { content } = useContent();
    const modalContent = content?.PLACEHOLDER_MODAL;

    if (!modalContent) return null;

    const message = modalContent.MESSAGE
        ? modalContent.MESSAGE.replace('{featureName}', featureName)
        : `The "${featureName}" feature is currently under construction. Please check back later!`;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalContent.TITLE}
            width="w-1/3"
            footer={
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">
                    {modalContent.OK_BUTTON}
                </button>
            }
        >
            <div className="text-center text-slate-300">
                <Icon name="construction" className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <p className="text-lg">
                    {message}
                </p>
            </div>
        </Modal>
    );
};
export default PlaceholderModal;
