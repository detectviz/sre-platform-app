import React from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { PAGE_CONTENT } from '../constants/pages';

const { PLACEHOLDER_MODAL: content } = PAGE_CONTENT;


interface PlaceholderModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
}

const PlaceholderModal: React.FC<PlaceholderModalProps> = ({ isOpen, onClose, featureName }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={content.TITLE}
            width="w-1/3"
            footer={
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">
                    {content.OK_BUTTON}
                </button>
            }
        >
            <div className="text-center text-slate-300">
                <Icon name="construction" className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <p className="text-lg">
                    {content.MESSAGE(featureName)}
                </p>
            </div>
        </Modal>
    );
};
export default PlaceholderModal;
