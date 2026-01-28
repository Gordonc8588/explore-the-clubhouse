'use client';

interface ThankYouStepProps {
  contactConsent: boolean;
}

export default function ThankYouStep({ contactConsent }: ThankYouStepProps) {
  return (
    <div className="text-center py-8">
      <div className="mb-8">
        {/* Success checkmark */}
        <div className="w-20 h-20 mx-auto mb-6 bg-[#22c55e]/10 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-[#22c55e]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-[#5a5c3a] mb-4 font-heading">
          Thank You!
        </h1>
        <p className="text-lg text-[#6b7280] max-w-md mx-auto leading-relaxed">
          Your feedback is incredibly valuable and will help shape what we offer.
        </p>
      </div>

      <div className="bg-[#f5f4ed] rounded-xl p-6 max-w-lg mx-auto mb-8">
        {contactConsent ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center text-[#7a7c4a] mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">We&apos;ll be in touch!</span>
            </div>
            <p className="text-[#3d3d3d]">
              We&apos;ve noted your interest and will contact you when our plans are confirmed.
              Keep an eye on your inbox for updates.
            </p>
          </div>
        ) : (
          <p className="text-[#3d3d3d]">
            We appreciate you taking the time to share your thoughts.
            Your input will help us create a holiday club that truly meets local families&apos; needs.
          </p>
        )}
      </div>

      {/* What happens next */}
      <div className="max-w-md mx-auto">
        <h3 className="font-semibold text-[#5a5c3a] mb-4">What happens next?</h3>
        <ul className="text-left space-y-3">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#7a7c4a]/10 text-[#7a7c4a] flex items-center justify-center flex-shrink-0 text-sm font-medium">
              1
            </span>
            <span className="text-[#3d3d3d]">
              We&apos;ll review all the feedback we receive
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#7a7c4a]/10 text-[#7a7c4a] flex items-center justify-center flex-shrink-0 text-sm font-medium">
              2
            </span>
            <span className="text-[#3d3d3d]">
              We&apos;ll use your input to design the best possible club experience
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#7a7c4a]/10 text-[#7a7c4a] flex items-center justify-center flex-shrink-0 text-sm font-medium">
              3
            </span>
            <span className="text-[#3d3d3d]">
              {contactConsent
                ? "You'll receive an email when bookings open"
                : "Details will be shared with the community when plans are finalised"
              }
            </span>
          </li>
        </ul>
      </div>

      {/* Close tab hint */}
      <div className="mt-12 pt-8 border-t border-[#f5f4ed]">
        <p className="text-sm text-[#9ca3af]">
          You can now close this page. Thank you again for your time!
        </p>
      </div>
    </div>
  );
}
