'use client';

import Link from 'next/link';
import { SurveyResponse } from '@/types/database';

interface ResponsesTableProps {
  responses: SurveyResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export default function ResponsesTable({
  responses,
  pagination,
  onPageChange,
}: ResponsesTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Postcode
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Interest
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Children
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {responses.map((response) => (
              <tr key={response.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">
                  {formatDate(response.submitted_at)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 font-mono">
                  {response.postcode || '-'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      response.interest_level === 'Yes, definitely'
                        ? 'bg-green-100 text-green-700'
                        : response.interest_level === 'Possibly'
                          ? 'bg-yellow-100 text-yellow-700'
                          : response.interest_level === 'No'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {response.interest_level || 'Not answered'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {response.num_children || '-'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      response.is_complete
                        ? 'bg-[#7a7c4a]/10 text-[#7a7c4a]'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {response.is_complete ? 'Complete' : 'Partial'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/survey/${response.id}`}
                    className="text-sm text-[#d4843e] hover:text-[#c47535] font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} responses
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {responses.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500">
          No responses yet
        </div>
      )}
    </div>
  );
}
