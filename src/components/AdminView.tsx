// components/AdminView.tsx
"use client";
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

// Define the shape of a single receipt document
interface Receipt {
  id: string;
  name: string;
  details: string;
  fileUrl: string;
  uploaderEmail: string;
  createdAt: Timestamp; // Using Firestore's Timestamp type
}

export default function AdminView() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const q = query(collection(db, 'receipts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const receiptsData: Receipt[] = [];
      querySnapshot.forEach((doc) => {
        // Explicitly cast the document data to the shape we expect.
        // This provides better type safety than using doc.data() directly.
        const data = doc.data() as Omit<Receipt, 'id'>;
        receiptsData.push({ id: doc.id, ...data });
      });
      setReceipts(receiptsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading receipts...</p>;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800">All Submitted Receipts</h2>
        <p className="text-sm text-gray-600 mt-1">Showing all receipts in real-time.</p>
      </div>
      <div className="overflow-x-auto">
        {receipts.length === 0 ? (
          <p className="px-6 py-4 text-gray-500">No receipts have been submitted yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {receipts.map((receipt) => (
              <li key={receipt.id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex-1 mb-4 sm:mb-0">
                    <p className="text-lg font-semibold text-indigo-600">{receipt.name}</p>
                    <p className="text-sm text-gray-700 mt-1">{receipt.details}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      <span>Submitted by: {receipt.uploaderEmail}</span>
                      <span className="mx-2">|</span>
                      <span>
                        {/* The 'createdAt' field can be null if data is not yet synced from server */}
                        {receipt.createdAt ? new Date(receipt.createdAt.toDate()).toLocaleString() : 'Date unavailable'}
                      </span>
                    </div>
                  </div>
                  <a href={receipt.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}