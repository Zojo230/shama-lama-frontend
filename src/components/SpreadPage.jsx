import React, { useEffect, useState } from 'react';
import './SpreadPage.css';

const SpreadPage = () => {
  const [games, setGames] = useState([]);
  const [week, setWeek] = useState(null);

  useEffect(() => {
    fetch('/data/current_week.json')
      .then(res => res.json())
      .then(data => {
        const current = data.currentWeek || 1;
        setWeek(current);
      });
  }, []);

  useEffect(() => {
    if (!week) return;
    fetch(`/data/games_week_${week}.json`)
      .then(res => res.json())
      .then(data => setGames(data));
  }, [week]);

  return (
    <div className="page-container">
      <h2>Game Spread - Week {week}</h2>

      <div style={{ marginBottom: '12px' }}>
        <button onClick={() => window.print()} style={{ marginRight: '10px' }}>
          🖨️ Print This Page
        </button>
        <button onClick={() => window.print()}>
          📄 Export to PDF
        </button>
      </div>

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
    </div>
  );
};

export default SpreadPage;
