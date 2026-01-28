'use client';

import { useState, useEffect, useCallback } from 'react';
import QuestionChart from '@/components/admin/survey/QuestionChart';
import ResponsesTable from '@/components/admin/survey/ResponsesTable';
import { SurveyResponse } from '@/types/database';

interface AnalyticsData {
  overview: {
    totalResponses: number;
    totalSessions: number;
    completionRate: number;
    responsesThisWeek: number;
    dailyResponses: { date: string; count: number }[];
  };
  numChildren: Record<string, number>;
  childrenAges: Record<string, number>;
  interestLevel: Record<string, number>;
  holidayPeriods: Record<string, number>;
  preferredDays: Record<string, number>;
  specificDays: Record<string, number>;
  preferredTimes: Record<string, number>;
  daysPerWeek: Record<string, number>;
  activities: Record<string, number>;
  ageGroupPreference: Record<string, number>;
  structurePreference: Record<string, number>;
  importantFactors: Record<string, number>;
  additionalServices: Record<string, number>;
  nextHolidayInterest: Record<string, number>;
  contactConsent: { yes: number; no: number };
  postcodeAreas: Record<string, number>;
}

interface ResponseData {
  responses: SurveyResponse[];
  summary: {
    total: number;
    complete: number;
    partial: number;
    interested: number;
    possibly: number;
    notInterested: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function SurveyAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [responsesData, setResponsesData] = useState<ResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'responses'>('overview');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/survey/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    }
  }, []);

  // Fetch responses data
  const fetchResponses = useCallback(async (page: number) => {
    try {
      const response = await fetch(`/api/admin/survey/responses?page=${page}&limit=20`);
      if (!response.ok) throw new Error('Failed to fetch responses');
      const data = await response.json();
      setResponsesData(data);
    } catch (err) {
      console.error('Error fetching responses:', err);
      setError('Failed to load responses data');
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAnalytics(), fetchResponses(1)]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchAnalytics, fetchResponses]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchResponses(page);
  };

  // Handle CSV export
  const handleExport = () => {
    window.location.href = '/api/admin/survey/export';
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchAnalytics();
    fetchResponses(currentPage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-[#7a7c4a] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Survey Results</h1>
          <p className="text-gray-600">Holiday club parent feedback survey</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-white bg-[#7a7c4a] rounded-lg hover:bg-[#5a5c3a]"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Responses</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalResponses}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Completion Rate</p>
            <p className="text-2xl font-bold text-[#7a7c4a]">{analytics.overview.completionRate}%</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">This Week</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.overview.responsesThisWeek}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Want Contact</p>
            <p className="text-2xl font-bold text-[#d4843e]">{analytics.contactConsent.yes}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'overview'
                ? 'border-[#7a7c4a] text-[#7a7c4a]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics Overview
          </button>
          <button
            onClick={() => setActiveTab('responses')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'responses'
                ? 'border-[#7a7c4a] text-[#7a7c4a]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Individual Responses
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Key Questions */}
          <div className="grid md:grid-cols-2 gap-4">
            <QuestionChart title="Interest Level" data={analytics.interestLevel} />
            <QuestionChart title="Next Holiday Interest" data={analytics.nextHolidayInterest} />
          </div>

          {/* Demographics */}
          <h3 className="text-lg font-semibold text-gray-800 mt-8">Demographics</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuestionChart title="Number of Children" data={analytics.numChildren} type="bar" />
            <QuestionChart title="Children&apos;s Ages" data={analytics.childrenAges} />
            <QuestionChart title="Postcode Areas" data={analytics.postcodeAreas} />
          </div>

          {/* Timing Preferences */}
          <h3 className="text-lg font-semibold text-gray-800 mt-8">Timing Preferences</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <QuestionChart title="Holiday Periods" data={analytics.holidayPeriods} />
            <QuestionChart title="Preferred Times" data={analytics.preferredTimes} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuestionChart title="Preferred Days" data={analytics.preferredDays} />
            <QuestionChart title="Specific Days" data={analytics.specificDays} />
            <QuestionChart title="Days Per Week" data={analytics.daysPerWeek} />
          </div>

          {/* Activities & Structure */}
          <h3 className="text-lg font-semibold text-gray-800 mt-8">Activities & Structure</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <QuestionChart title="Activities Wanted" data={analytics.activities} />
            <QuestionChart title="Age Group Preference" data={analytics.ageGroupPreference} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <QuestionChart title="Structure Preference" data={analytics.structurePreference} />
            <QuestionChart title="Additional Services" data={analytics.additionalServices} />
          </div>

          {/* Important Factors */}
          <h3 className="text-lg font-semibold text-gray-800 mt-8">Important Factors</h3>
          <QuestionChart title="Most Important When Choosing (Top 3)" data={analytics.importantFactors} />
        </div>
      )}

      {activeTab === 'responses' && responsesData && (
        <ResponsesTable
          responses={responsesData.responses}
          pagination={responsesData.pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
