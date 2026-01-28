'use client';

import { useState, useCallback, useEffect } from 'react';
import SurveyProgress from '@/components/survey/SurveyProgress';
import IntroStep from '@/components/survey/steps/IntroStep';
import Step1AboutChildren from '@/components/survey/steps/Step1AboutChildren';
import Step2Demand from '@/components/survey/steps/Step2Demand';
import Step3DaysTimes from '@/components/survey/steps/Step3DaysTimes';
import Step4Activities from '@/components/survey/steps/Step4Activities';
import Step5Structure from '@/components/survey/steps/Step5Structure';
import Step6Practical from '@/components/survey/steps/Step6Practical';
import Step7Final from '@/components/survey/steps/Step7Final';
import ThankYouStep from '@/components/survey/steps/ThankYouStep';

interface SurveyData {
  // Q1-2: About Children
  num_children: string | null;
  children_ages: string[];
  // Q3-4: Demand
  interest_level: string | null;
  holiday_periods: string[];
  // Q5-7: Days & Times
  preferred_days: string | null;
  specific_days: string[];
  preferred_times: string[];
  days_per_week: string | null;
  // Q8-9: Activities
  activities: string[];
  activities_notes: string;
  // Q10-11: Structure
  age_group_preference: string | null;
  structure_preference: string | null;
  // Q12-13 + Postcode: Practical
  important_factors: string[];
  additional_services: string[];
  postcode: string;
  // Q14-16: Final
  other_feedback: string;
  next_holiday_interest: string | null;
  contact_consent: boolean;
  email: string;
  gdpr_consent: boolean;
}

const initialData: SurveyData = {
  num_children: null,
  children_ages: [],
  interest_level: null,
  holiday_periods: [],
  preferred_days: null,
  specific_days: [],
  preferred_times: [],
  days_per_week: null,
  activities: [],
  activities_notes: '',
  age_group_preference: null,
  structure_preference: null,
  important_factors: [],
  additional_services: [],
  postcode: '',
  other_feedback: '',
  next_holiday_interest: null,
  contact_consent: false,
  email: '',
  gdpr_consent: false,
};

const TOTAL_STEPS = 7;

export default function SurveyWizard() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [data, setData] = useState<SurveyData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Create session on start
  const handleStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/survey/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_agent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start survey');
      }

      const result = await response.json();
      setSessionId(result.session.id);
      setCurrentStep(1);
    } catch (err) {
      console.error('Error starting survey:', err);
      setError('Failed to start the survey. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save on step change
  const saveProgress = useCallback(async (step: number, responses: SurveyData) => {
    if (!sessionId) return;

    setIsSaving(true);
    try {
      await fetch('/api/survey/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          current_step: step,
          responses,
        }),
      });
    } catch (err) {
      console.error('Error saving progress:', err);
      // Don't show error to user - auto-save is silent
    } finally {
      setIsSaving(false);
    }
  }, [sessionId]);

  // Save when data changes (debounced via step change)
  useEffect(() => {
    if (currentStep > 0 && currentStep <= TOTAL_STEPS) {
      saveProgress(currentStep, data);
    }
  }, [currentStep, saveProgress, data]);

  // Navigate to next step
  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigate to previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Validate email if contact consent is given
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Submit the survey
  const handleSubmit = async () => {
    // Validate email if contact consent is given
    if (data.contact_consent) {
      if (!data.email) {
        setEmailError('Please enter your email address');
        return;
      }
      if (!validateEmail(data.email)) {
        setEmailError('Please enter a valid email address');
        return;
      }
      if (!data.gdpr_consent) {
        setEmailError('Please tick the consent box');
        return;
      }
    }

    setEmailError(null);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          ...data,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to submit survey');
      }

      setIsComplete(true);
      setCurrentStep(TOTAL_STEPS + 1); // Thank you step
    } catch (err) {
      console.error('Error submitting survey:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit the survey. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update data helper
  const updateData = <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <IntroStep onStart={handleStart} isLoading={isLoading} />;

      case 1:
        return (
          <Step1AboutChildren
            numChildren={data.num_children}
            childrenAges={data.children_ages}
            onNumChildrenChange={(v) => updateData('num_children', v)}
            onChildrenAgesChange={(v) => updateData('children_ages', v)}
          />
        );

      case 2:
        return (
          <Step2Demand
            interestLevel={data.interest_level}
            holidayPeriods={data.holiday_periods}
            onInterestLevelChange={(v) => updateData('interest_level', v)}
            onHolidayPeriodsChange={(v) => updateData('holiday_periods', v)}
          />
        );

      case 3:
        return (
          <Step3DaysTimes
            preferredDays={data.preferred_days}
            specificDays={data.specific_days}
            preferredTimes={data.preferred_times}
            daysPerWeek={data.days_per_week}
            onPreferredDaysChange={(v) => updateData('preferred_days', v)}
            onSpecificDaysChange={(v) => updateData('specific_days', v)}
            onPreferredTimesChange={(v) => updateData('preferred_times', v)}
            onDaysPerWeekChange={(v) => updateData('days_per_week', v)}
          />
        );

      case 4:
        return (
          <Step4Activities
            activities={data.activities}
            activitiesNotes={data.activities_notes}
            onActivitiesChange={(v) => updateData('activities', v)}
            onActivitiesNotesChange={(v) => updateData('activities_notes', v)}
          />
        );

      case 5:
        return (
          <Step5Structure
            ageGroupPreference={data.age_group_preference}
            structurePreference={data.structure_preference}
            onAgeGroupPreferenceChange={(v) => updateData('age_group_preference', v)}
            onStructurePreferenceChange={(v) => updateData('structure_preference', v)}
          />
        );

      case 6:
        return (
          <Step6Practical
            importantFactors={data.important_factors}
            additionalServices={data.additional_services}
            postcode={data.postcode}
            onImportantFactorsChange={(v) => updateData('important_factors', v)}
            onAdditionalServicesChange={(v) => updateData('additional_services', v)}
            onPostcodeChange={(v) => updateData('postcode', v)}
          />
        );

      case 7:
        return (
          <Step7Final
            otherFeedback={data.other_feedback}
            nextHolidayInterest={data.next_holiday_interest}
            contactConsent={data.contact_consent}
            email={data.email}
            gdprConsent={data.gdpr_consent}
            emailError={emailError || undefined}
            onOtherFeedbackChange={(v) => updateData('other_feedback', v)}
            onNextHolidayInterestChange={(v) => updateData('next_holiday_interest', v)}
            onContactConsentChange={(v) => updateData('contact_consent', v)}
            onEmailChange={(v) => {
              updateData('email', v);
              setEmailError(null);
            }}
            onGdprConsentChange={(v) => updateData('gdpr_consent', v)}
          />
        );

      default:
        return <ThankYouStep contactConsent={data.contact_consent} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4ed]">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Progress bar - only show during survey steps */}
        {currentStep > 0 && currentStep <= TOTAL_STEPS && (
          <SurveyProgress
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
          />
        )}

        {/* Survey card */}
        <div className={`bg-white rounded-2xl shadow-lg ${currentStep === 0 || isComplete ? 'p-6 md:p-10' : 'p-6 md:p-8'}`}>
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Saving indicator */}
          {isSaving && (
            <div className="mb-4 flex items-center text-sm text-[#9ca3af]">
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </div>
          )}

          {/* Step content */}
          {renderStep()}

          {/* Navigation buttons - only show during survey steps */}
          {currentStep > 0 && currentStep <= TOTAL_STEPS && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#f5f4ed]">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`
                  px-6 py-3 rounded-lg font-medium text-sm
                  transition-all duration-200
                  ${currentStep === 1
                    ? 'text-[#9ca3af] cursor-not-allowed'
                    : 'text-[#5a5c3a] hover:bg-[#f5f4ed]'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </span>
              </button>

              {currentStep < TOTAL_STEPS ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-lg font-medium text-sm bg-[#d4843e] text-white hover:bg-[#c47535] transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`
                    px-8 py-3 rounded-lg font-medium text-sm
                    transition-all duration-200
                    ${isLoading
                      ? 'bg-[#d4843e]/50 text-white cursor-wait'
                      : 'bg-[#7a7c4a] text-white hover:bg-[#5a5c3a]'
                    }
                  `}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Submit Survey
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
