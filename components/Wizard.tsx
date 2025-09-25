import React from 'react';
import Icon from './Icon';

interface WizardProps {
  currentStep: number;
  steps: string[];
  onStepClick: (step: number) => void;
}

const Wizard: React.FC<WizardProps> = ({ currentStep, steps, onStepClick }) => (
  <div className="flex items-center justify-center w-full">
    {steps.map((title, index) => {
      const step = index + 1;
      const isCompleted = currentStep > step;
      const isActive = currentStep === step;

      return (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center cursor-pointer" onClick={() => onStepClick(step)}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 border-2 ${
                isActive ? 'bg-sky-500 border-sky-400 text-white' : isCompleted ? 'bg-green-500 border-green-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'
              }`}
            >
              {isCompleted ? <Icon name="check" className="w-6 h-6"/> : step}
            </div>
            <p className={`mt-2 text-sm font-semibold ${isActive || isCompleted ? 'text-white' : 'text-slate-400'}`}>{title}</p>
          </div>
          {step < steps.length && (
            <div className={`flex-1 h-1 mx-4 rounded-full transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-slate-700'}`}></div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export default Wizard;
