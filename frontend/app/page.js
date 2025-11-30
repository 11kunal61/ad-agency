"use client";
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [caption, setCaption] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", prompt);

    // 🔴 IMPORTANT: This looks for the Vercel Environment Variable. 
    // If running locally, it falls back to localhost.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    try {
        const res = await fetch(`${apiUrl}/generate`, {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Backend failed. Check Render URL.");

        const blob = await res.blob();
        setCaption(res.headers.get("X-Caption") || "Check video for details");
        setVideoUrl(URL.createObjectURL(blob));
    } catch (error) {
        alert("Error: Could not connect to AI. If on Vercel, did you set the Environment Variable?");
        console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-500">🚀 AI Ad Agency</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">1. Product Photo</label>
            <input 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" 
                required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400">2. Event (e.g., Diwali Sale)</label>
            <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1 block w-full bg-gray-800 border border-gray-600 p-2 rounded-md text-white"
                required
            />
          </div>

          <button 
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md text-white font-bold transition-colors ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
              {loading ? "✨ AI Agents Working..." : "Create Campaign"}
          </button>
        </form>

        {videoUrl && (
          <div className="mt-8 border-t border-gray-700 pt-6">
              <h2 className="font-bold text-lg mb-2 text-green-400">🎉 Campaign Ready:</h2>
              <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg shadow-lg border border-gray-600" />
              <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-700">
                  <p className="font-bold text-sm text-gray-400 uppercase">Caption:</p>
                  <p className="italic mt-1 text-gray-200">"{caption}"</p>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}