"use client";
import { useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { storage, db } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function UserView() {
  const { user } = useAuth();
  const [name, setName] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      // Enforce type and size (10MB) to avoid uploads that may hang due to rules/limits
      const isAcceptedType = selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf';
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (!isAcceptedType) {
        setFile(null);
        setError('Invalid file type. Please upload an image or PDF.');
        return;
      }
      if (selectedFile.size > MAX_SIZE) {
        setFile(null);
        setError('File too large. Maximum size is 10MB.');
        return;
      }
      if (isAcceptedType) {
        setFile(selectedFile);
        setError('');
      } else {
        setFile(null);
        setError('Invalid file type. Please upload an image or PDF.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !name || !user) {
      setError('Please provide a name and select a file.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const fileName = `${user.uid}-${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `receipts/${fileName}`);
      // Include contentType metadata so files serve with correct type
      const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (uploadError) => {
          console.error('Upload Error:', uploadError);
          setError('Failed to upload file. Please try again.');
          setLoading(false);
        },
        async () => {
          // Wrap completion path in try/catch so errors don't leave UI stuck in loading
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await addDoc(collection(db, 'receipts'), {
              name,
              details,
              fileUrl: downloadURL,
              fileName,
              uploaderUid: user.uid,
              uploaderEmail: user.email,
              createdAt: serverTimestamp(),
            });
            setSuccess('Receipt uploaded successfully!');
            setName('');
            setDetails('');
            setFile(null);
            // Reset the file input via ref
            if (fileInputRef.current) fileInputRef.current.value = '';
          } catch (postError) {
            console.error('Post-upload Error:', postError);
            setError('Upload finished but saving failed. Please try again or contact support.');
          } finally {
            setLoading(false);
          }
        }
      );
    } catch (err) {
      console.error('Submission Error:', err);
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#003E68]/10 bg-white shadow-lg">
      {/* Header */}
      <div className="border-b border-[#003E68]/10 bg-gradient-to-r from-[#003E68]/5 via-transparent to-[#003E68]/5 p-6">
        <div className="flex items-center gap-2">
          <span className="inline-block h-5 w-1.5 rounded-full bg-[#FBCE0C]" />
          <h2 className="text-xl font-semibold text-[#003E68]">Submit a New Receipt</h2>
        </div>
        <p className="mt-1 text-sm text-[#003E68]/70">Upload an image or PDF. Max 10MB recommended.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#003E68]">
            Sender Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-xl border border-[#003E68]/20 bg-white px-3 py-2 text-[#003E68] shadow-sm outline-none placeholder:text-[#003E68]/40 focus:border-[#003E68] focus:ring-4 focus:ring-[#003E68]/20"
            placeholder="Fee payer name"
          />
        </div>

        <div>
          <label htmlFor="details" className="mb-1 block text-sm font-medium text-[#003E68]">
            Details (Optional)
          </label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-xl border border-[#003E68]/20 bg-white px-3 py-2 text-[#003E68] shadow-sm outline-none placeholder:text-[#003E68]/40 focus:border-[#003E68] focus:ring-4 focus:ring-[#003E68]/20"
            placeholder="Short description, amount, etc."
          ></textarea>
        </div>

        <div>
          <label htmlFor="file-input" className="mb-1 block text-sm font-medium text-[#003E68]">
            Receipt File (Image or PDF)
          </label>
          {/* Visually hide the input and provide a custom button labeled 'Upload file' */}
          <input
            type="file"
            id="file-input"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="sr-only"
          />
          <div className="mt-1 flex items-center gap-3">
            <label
              htmlFor="file-input"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FBCE0C]/20 px-4 py-2 text-sm font-semibold text-[#003E68] shadow-sm transition hover:bg-[#FBCE0C]/30"
            >
              Upload file
            </label>
            {file && (
              <span className="truncate text-sm text-[#003E68]/80" title={file.name}>
                {file.name}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-[#003E68]/60">Accepted: JPG, PNG, GIF, PDF</p>
        </div>

        {loading && (
          <div className="w-full rounded-full bg-[#003E68]/10" aria-label="Upload progress">
            <div
              className="rounded-full bg-[#FBCE0C] p-0.5 text-center text-xs font-medium text-[#003E68]"
              style={{ width: `${uploadProgress}%` }}
            >
              {Math.round(uploadProgress)}%
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#003E68] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#003E68]/30 disabled:translate-y-0 disabled:bg-[#003E68]/50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Submitting…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M12 16l4-5h-3V4h-2v7H8l4 5z" />
                <path d="M5 18h14v2H5z" />
              </svg>
              Submit Receipt
            </span>
          )}
        </button>
      </form>
    </div>
  );
}