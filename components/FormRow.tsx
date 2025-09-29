import React from 'react';

interface FormRowProps {
    label: string;
    children?: React.ReactNode;
    className?: string;
}

const FormRow: React.FC<FormRowProps> = ({ label, children, className = '' }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        {children}
    </div>
);

export default FormRow;
