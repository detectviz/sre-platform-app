
import React from 'react';

const FormRow = ({ label, children, className = '' }: { label: string, children?: React.ReactNode, className?: string }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        {children}
    </div>
);

export default FormRow;
