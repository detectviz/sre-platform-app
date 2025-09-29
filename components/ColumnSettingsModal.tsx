import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { useContent } from '../contexts/ContentContext';
import { TableColumn } from '../types';

interface ColumnSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newColumnKeys: string[]) => void;
  allColumns: TableColumn[];
  visibleColumnKeys: string[];
}

// Reusable list item component
const ListItem: React.FC<{
    label: string;
    onAction: () => void;
    actionIcon: string;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    isDisplayedList?: boolean;
}> = ({ label, onAction, actionIcon, onMoveUp, onMoveDown, isDisplayedList }) => (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-700/50">
        <p className="font-medium">{label}</p>
        <div className="flex items-center space-x-1">
            {isDisplayedList && (
                <>
                    <button onClick={onMoveUp} disabled={!onMoveUp} className="p-1 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"><Icon name="arrow-up" className="w-4 h-4" /></button>
                    <button onClick={onMoveDown} disabled={!onMoveDown} className="p-1 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"><Icon name="arrow-down" className="w-4 h-4" /></button>
                </>
            )}
            <button onClick={onAction} className="p-1 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white"><Icon name={actionIcon} className="w-4 h-4" /></button>
        </div>
    </div>
);

const ColumnSettingsModal: React.FC<ColumnSettingsModalProps> = ({ isOpen, onClose, onSave, allColumns, visibleColumnKeys }) => {
    const [displayedColumns, setDisplayedColumns] = useState<TableColumn[]>([]);
    const { content: pageContent } = useContent();
    const globalContent = pageContent?.GLOBAL;
    const layoutContent = pageContent?.LAYOUT_SETTINGS;

    useEffect(() => {
        if (isOpen) {
            const initialDisplayed = visibleColumnKeys
                .map(key => allColumns.find(col => col.key === key))
                .filter((col): col is TableColumn => !!col);
            setDisplayedColumns(initialDisplayed);
        }
    }, [isOpen, visibleColumnKeys, allColumns]);

    const availableColumns = allColumns.filter(
        col => !displayedColumns.some(dCol => dCol.key === col.key)
    );

    const handleAdd = (column: TableColumn) => {
        setDisplayedColumns([...displayedColumns, column]);
    };

    const handleRemove = (column: TableColumn) => {
        setDisplayedColumns(displayedColumns.filter(c => c.key !== column.key));
    };
    
    const move = (index: number, direction: 'up' | 'down') => {
        const newDisplayed = [...displayedColumns];
        if (direction === 'up' && index > 0) {
            [newDisplayed[index - 1], newDisplayed[index]] = [newDisplayed[index], newDisplayed[index - 1]];
        }
        if (direction === 'down' && index < newDisplayed.length - 1) {
            [newDisplayed[index + 1], newDisplayed[index]] = [newDisplayed[index], newDisplayed[index + 1]];
        }
        setDisplayedColumns(newDisplayed);
    };
    
    const handleConfirmSave = () => {
        onSave(displayedColumns.map(col => col.key));
    };

    if (!globalContent || !layoutContent) {
        return null;
    }

    return (
        <Modal
            title={globalContent.COLUMN_SETTINGS}
            isOpen={isOpen}
            onClose={onClose}
            width="w-2/3 max-w-4xl"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">{globalContent.CANCEL}</button>
                    <button onClick={handleConfirmSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">{globalContent.SAVE}</button>
                </div>
            }
        >
            <div className="grid grid-cols-2 gap-4 h-[60vh]">
                <div className="border border-slate-700 rounded-lg p-3 flex flex-col">
                    <h3 className="font-semibold mb-2 text-white">{layoutContent.AVAILABLE_WIDGETS}</h3>
                    <div className="space-y-2 flex-grow overflow-y-auto">
                        {availableColumns.map(col => (
                           <ListItem key={col.key} label={col.label} onAction={() => handleAdd(col)} actionIcon="chevron-right" />
                        ))}
                    </div>
                </div>
                <div className="border border-slate-700 rounded-lg p-3 flex flex-col">
                    <h3 className="font-semibold mb-2 text-white">{layoutContent.DISPLAYED_WIDGETS}</h3>
                     <div className="space-y-2 flex-grow overflow-y-auto">
                        {displayedColumns.map((col, index) => (
                           <ListItem 
                               key={col.key} 
                               label={col.label} 
                               onAction={() => handleRemove(col)} 
                               actionIcon="chevron-left" 
                               onMoveUp={index > 0 ? () => move(index, 'up') : undefined}
                               onMoveDown={index < displayedColumns.length - 1 ? () => move(index, 'down') : undefined}
                               isDisplayedList
                           />
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ColumnSettingsModal;
