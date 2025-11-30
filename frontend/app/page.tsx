'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Play, RefreshCw, Image as ImageIcon, User, Layers, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

const API_URL = 'http://localhost:8000';

export default function Home() {
  const [peopleImages, setPeopleImages] = useState<string[]>([]);
  const [datasetImages, setDatasetImages] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const peopleInputRef = useRef<HTMLInputElement>(null);
  const datasetInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const peopleRes = await fetch(`${API_URL}/images/people`);
      const peopleData = await peopleRes.json();
      setPeopleImages(peopleData.images || []);

      const datasetRes = await fetch(`${API_URL}/images/dataset`);
      const datasetData = await datasetRes.json();
      setDatasetImages(datasetData.images || []);

      // Also fetch results if they exist
      const resultsRes = await fetch(`${API_URL}/results`);
      const resultsData = await resultsRes.json();
      setResults(resultsData || {});
    } catch (error) {
      console.error("Failed to fetch images", error);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'person' | 'dataset') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    if (type === 'dataset') {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    } else {
      formData.append('file', files[0]);
    }

    try {
      const endpoint = type === 'person' ? '/upload/person' : '/upload/dataset';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      setMessage({ type: 'success', text: `Uploaded to ${type === 'person' ? 'People' : 'Dataset'}` });
      fetchImages();
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setLoading(false);
      // Reset input
      if (event.target) event.target.value = '';
    }
  };

  const runClassification = async () => {
    setClassifying(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/classify`, { method: 'POST' });
      if (!res.ok) throw new Error('Classification failed');

      const data = await res.json();
      setMessage({ type: 'success', text: 'Classification complete!' });

      // Fetch results
      const resultsRes = await fetch(`${API_URL}/results`);
      const resultsData = await resultsRes.json();
      setResults(resultsData || {});
    } catch (error) {
      setMessage({ type: 'error', text: 'Classification failed' });
    } finally {
      setClassifying(false);
    }
  };

  const resetData = async () => {
    if (!confirm('Are you sure you want to delete all data?')) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset`, { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');

      setMessage({ type: 'success', text: 'All data erased' });
      setPeopleImages([]);
      setDatasetImages([]);
      setResults({});
    } catch (error) {
      setMessage({ type: 'error', text: 'Reset failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Smart<span className="text-blue-600">Drive</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Upload known faces and a dataset to automatically classify and organize images.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={resetData}
              disabled={loading || classifying}
              className="group flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
              Reset Data
            </button>
            <button
              onClick={runClassification}
              disabled={loading || classifying}
              className="group flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {classifying ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} className="fill-current" />}
              {classifying ? 'Processing...' : 'Run Classification'}
            </button>
          </div>
        </header>

        {/* Status Message */}
        {message && (
          <div className={`mx-auto max-w-md p-4 rounded-xl flex items-center justify-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Upload Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* People Upload */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Known People</h2>
                  <p className="text-sm text-slate-500">Faces to recognize</p>
                </div>
              </div>
              <button
                onClick={() => peopleInputRef.current?.click()}
                className="text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Upload size={16} /> Add Photos
              </button>
              <input
                type="file"
                ref={peopleInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleUpload(e, 'person')}
              />
            </div>

            {peopleImages.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl">
                <ImageIcon size={40} className="mb-3 opacity-40" />
                <span className="text-sm font-medium">No known people added yet</span>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {peopleImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group shadow-sm hover:shadow-md transition-all">
                    <Image
                      src={`${API_URL}/static/people/${img}`}
                      alt={img}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Dataset Upload */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                  <Layers size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Dataset</h2>
                  <p className="text-sm text-slate-500">Images to classify</p>
                </div>
              </div>
              <button
                onClick={() => datasetInputRef.current?.click()}
                className="text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Upload size={16} /> Add Batch
              </button>
              <input
                type="file"
                ref={datasetInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => handleUpload(e, 'dataset')}
              />
            </div>

            {datasetImages.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl">
                <ImageIcon size={40} className="mb-3 opacity-40" />
                <span className="text-sm font-medium">No dataset images uploaded</span>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {datasetImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group shadow-sm hover:shadow-md transition-all">
                    <Image
                      src={`${API_URL}/static/dataset/${img}`}
                      alt={img}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Results Section */}
        {Object.keys(results).length > 0 && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-900">Classification Results</h2>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                {Object.values(results).flat().length} Matches
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(results).map(([name, images], index) => (
                <div
                  key={name}
                  className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">{name}</h3>
                    <span className="text-xs font-medium bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-500">
                      {images.length} photos
                    </span>
                  </div>
                  <div className="p-5 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer group">
                        <Image
                          src={`${API_URL}/static/output/${name}/${img}`}
                          alt={img}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
