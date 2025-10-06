import React from 'react';

interface TableContainerProps {
    table?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}

const TableContainer: React.FC<TableContainerProps> = ({ table, footer, className, children }) => {
    const containerClassName = className ? `app-table-container ${className}` : 'app-table-container';
    const childArray = React.Children.toArray(children ?? []);

    const resolvedTable = table ?? childArray[0] ?? null;
    const resolvedFooter = footer ?? (childArray.length > 1 ? childArray.slice(1) : null);

    const shouldPreserveWrapper =
        React.isValidElement(resolvedTable) && typeof resolvedTable.props.className === 'string'
            ? resolvedTable.props.className.split(' ').includes('app-table-scroll')
            : false;

    const tableContent = shouldPreserveWrapper ? (
        resolvedTable
    ) : (
        <div className="app-table-scroll">{resolvedTable}</div>
    );

    return (
        <div className={containerClassName}>
            {tableContent}
            {resolvedFooter ? <div className="app-table__footer">{resolvedFooter}</div> : null}
        </div>
    );
};

export default TableContainer;
