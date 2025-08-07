// components/UserView.tsx
"use client";
import { useState } from 'react';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (allowedTypes.includes(selectedFile.type)) {
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
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (uploadError) => {
          console.error("Upload Error:", uploadError);
          setError('Failed to upload file. Please try again.');
          setLoading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'receipts'), {
            name, details, fileUrl: downloadURL, fileName,
            uploaderUid: user.uid, uploaderEmail: user.email,
            createdAt: serverTimestamp(),
          });
          setSuccess('Receipt uploaded successfully!');
          setName('');
          setDetails('');
          setFile(null);
          // Type assertion to reset the file input
          (document.getElementById('file-input') as HTMLInputElement).value = '';
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Submission Error:", err);
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Submit a New Receipt</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form inputs are the same as the JS version */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Receipt Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label htmlFor="details" className="block text-sm font-medium text-gray-700">Details (Optional)</label>
          <textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
        </div>
        <div>
          <label htmlFor="file-input" className="block text-sm font-medium text-gray-700">Receipt File (Image or PDF)</label>
          <input type="file" id="file-input" onChange={handleFileChange} accept="image/*,.pdf" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
        </div>
        {loading && (
          <div className="w-full bg-gray-200 rounded-full"><div className="bg-indigo-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${uploadProgress}%` }}>{Math.round(uploadProgress)}%</div></div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <button type="submit" disabled={loading} className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
          {loading ? 'Submitting...' : 'Submit Receipt'}
        </button>
      </form>
    </div>
  );
}