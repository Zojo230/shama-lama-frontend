import React, { useEffect, useState } from 'react';

const LeaderboardPage = () => {
  const [totals, setTotals] = useState([]);
  const [error, setError] = useState(null);

  // ✅ Auto-switch backend base
  const backendBase =
    window.location.hostname === 'localhost'
      ? 'http://localhost:4000'
      : 'https://pickem-backend-2025.onrender.com';

  useEffect(() => {
    fetch(`${backendBase}/api/totals`)
      .then(res => {
        if (!res.ok) throw new Error('Totals file not found');
        return res.json();
      })
      .then(data => {
        const sorted = [...data].sort((a, b) => b.total - a.total);
        setTotals(sorted);
      })
      .catch(() => {
        setError('Leaderboard data not available yet.');
      });
  }, []);

  return (
    <div className="page-container">
      <h2>🏆 Leaderboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!error && totals.length > 0 && (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '20px',
          backgroundColor: '#fdfdfd',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 0 10px rgba(0,0,0,0.05)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Game Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Cumulative Points</th>
            </tr>
          </thead>
          <tbody>
            {totals.map((player, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9' }}>
                <td style={{ padding: '10px' }}>{player.player}</td>
                <td style={{ padding: '10px' }}>{player.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaderboardPage;
