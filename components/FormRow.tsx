import React from 'react';

// FIX: Changed component definition to use React.FC<FormRowProps>. This correctly types
// the component to accept special React props like `key` when rendered in a list,
// which was the cause of the type error.
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
