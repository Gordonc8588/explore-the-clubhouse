'use client';

import TextArea from '../questions/TextArea';
import SingleSelect from '../questions/SingleSelect';
import EmailConsent from '../questions/EmailConsent';

interface Step7Props {
  otherFeedback: string;
  nextHolidayInterest: string | null;
  contactConsent: boolean;
  email: string;
  gdprConsent: boolean;
  emailError?: string;
  onOtherFeedbackChange: (value: string) => void;
  onNextHolidayInterestChange: (value: string) => void;
  onContactConsentChange: (value: boolean) => void;
  onEmailChange: (value: string) => void;
  onGdprConsentChange: (value: boolean) => void;
}

const NEXT_HOLIDAY_OPTIONS = ['Yes, definitely', 'Possibly', 'No'];

export default function Step7Final({
  otherFeedback,
  nextHolidayInterest,
  contactConsent,
  email,
  gdprConsent,
  emailError,
  onOtherFeedbackChange,
  onNextHolidayInterestChange,
  onContactConsentChange,
  onEmailChange,
  onGdprConsentChange,
}: Step7Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#5a5c3a] mb-2 font-heading">
          Final Thoughts
        </h2>
        <p className="text-[#6b7280]">
          Almost done! Just a few more questions.
        </p>
      </div>

      <TextArea
        name="other_feedback"
        label="Is there anything else you would like to see in a holiday or half-term club?"
        value={otherFeedback}
        onChange={onOtherFeedbackChange}
        placeholder="Share any other thoughts or suggestions..."
        maxLength={1000}
      />

      <SingleSelect
        name="next_holiday_interest"
        label="If we organised a club for the next holiday period, would you be interested?"
        options={NEXT_HOLIDAY_OPTIONS}
        value={nextHolidayInterest}
        onChange={onNextHolidayInterestChange}
      />

      <EmailConsent
        contactConsent={contactConsent}
        email={email}
        gdprConsent={gdprConsent}
        onContactConsentChange={onContactConsentChange}
        onEmailChange={onEmailChange}
        onGdprConsentChange={onGdprConsentChange}
        error={emailError}
      />
    </div>
  );
}
