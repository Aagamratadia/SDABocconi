// components/AdminPanel.tsx
"use client";

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPanel() {
  const { user } = useAuth();
  const [targetUid, setTargetUid] = useState('');
  const [status, setStatus] = useState<{
    loading: boolean;
    success?: string;
    error?: string;
  }>({ loading: false });

  const handleSetAdmin = async () => {
    if (!targetUid.trim()) {
      setStatus({ loading: false, error: 'Please enter a valid user ID' });
      return;
    }

    setStatus({ loading: true });

    try {
      // Get the current user's ID token
      const idToken = await user?.getIdToken(true);
      
      if (!idToken) {
        throw new Error('You must be logged in to perform this action');
      }

      // Make the API request to set admin privileges
      const response = await fetch('/api/set-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ targetUid })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set admin privileges');
      }

      setStatus({
        loading: false,
        success: data.message || 'Admin privileges granted successfully'
      });
      
      // Clear the input field after successful operation
      setTargetUid('');
    } catch (error) {
      setStatus({
        loading: false,
        error: (error as Error).message
      });
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Management</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="targetUid" className="block text-sm font-medium text-gray-700 mb-1">
            User ID to grant admin privileges
          </label>
          <input
            id="targetUid"
            type="text"
            value={targetUid}
            onChange={(e) => setTargetUid(e.target.value)}
            placeholder="Enter user ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleSetAdmin}
          disabled={status.loading || !targetUid.trim()}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status.loading ? 'Processing...' : 'Grant Admin Privileges'}
        </button>

        {status.error && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
            {status.error}
          </div>
        )}

        {status.success && (
          <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded-md">
            {status.success}
          </div>
        )}
      </div>
    </div>
  );
}