import React from 'react';
import Icon from './Icon';
import { useContent } from '@/contexts/ContentContext';

interface BatchActionToolbarProps {
    count: number;
    onClear: () => void;
    children: React.ReactNode;
}

const BatchActionToolbar: React.FC<BatchActionToolbarProps> = ({ count, onClear, children }) => {
    const { content } = useContent();
    const globalContent = content?.GLOBAL;

    const selectedText = globalContent?.ITEMS_SELECTED
        ? globalContent.ITEMS_SELECTED.replace('{count}', String(count))
        : `Selected ${count} items`;

    return (
        <div className="app-toolbar__batch">
            <div className="app-toolbar__batch-left">
                <button
                    type="button"
                    onClick={onClear}
                    className="app-icon-btn app-icon-btn--ghost"
                    title={globalContent?.CLEAR_SELECTION}
                    aria-label={globalContent?.CLEAR_SELECTION ?? 'Clear selection'}
                >
                    <Icon name="x" className="w-5 h-5" />
                </button>
                <span className="app-toolbar__batch-message">{selectedText}</span>
            </div>
            <div className="app-toolbar__batch-actions">{children}</div>
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
        <div className="app-toolbar">
            <div className="app-toolbar__actions">{leftActions}</div>
            <div className="app-toolbar__actions">{rightActions}</div>
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

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
    icon,
    text,
    primary = false,
    danger = false,
    ai = false,
    className,
    type = 'button',
    ...props
}) => {
    const classNames = [
        'app-btn',
        primary ? 'app-btn--primary' : null,
        danger ? 'app-btn--danger' : null,
        ai ? 'app-btn--ai' : null,
        !primary && !danger && !ai ? 'app-btn--ghost' : null,
        className ?? null,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button type={type} {...props} className={classNames}>
            <Icon name={icon} className="w-4 h-4" />
            <span>{text}</span>
        </button>
    );
};
