import React, { useState, useEffect } from 'react';

function AdminToolsPage() {
  const [gameScoresFile, setGameScoresFile] = useState(null);
  const [rosterFile, setRosterFile] = useState(null);
  const [spreadFile, setSpreadFile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [debugWeek, setDebugWeek] = useState(null);
  const [debugFiles, setDebugFiles] = useState([]);

  const backendBase = 'https://pickem-backend-2025.onrender.com'; // ✅ updated to live Render backend

  useEffect(() => {
    const sessionFlag = sessionStorage.getItem('isAdmin');
    if (sessionFlag === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const handleLogin = () => {
    if (username === 'Admin' && password === 'letmein') {
      sessionStorage.setItem('isAdmin', 'true');
      setIsAdmin(true);
    } else {
      setError('Incorrect admin credentials');
    }
  };

  const uploadFile = async (file, endpoint, force = false) => {
    if (!file) return alert('Please select a file first.');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('force', force.toString());

    const fullUrl = `${backendBase}${endpoint}`;

    try {
      const res = await fetch(fullUrl, {
        method: 'POST',
        body: formData,
      });

      if (res.status === 409) {
        const data = await res.json();
        const confirm = window.confirm(`${data.message}\nDo you want to overwrite it?`);
        if (confirm) {
          return uploadFile(file, endpoint, true);
        } else {
          return;
        }
      }

      const text = await res.text();
      if (!res.ok) {
        alert(`❌ Upload failed: ${text}`);
      } else {
        alert(text);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Upload failed. Please try again.');
    }
  };

  const handleSystemReset = async () => {
    const confirm = window.confirm(
      '⚠️ This will delete all games, scores, picks, and reset the system to Week 1.\nAre you sure you want to continue?'
    );
    if (!confirm) return;

    try {
      const res = await fetch(`${backendBase}/api/reset-system`, {
        method: 'POST',
      });

      const text = await res.text();
      alert(text);
    } catch (err) {
      console.error('❌ Reset failed:', err);
      alert('Reset failed. Check server logs.');
    }
  };

  const fetchDebugFiles = async () => {
    try {
      const weekRes = await fetch(`${backendBase}/data/current_week.json`);
      const weekData = await weekRes.json();
      const current = weekData.currentWeek;
      setDebugWeek(current);

      const filesToCheck = ['games', 'scores', 'picks', 'winners'];
      const statuses = {};

      await Promise.all(
        filesToCheck.map(async (key) => {
          const res = await fetch(`${backendBase}/data/${key}_week_${current}.json`);
          statuses[key] = res.ok;
        })
      );

      setDebugFiles(statuses);
    } catch (err) {
      console.error('Failed to load debug info');
      setDebugFiles([]);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchDebugFiles();
  }, [isAdmin]);

  return (
    <div style={{ padding: '20px' }}>
      {!isAdmin ? (
        <>
          <h2>Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ marginRight: '10px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ marginRight: '10px' }}
          />
          <button onClick={handleLogin}>Login</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      ) : (
        <>
          <h1 style={{ fontSize: '26px', marginBottom: '20px' }}>
            Welcome to the Football Pick'em Game
          </h1>

          <h2>Administration Page</h2>

          <div style={{ marginTop: '20px' }}>
            <h3>Upload Game Scores</h3>
            <input type="file" onChange={e => setGameScoresFile(e.target.files[0])} />
            <button onClick={() => uploadFile(gameScoresFile, '/api/upload/scores')}>
              Import File to JSON
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3>Upload Player Roster</h3>
            <input type="file" onChange={e => setRosterFile(e.target.files[0])} />
            <button onClick={() => uploadFile(rosterFile, '/api/upload/roster')}>
              Import File to JSON
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3>Upload Sportsbook Spread (Raw Format)</h3>
            <input type="file" onChange={e => setSpreadFile(e.target.files[0])} />
            <button onClick={() => uploadFile(spreadFile, '/api/upload/spread')}>
              Import File to JSON
            </button>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ color: 'darkred' }}>Danger Zone</h3>
            <button
              style={{
                backgroundColor: '#c0392b',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px'
              }}
              onClick={handleSystemReset}
            >
              Reset Entire System
            </button>
          </div>

          {/* 🧠 Debug Panel */}
          <div style={{ marginTop: '40px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
            <h3 style={{ marginBottom: '10px' }}>🛠 Debug Panel</h3>
            <button onClick={fetchDebugFiles} style={{ marginBottom: '10px' }}>
              🔄 Refresh Debug Info
            </button>
            <p><strong>Current Week:</strong> {debugWeek ?? 'Loading...'}</p>
            {debugFiles && (
              <ul>
                {['games', 'scores', 'picks', 'winners'].map(key => (
                  <li key={key}>
                    {key}_week_{debugWeek} — {debugFiles[key] ? '✅ Found' : '❌ Missing'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminToolsPage;

