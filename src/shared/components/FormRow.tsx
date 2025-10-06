import React from 'react';

interface FormRowProps {
    label: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    description?: string;
}

const FormRow: React.FC<FormRowProps> = ({ label, children, className = '', description }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-slate-200 mb-1">{label}</label>
        {description && <p className="text-xs text-slate-400 mb-2 leading-relaxed">{description}</p>}
        {children}
    </div>
);

export default FormRow;
