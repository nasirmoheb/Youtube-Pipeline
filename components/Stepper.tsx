import React from 'react';

interface StepperProps {
  currentStep: number;
  steps: string[];
  onStepClick: (step: number) => void;
  highestCompletedStep: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps, onStepClick, highestCompletedStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => {
          const stepNumber = stepIdx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isClickable = stepNumber <= highestCompletedStep;

          const handleClick = () => {
            if (isClickable) {
              onStepClick(stepNumber);
            }
          };

          return (
            <li key={step} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-16' : ''}`}>
              {isCompleted ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-indigo-600" />
                  </div>
                  <button
                    type="button"
                    onClick={handleClick}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-900"
                  >
                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                    </svg>
                  </button>
                </>
              ) : isCurrent ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-700" />
                  </div>
                  <button
                    type="button"
                    onClick={handleClick}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-gray-800"
                    aria-current="step"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-700" />
                  </div>
                  <button
                    type="button"
                    onClick={handleClick}
                    disabled={!isClickable}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 disabled:cursor-not-allowed"
                  >
                  </button>
                </>
              )}
              <div className="absolute -bottom-7 text-center w-max -left-1/2 ml-8">
                <span className={`text-xs ${currentStep >= stepIdx + 1 ? 'text-indigo-400' : 'text-gray-400'}`}>{step}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;