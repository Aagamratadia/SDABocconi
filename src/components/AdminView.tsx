// components/AdminView.tsx
"use client";
import { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { FirebaseError } from 'firebase/app';

// Define the shape of a single receipt document
interface Receipt {
  id: string;
  name: string;
  details?: string;
  paymentReference?: string;
  fileUrl: string;
  fileName?: string; // optional; fallback to fileUrl when deleting if not present
  uploaderEmail: string;
  createdAt: Timestamp; // Firestore Timestamp
  paymentDate?: Timestamp; // Optional payment date
}

export default function AdminView() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const q = query(collection(db, 'receipts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const receiptsData: Receipt[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Receipt, 'id'>;
        receiptsData.push({ id: doc.id, ...data });
      });
      setReceipts(receiptsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#003E68]/10 bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-block h-5 w-1.5 rounded-full bg-[#FBCE0C]" />
          <h2 className="text-lg font-semibold text-[#003E68]">Loading receipts…</h2>
        </div>
        {/* Skeleton list */}
        <ul className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="animate-pulse rounded-xl border border-[#003E68]/10 p-4">
              <div className="mb-2 h-4 w-40 rounded bg-slate-200" />
              <div className="mb-2 h-3 w-3/4 rounded bg-slate-200" />
              <div className="mb-3 h-3 w-1/2 rounded bg-slate-200" />
              <div className="h-8 w-28 rounded bg-slate-200" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#003E68]/10 bg-white shadow-lg">
      {/* Header */}
      <div className="border-b border-[#003E68]/10 bg-gradient-to-r from-[#003E68]/5 via-transparent to-[#003E68]/5 p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#003E68]">All Submitted Receipts</h2>
            <p className="text-sm text-[#003E68]/70">Showing all receipts in real-time.</p>
          </div>
          <div className="mt-2 flex items-center gap-2 sm:mt-0">
            <span className="rounded-full bg-[#FBCE0C] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#003E68]">
              Admin
            </span>
            <span className="rounded-full border border-[#003E68]/15 bg-[#003E68]/5 px-3 py-1 text-xs font-medium text-[#003E68]">
              {receipts.length} total
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto">
        {receipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#003E68]/5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-[#003E68]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 13h6m-6 4h6M8 3h8a2 2 0 0 1 2 2v14l-4-3-4 3-4-3-4 3V5a2 2 0 0 1 2-2h4z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[#003E68]">No receipts yet</h3>
            <p className="mt-1 max-w-md text-sm text-[#003E68]/70">
              As soon as receipts are uploaded, they’ll appear here instantly.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#003E68]/10">
            {receipts.map((receipt) => (
              <li key={receipt.id} className="p-4 transition hover:bg-[#003E68]/[0.03] sm:p-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  {/* Left block */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#FBCE0C]" />
                      <p className="text-lg font-semibold text-[#003E68]">
                        {receipt.name}
                      </p>
                    </div>
                    {receipt.paymentReference && (
                      <p className="mt-1 text-sm text-[#003E68]/80">Ref: {receipt.paymentReference}</p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#003E68]/70">
                      <span className="rounded-full border border-[#003E68]/15 bg-[#003E68]/5 px-2 py-0.5">
                        {receipt.uploaderEmail}
                      </span>
                      <span className="text-[#003E68]/30">•</span>
                      <span>
                        {receipt.createdAt
                          ? new Date(receipt.createdAt.toDate()).toLocaleString()
                          : 'Date unavailable'}
                      </span>
                      {receipt.paymentDate && (
                        <>
                          <span className="text-[#003E68]/30">•</span>
                          <span>Paid on {new Date(receipt.paymentDate.toDate()).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <a
                      href={receipt.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#FBCE0C] px-4 py-2 text-sm font-semibold text-[#003E68] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#FBCE0C]/40 active:translate-y-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 16l4-5h-3V4h-2v7H8l4 5z" />
                        <path d="M5 18h14v2H5z" />
                      </svg>
                      Download
                    </a>
                    <button
                      onClick={async () => {
                        const confirmed = window.confirm('Delete this receipt? This will remove the file and its record.');
                        if (!confirmed) return;
                        try {
                          // 1) Try to delete from Storage
                          let storageDeleted = false;
                          if (receipt.fileName) {
                            try {
                              const sRefByPath = storageRef(storage, `receipts/${receipt.fileName}`);
                              await deleteObject(sRefByPath);
                              storageDeleted = true;
                            } catch (e: unknown) {
                              if (e instanceof FirebaseError && e.code === 'storage/object-not-found') {
                                // Fallback to URL-based ref
                                try {
                                  const sRefByUrl = storageRef(storage, receipt.fileUrl);
                                  await deleteObject(sRefByUrl);
                                  storageDeleted = true;
                                } catch (innerErr: unknown) {
                                  // still not found; proceed to delete Firestore doc anyway
                                  console.warn('Storage object not found by path or URL, proceeding to delete doc.');
                                }
                              } else {
                                throw e;
                              }
                            }
                          } else {
                            // No fileName present, try using the URL directly
                            try {
                              const sRefByUrl = storageRef(storage, receipt.fileUrl);
                              await deleteObject(sRefByUrl);
                              storageDeleted = true;
                            } catch (e: unknown) {
                              if (e instanceof FirebaseError && e.code === 'storage/object-not-found') {
                                console.warn('Storage object not found via URL, proceeding to delete doc.');
                              } else {
                                throw e;
                              }
                            }
                          }

                          // 2) Delete Firestore document (even if storage not found)
                          await deleteDoc(doc(db, 'receipts', receipt.id));

                          if (!storageDeleted) {
                            // Surface a soft warning if file wasn't found
                            alert('Record deleted. Note: File was not found in Storage (it may have been removed earlier).');
                          }
                        } catch (err: unknown) {
                          console.error('Delete failed:', err);
                          const msg = err instanceof Error ? err.message : 'Failed to delete. Please check permissions and try again.';
                          alert(msg);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-400/40 active:translate-y-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4"
                        aria-hidden
                      >
                        <path d="M9 3h6a1 1 0 0 1 1 1v1h4v2H4V5h4V4a1 1 0 0 1 1-1zm-1 7h2v8H8v-8zm6 0h2v8h-2v-8z" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}