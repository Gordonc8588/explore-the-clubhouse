'use client';

interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames?: string[];
}

const defaultStepNames = [
  'About You',
  'Demand',
  'Days & Times',
  'Activities',
  'Structure',
  'Practical',
  'Final',
];

export default function SurveyProgress({
  currentStep,
  totalSteps,
  stepNames = defaultStepNames,
}: SurveyProgressProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full mb-8">
      {/* Progress bar */}
      <div className="relative h-2 bg-[#f5f4ed] rounded-full overflow-hidden mb-4">
        <div
          className="absolute left-0 top-0 h-full bg-[#7a7c4a] transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step indicators - desktop */}
      <div className="hidden md:flex justify-between items-center">
        {stepNames.map((name, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div
              key={stepNumber}
              className="flex flex-col items-center"
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-300
                  ${isCompleted
                    ? 'bg-[#7a7c4a] text-white'
                    : isActive
                      ? 'bg-[#d4843e] text-white ring-4 ring-[#d4843e]/20'
                      : 'bg-[#f5f4ed] text-[#5a5c3a]'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium
                  ${isActive ? 'text-[#d4843e]' : isCompleted ? 'text-[#7a7c4a]' : 'text-[#5a5c3a]/60'}
                `}
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step indicator - mobile */}
      <div className="md:hidden flex justify-between items-center">
        <span className="text-sm font-medium text-[#5a5c3a]">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-[#7a7c4a]">
          {percentage}% complete
        </span>
      </div>

      {/* Current step name - mobile */}
      <div className="md:hidden mt-2">
        <span className="text-sm font-semibold text-[#d4843e]">
          {stepNames[currentStep - 1]}
        </span>
      </div>
    </div>
  );
}
