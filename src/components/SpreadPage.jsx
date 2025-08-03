import React, { useEffect, useState } from 'react';
import './SpreadPage.css';

const SpreadPage = () => {
  const [games, setGames] = useState([]);
  const [week, setWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendBase =
    window.location.hostname === 'localhost'
      ? 'http://localhost:4000'
      : 'https://pickem-backend-2025.onrender.com';

  useEffect(() => {
    fetch(`${backendBase}/data/current_week.json`)
      .then(res => res.json())
      .then(data => {
        const current = data.currentWeek || 1;
        setWeek(current);
      })
      .catch(() => {
        setError('Failed to load current week.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!week) return;
    setLoading(true);
    fetch(`${backendBase}/data/games_week_${week}.json`)
      .then(res => {
        if (!res.ok) throw new Error('File not found');
        return res.json();
      })
      .then(data => {
        setGames(data);
        setLoading(false);
      })
      .catch(() => {
        setGames([]);
        setError(`No spread data available for Week ${week}.`);
        setLoading(false);
      });
  }, [week]);

  return (
    <div className="page-container">
      <h2>Game Spread - Week {week ?? '?'}</h2>

      <div style={{ marginBottom: '12px' }}>
        <button onClick={() => window.print()} style={{ marginRight: '10px' }}>
          🖨️ Print This Page
        </button>
        <button onClick={() => window.print()}>
          📄 Export to PDF
        </button>
      </div>

      {loading && <p>Loading spread data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && games.length > 0 && (
        <table className="spread-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Team 1 (Home Team)</th>
              <th>Spread</th>
              <th>Team 2 (Visitor Team)</th>
              <th>Spread</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, idx) => (
              <tr key={idx}>
                <td>{game.date || '-'}</td>
                <td>{game.team1 || '-'}</td>
                <td>{game.spread1 ?? '-'}</td>
                <td>{game.team2 || '-'}</td>
                <td>{game.spread2 ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SpreadPage;
