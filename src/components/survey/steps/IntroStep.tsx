'use client';

interface IntroStepProps {
  onStart: () => void;
  isLoading: boolean;
}

export default function IntroStep({ onStart, isLoading }: IntroStepProps) {
  return (
    <div className="text-center py-8">
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-[#7a7c4a]/10 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-[#7a7c4a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-[#5a5c3a] mb-4 font-heading">
          Greenfields Survey
        </h1>
        <p className="text-lg text-[#6b7280] max-w-md mx-auto leading-relaxed">
          For parents and carers of children aged 5-12
        </p>
      </div>

      <div className="bg-[#f5f4ed] rounded-xl p-6 max-w-lg mx-auto mb-8">
        <p className="text-[#3d3d3d] leading-relaxed">
          Thank you for taking a few minutes to help us understand whether a holiday
          or half-term club would be useful for local families. Your feedback will
          shape what we offer.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onStart}
          disabled={isLoading}
          className={`
            px-8 py-4 rounded-xl font-semibold text-lg
            transition-all duration-200
            ${isLoading
              ? 'bg-[#d4843e]/50 text-white cursor-wait'
              : 'bg-[#d4843e] text-white hover:bg-[#c47535] hover:shadow-lg active:scale-[0.98]'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Starting...
            </span>
          ) : (
            'Start Survey'
          )}
        </button>

        <p className="text-sm text-[#9ca3af]">
          Takes about 3-5 minutes to complete
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-[#f5f4ed]">
        <p className="text-xs text-[#9ca3af]">
          Your responses are anonymous unless you choose to share your contact details.
          <br />
          We respect your privacy and will never share your information with third parties.
        </p>
      </div>
    </div>
  );
}
