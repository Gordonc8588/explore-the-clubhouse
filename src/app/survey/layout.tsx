import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Greenfields Survey | Holiday Club Feedback',
  description:
    'Help us understand whether a holiday or half-term club would be useful for local families. Your feedback will shape what we offer.',
};

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide the main site navigation on survey pages */}
      <style>{`body > nav { display: none !important; }`}</style>

      {/* Minimal survey header */}
      <header className="bg-[#5a5c3a] text-white py-4 px-6">
        <div className="max-w-2xl mx-auto">
          <span className="font-heading text-lg font-bold tracking-wide">
            Greenfields Survey
          </span>
        </div>
      </header>

      {children}
    </>
  );
}
