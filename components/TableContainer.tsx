import React from 'react';

const TableContainer = ({ children }: { children?: React.ReactNode }) => {
    return (
        <div className="flex-grow glass-card rounded-xl overflow-hidden flex flex-col">
            {children}
        </div>
    );
};

export default TableContainer;
