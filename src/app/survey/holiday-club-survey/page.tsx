import { Metadata } from 'next';
import SurveyWizard from './SurveyWizard';

export const metadata: Metadata = {
  title: 'Holiday Club Survey | Parent Feedback',
  description: 'Help us understand whether a holiday or half-term club would be useful for local families. Your feedback will shape what we offer.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function HolidayClubSurveyPage() {
  return <SurveyWizard />;
}
