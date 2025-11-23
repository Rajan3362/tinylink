'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface LinkStats {
  code: string;
  original_url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
}

export default function StatsPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (code) {
      fetchStats();
    }
  }, [code]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/links/${code}`);
      if (!response.ok) {
        throw new Error('Link not found');
      }
      const data = await response.json();
      setStats(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-900">Loading...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Not Found</h1>
          <p className="text-gray-600">The requested short link does not exist.</p>
          <a href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Link Statistics</h1>
          <a
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Link Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Short Code</label>
              <p className="mt-1 text-lg font-mono bg-gray-100 px-3 py-2 rounded text-gray-900">
                {stats.code}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Clicks</label>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.clicks}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Original URL</label>
              <p className="mt-1 text-gray-900 break-all">{stats.original_url}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1 text-gray-900">
                {new Date(stats.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Click</label>
              <p className="mt-1 text-gray-900">
                {stats.last_clicked 
                  ? new Date(stats.last_clicked).toLocaleString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${stats.code}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Copy Short URL
            </button>
            <button
              onClick={() => window.open(`/${stats.code}`, '_blank')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Test Redirect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}