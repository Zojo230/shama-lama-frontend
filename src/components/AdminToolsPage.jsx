import React, { useState } from 'react';

function AdminToolsPage() {
  const [gameScoresFile, setGameScoresFile] = useState(null);
  const [rosterFile, setRosterFile] = useState(null);
  const [spreadFile, setSpreadFile] = useState(null);

  const uploadFile = (file, endpoint) => {
    if (!file) return alert('Please select a file first.');
    const formData = new FormData();
    formData.append('file', file);

    // 🔗 Updated to target your live backend
    const fullUrl = `https://pickem-backend-2025.onrender.com${endpoint}`;

    fetch(fullUrl, {
      method: 'POST',
      body: formData,
    })
      .then(res => res.text())
      .then(alert)
      .catch(() => alert('Upload failed.'));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '26px', marginBottom: '20px' }}>Welcome to the Football Pick'em Game</h1>

      <h2 style={{ marginTop: '30px' }}>Administration Page</h2>

      <div style={{ marginTop: '20px' }}>
        <h3>Upload Game Scores</h3>
        <input type="file" onChange={e => setGameScoresFile(e.target.files[0])} />
        <button onClick={() => uploadFile(gameScoresFile, '/api/upload/scores')}>Import File to JSON</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Upload Player Roster</h3>
        <input type="file" onChange={e => setRosterFile(e.target.files[0])} />
        <button onClick={() => uploadFile(rosterFile, '/api/upload/roster')}>Import File to JSON</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Upload Sportsbook Spread (Raw Format)</h3>
        <input type="file" onChange={e => setSpreadFile(e.target.files[0])} />
        <button onClick={() => uploadFile(spreadFile, '/api/upload/spread')}>Import File to JSON</button>
      </div>
    </div>
  );
}

export default AdminToolsPage;

