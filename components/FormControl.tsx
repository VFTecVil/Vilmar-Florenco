
import React from 'react';

interface FormControlProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  helpText?: string;
}

export const FormControl: React.FC<FormControlProps> = ({ label, children, required, helpText }) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-brand-gray">
        {label}
        {required && <span className="text-brand-red ml-1">*</span>}
      </label>
      {children}
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};
