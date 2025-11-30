"use client";
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Handle Image Upload
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null); // Reset result on new upload
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", prompt);

    try {
      // Call our internal API
      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const data = await res.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Something went wrong!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans flex items-center justify-center">
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full">
        
        {/* LEFT: Controls */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            AI Ad Agency 🚀
          </h1>
          <p className="text-gray-400">Upload a photo. Get a campaign instantly.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <input 
              type="file" 
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-600 file:text-white"
              required
            />
            <input 
              type="text" 
              placeholder="Event Name (e.g. Diwali Sale)" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-gray-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
              required
            />
            <button 
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${loading ? 'bg-gray-700' : 'bg-blue-600 hover:scale-105'}`}
            >
              {loading ? "✨ Generating..." : "🚀 Launch Campaign"}
            </button>
          </form>

          {result && (
             <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 animate-fade-in">
               <h3 className="text-gray-500 text-xs uppercase font-bold tracking-wider">AI Caption</h3>
               <p className="mt-2 text-lg">{result.caption}</p>
             </div>
          )}
        </div>

        {/* RIGHT: Phone Preview (The "Fake" Video) */}
        <div className="flex justify-center">
          <div className="relative w-[320px] h-[640px] bg-black rounded-[40px] border-[8px] border-gray-800 overflow-hidden shadow-2xl ring-1 ring-gray-700">
            
            {/* SCREEN */}
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              {preview ? (
                <div className="relative w-full h-full overflow-hidden group">
                  
                  {/* 1. The Image (With Zoom Animation) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={preview} 
                    alt="Product" 
                    className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${result ? 'scale-125' : 'scale-100'}`}
                  />
                  
                  {/* 2. The AI Overlays (Appears after loading) */}
                  {result && (
                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 via-transparent to-transparent">
                      <div className="animate-bounce mb-4">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                          Limited Time
                        </span>
                      </div>
                      <h2 className="text-4xl font-black text-white leading-none drop-shadow-xl" style={{color: result.color}}>
                        {result.hook}
                      </h2>
                      <p className="text-white/80 mt-2 text-sm line-clamp-2">
                        {result.caption}
                      </p>
                    </div>
                  )}

                  {/* 3. Loading State Overlay */}
                  {loading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="font-mono text-sm text-blue-400 animate-pulse">AI IS THINKING...</p>
                    </div>
                  )}
                  
                </div>
              ) : (
                <p className="text-gray-600 font-mono text-sm">Upload Preview</p>
              )}
            </div>
            
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-30"></div>
          </div>
        </div>

      </div>
    </div>
  );
}