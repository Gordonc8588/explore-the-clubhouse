'use client';

interface EmailConsentProps {
  contactConsent: boolean;
  email: string;
  gdprConsent: boolean;
  onContactConsentChange: (value: boolean) => void;
  onEmailChange: (value: string) => void;
  onGdprConsentChange: (value: boolean) => void;
  error?: string;
}

export default function EmailConsent({
  contactConsent,
  email,
  gdprConsent,
  onContactConsentChange,
  onEmailChange,
  onGdprConsentChange,
  error,
}: EmailConsentProps) {
  return (
    <div className="space-y-4">
      <label className="block text-base font-semibold text-[#5a5c3a]">
        Would you like to be contacted when plans are confirmed?
      </label>

      {/* Yes/No toggle */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onContactConsentChange(true)}
          className={`
            flex-1 py-3 px-4 rounded-lg font-medium text-sm
            transition-all duration-200
            ${contactConsent
              ? 'bg-[#7a7c4a] text-white'
              : 'bg-white text-[#5a5c3a] border-2 border-[#f5f4ed] hover:border-[#7a7c4a]/50'
            }
          `}
        >
          Yes, please
        </button>
        <button
          type="button"
          onClick={() => {
            onContactConsentChange(false);
            onEmailChange('');
            onGdprConsentChange(false);
          }}
          className={`
            flex-1 py-3 px-4 rounded-lg font-medium text-sm
            transition-all duration-200
            ${!contactConsent
              ? 'bg-[#7a7c4a] text-white'
              : 'bg-white text-[#5a5c3a] border-2 border-[#f5f4ed] hover:border-[#7a7c4a]/50'
            }
          `}
        >
          No thanks
        </button>
      </div>

      {/* Email input - shown when Yes is selected */}
      {contactConsent && (
        <div className="space-y-4 p-4 bg-[#f5f4ed]/50 rounded-lg border border-[#7a7c4a]/20 animate-in slide-in-from-top-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#5a5c3a] mb-2">
              Email address <span className="text-[#d4843e]">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="your@email.com"
              className={`
                w-full px-4 py-3 rounded-lg border-2
                text-[#3d3d3d] placeholder-[#9ca3af]
                transition-all duration-200
                focus:outline-none focus:border-[#d4843e] focus:ring-4 focus:ring-[#d4843e]/10
                ${error ? 'border-[#ef4444]' : 'border-[#f5f4ed] hover:border-[#7a7c4a]/30'}
              `}
            />
            {error && (
              <p className="text-sm text-[#ef4444] mt-1">{error}</p>
            )}
          </div>

          {/* GDPR consent checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={gdprConsent}
              onChange={(e) => onGdprConsentChange(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`
                w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                transition-all duration-200
                ${gdprConsent
                  ? 'border-[#7a7c4a] bg-[#7a7c4a]'
                  : 'border-[#9ca3af] hover:border-[#7a7c4a]'
                }
              `}
            >
              {gdprConsent && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className="text-sm text-[#3d3d3d]">
              I consent to being contacted about holiday club plans. Your email will only be used
              for this purpose and will not be shared with third parties.
              <span className="text-[#d4843e]"> *</span>
            </span>
          </label>

          {contactConsent && email && !gdprConsent && (
            <p className="text-sm text-[#d4843e] flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Please tick the consent box to continue
            </p>
          )}
        </div>
      )}
    </div>
  );
}
