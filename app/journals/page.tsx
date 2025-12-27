'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

interface Journal {
  id: string;
  userId: string;
  date: string;
  text: string;
  createdAt: string;
}

export default function JournalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchJournals();
    }
  }, [user]);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      console.log('Fetching all journals...');
      const startTime = Date.now();
      
      // Force refresh to bypass cache and get latest data
      const response = await fetch(`/api/journals?userId=${user?.uid}&refresh=true`);
      const data = await response.json();
      
      console.log(`Fetched ${data.journals?.length || 0} journals in ${Date.now() - startTime}ms`);
      setJournals(data.journals || []);
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredJournals = journals.filter(journal => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      journal.text.toLowerCase().includes(searchLower) ||
      journal.date.includes(searchQuery)
    );
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading journals...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">All Journals</h1>
              <p className="text-sm text-slate-600">{journals.length} total entries</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchJournals}
                disabled={loading}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh journals"
              >
                🔄 Refresh
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                ← Dashboard
              </Link>
              <Link
                href="/analytics"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Analytics
              </Link>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search journals by date or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredJournals.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-slate-900">
              {searchQuery ? 'No matching journals' : 'No journals yet'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchQuery
                ? 'Try a different search term'
                : 'Start writing in your journal from the dashboard'}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJournals.map((journal) => {
              const isExpanded = expandedId === journal.id;
              const preview = journal.text.slice(0, 150);
              const needsExpansion = journal.text.length > 150;

              return (
                <div
                  key={journal.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {format(parseISO(journal.date), 'EEEE, MMMM d, yyyy')}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Created: {format(parseISO(journal.createdAt), 'h:mm a')}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {journal.text.split(' ').length} words
                      </span>
                    </div>

                    <div className="text-slate-700 whitespace-pre-wrap">
                      {isExpanded ? journal.text : preview}
                      {needsExpansion && !isExpanded && (
                        <span className="text-slate-400">...</span>
                      )}
                    </div>

                    {needsExpansion && (
                      <button
                        onClick={() => toggleExpand(journal.id)}
                        className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {isExpanded ? '← Show less' : 'Read more →'}
                      </button>
                    )}
                  </div>

                  {/* Optional: Add actions */}
                  <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Entry #{journals.indexOf(journal) + 1}</span>
                      <Link
                        href={`/dashboard?date=${journal.date}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View in calendar →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Footer */}
        {filteredJournals.length > 0 && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{filteredJournals.length}</p>
                <p className="text-sm text-slate-600">Total Entries</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {filteredJournals.reduce((acc, j) => acc + j.text.split(' ').length, 0).toLocaleString()}
                </p>
                <p className="text-sm text-slate-600">Total Words</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    filteredJournals.reduce((acc, j) => acc + j.text.split(' ').length, 0) /
                      filteredJournals.length
                  )}
                </p>
                <p className="text-sm text-slate-600">Avg Words/Entry</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredJournals.length > 0
                    ? format(parseISO(filteredJournals[0].date), 'MMM yyyy')
                    : '-'}
                </p>
                <p className="text-sm text-slate-600">Latest Entry</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
