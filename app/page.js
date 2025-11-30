"use client";
import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState("Ready");
  const [result, setResult] = useState(null);

  async function go(e) {
    e.preventDefault();
    setStatus("Thinking...");
    
    const formData = new FormData(e.target);
    
    try {
      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setResult(data);
      setStatus("Done!");
    } catch (err) {
      alert(err.message);
      setStatus("Error");
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🚀 Bare Metal AI Agency</h1>
      
      <form onSubmit={go} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input name="file" type="file" required style={{ padding: '10px' }} />
        <input name="prompt" type="text" placeholder="Event Name" required style={{ padding: '10px', color: 'black' }} />
        <button style={{ padding: '15px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}>
          {status}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '40px', border: '2px solid gray', padding: '20px', borderRadius: '10px' }}>
          <h2 style={{ color: result.color }}>{result.hook}</h2>
          <p>{result.caption}</p>
        </div>
      )}
    </div>
  );
}