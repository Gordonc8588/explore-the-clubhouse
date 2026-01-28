import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get('admin-session')?.value === 'authenticated';
}

interface ResponseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResponseDetailPage({ params }: ResponseDetailPageProps) {
  // Check admin auth
  if (!(await isAdmin())) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: response, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !response) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderArrayField = (values: string[] | null) => {
    if (!values || values.length === 0) return <span className="text-gray-400">Not answered</span>;
    return (
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
            {v}
          </span>
        ))}
      </div>
    );
  };

  const renderField = (value: string | boolean | null) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400">Not answered</span>;
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return value;
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/survey"
          className="text-sm text-[#d4843e] hover:text-[#c47535] flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Survey Results
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Survey Response</h1>
            <p className="text-gray-600">{formatDate(response.submitted_at)}</p>
          </div>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              response.is_complete
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {response.is_complete ? 'Complete' : 'Partial'}
          </span>
        </div>
      </div>

      {/* Response Details */}
      <div className="space-y-6">
        {/* Section 1: About Children */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About Their Children</h2>
          <dl className="grid md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Number of Children (5-12)</dt>
              <dd className="mt-1 text-gray-900">{renderField(response.num_children)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Children&apos;s Ages</dt>
              <dd className="mt-1">{renderArrayField(response.children_ages)}</dd>
            </div>
          </dl>
        </div>

        {/* Section 2: Demand */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Interest & Demand</h2>
          <dl className="grid md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Interest Level</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-sm font-medium rounded-full ${
                    response.interest_level === 'Yes, definitely'
                      ? 'bg-green-100 text-green-700'
                      : response.interest_level === 'Possibly'
                        ? 'bg-yellow-100 text-yellow-700'
                        : response.interest_level === 'No'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {renderField(response.interest_level)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Holiday Periods</dt>
              <dd className="mt-1">{renderArrayField(response.holiday_periods)}</dd>
            </div>
          </dl>
        </div>

        {/* Section 3: Days & Times */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Days & Times</h2>
          <dl className="grid md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Preferred Days</dt>
              <dd className="mt-1 text-gray-900">{renderField(response.preferred_days)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Specific Days</dt>
              <dd className="mt-1">{renderArrayField(response.specific_days)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Preferred Times</dt>
              <dd className="mt-1">{renderArrayField(response.preferred_times)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Days Per Week</dt>
              <dd className="mt-1 text-gray-900">{renderField(response.days_per_week)}</dd>
            </div>
          </dl>
        </div>

        {/* Section 4: Activities */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activities</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Activities Wanted</dt>
              <dd className="mt-1">{renderArrayField(response.activities)}</dd>
            </div>
            {response.activities_notes && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Activity Notes</dt>
                <dd className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {response.activities_notes}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Section 5: Structure */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Age Groups & Structure</h2>
          <dl className="grid md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Age Group Preference</dt>
              <dd className="mt-1 text-gray-900">{renderField(response.age_group_preference)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Structure Preference</dt>
              <dd className="mt-1 text-gray-900">{renderField(response.structure_preference)}</dd>
            </div>
          </dl>
        </div>

        {/* Section 6: Practical */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Practical Considerations</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Most Important Factors (Top 3)</dt>
              <dd className="mt-1">{renderArrayField(response.important_factors)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Additional Services</dt>
              <dd className="mt-1">{renderArrayField(response.additional_services)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Postcode</dt>
              <dd className="mt-1 text-gray-900 font-mono">{renderField(response.postcode)}</dd>
            </div>
          </dl>
        </div>

        {/* Section 7: Final */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Final Thoughts</h2>
          <dl className="space-y-4">
            {response.other_feedback && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Other Feedback</dt>
                <dd className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {response.other_feedback}
                </dd>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Next Holiday Interest</dt>
                <dd className="mt-1 text-gray-900">{renderField(response.next_holiday_interest)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Wants to be Contacted</dt>
                <dd className="mt-1 text-gray-900">{response.contact_consent ? 'Yes' : 'No'}</dd>
              </div>
            </div>
            {response.email && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-gray-900">
                  <a href={`mailto:${response.email}`} className="text-[#d4843e] hover:underline">
                    {response.email}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Metadata */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-500">
          <p>Response ID: <code className="font-mono">{response.id}</code></p>
          <p>Session ID: <code className="font-mono">{response.session_id || 'N/A'}</code></p>
        </div>
      </div>
    </div>
  );
}
