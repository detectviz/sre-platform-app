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
}> = ({ label, onAction, actionIcon, onMoveUp, onMoveDown, isDisplayedList }) => {
    const canMoveUp = Boolean(onMoveUp);
    const canMoveDown = Boolean(onMoveDown);

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 transition-colors hover:border-sky-600/50">
            <p className="font-medium text-slate-100 truncate" title={typeof label === 'string' ? label : undefined}>{label}</p>
            <div className="flex items-center gap-2">
                {isDisplayedList && (
                    <>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700/70 bg-slate-800/60 text-slate-400">
                            <Icon name="grip-vertical" className="h-4 w-4" />
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={onMoveUp}
                                disabled={!canMoveUp}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="上移欄位"
                            >
                                <Icon name="arrow-up" className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={onMoveDown}
                                disabled={!canMoveDown}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="下移欄位"
                            >
                                <Icon name="arrow-down" className="h-4 w-4" />
                            </button>
                        </div>
                    </>
                )}
                <button
                    type="button"
                    onClick={onAction}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-800/60 text-slate-200 hover:bg-sky-700/70 hover:text-white"
                    aria-label={actionIcon === 'chevron-right' ? '加入欄位' : '移除欄位'}
                >
                    <Icon name={actionIcon} className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

const ColumnSettingsModal: React.FC<ColumnSettingsModalProps> = ({ isOpen, onClose, onSave, allColumns, visibleColumnKeys }) => {
    const [displayedColumns, setDisplayedColumns] = useState<TableColumn[]>([]);
    const { content: pageContent } = useContent();
    const globalContent = pageContent?.GLOBAL;
    const layoutContent = pageContent?.LAYOUT_SETTINGS;
    const modalTitle = globalContent?.COLUMN_SETTINGS ?? '欄位設定';
    const cancelLabel = globalContent?.CANCEL ?? '取消';
    const saveLabel = globalContent?.SAVE ?? '儲存';
    const emptyAvailableLabel = layoutContent?.EMPTY_AVAILABLE_COLUMNS ?? '所有欄位皆已顯示。';
    const emptyDisplayedLabel = layoutContent?.EMPTY_DISPLAYED_COLUMNS ?? '目前未選擇任何欄位。';
    const reorderHint = layoutContent?.REORDER_HINT ?? '拖曳圖示搭配上下箭頭可調整欄位顯示順序。';

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
        return (
            <Modal
                title={modalTitle}
                isOpen={isOpen}
                onClose={onClose}
                width="w-2/3 max-w-4xl"
            >
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                    <Icon name="loader-circle" className="w-6 h-6 animate-spin" />
                    <p className="text-sm">正在載入欄位設定，請稍候...</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            title={modalTitle}
            isOpen={isOpen}
            onClose={onClose}
            width="w-2/3 max-w-4xl"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">{cancelLabel}</button>
                    <button onClick={handleConfirmSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">{saveLabel}</button>
                </div>
            }
        >
            <div className="mb-4 rounded-lg border border-slate-700/60 bg-slate-950/60 px-4 py-3">
                <p className="text-sm leading-6 text-slate-300">{layoutContent.INFO_TEXT}</p>
            </div>
            <div className="grid h-[60vh] grid-cols-2 gap-4">
                <section className="flex flex-col rounded-xl border border-slate-700/70 bg-slate-950/50 p-4">
                    <header className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">{layoutContent.AVAILABLE_WIDGETS}</h3>
                        <span className="text-xs font-medium text-slate-400">{availableColumns.length}</span>
                    </header>
                    <div className="flex-grow space-y-2 overflow-y-auto pr-1">
                        {availableColumns.length === 0 ? (
                            <p className="rounded-md border border-dashed border-slate-700/70 bg-slate-900/50 px-3 py-6 text-center text-xs text-slate-500">
                                {emptyAvailableLabel}
                            </p>
                        ) : (
                            availableColumns.map(col => (
                                <ListItem
                                    key={col.key}
                                    label={col.label}
                                    onAction={() => handleAdd(col)}
                                    actionIcon="chevron-right"
                                />
                            ))
                        )}
                    </div>
                </section>
                <section className="flex flex-col rounded-xl border border-slate-700/70 bg-slate-950/50 p-4">
                    <header className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">{layoutContent.DISPLAYED_WIDGETS}</h3>
                        <span className="text-xs font-medium text-slate-400">{displayedColumns.length}</span>
                    </header>
                    <div className="flex-grow space-y-2 overflow-y-auto pr-1">
                        {displayedColumns.length === 0 ? (
                            <p className="rounded-md border border-dashed border-slate-700/70 bg-slate-900/50 px-3 py-6 text-center text-xs text-slate-500">
                                {emptyDisplayedLabel}
                            </p>
                        ) : (
                            displayedColumns.map((col, index) => (
                                <ListItem
                                    key={col.key}
                                    label={col.label}
                                    onAction={() => handleRemove(col)}
                                    actionIcon="chevron-left"
                                    onMoveUp={index > 0 ? () => move(index, 'up') : undefined}
                                    onMoveDown={index < displayedColumns.length - 1 ? () => move(index, 'down') : undefined}
                                    isDisplayedList
                                />
                            ))
                        )}
                    </div>
                    <p className="mt-3 text-xs text-slate-400">{reorderHint}</p>
                </section>
            </div>
        </Modal>
    );
};

export default ColumnSettingsModal;
