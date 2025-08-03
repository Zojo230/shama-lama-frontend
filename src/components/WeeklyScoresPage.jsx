import React, { useEffect, useState } from 'react';

const WeeklyScoresPage = () => {
  const [week, setWeek] = useState(null);
  const [scores, setScores] = useState([]);
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
    fetch(`${backendBase}/data/scores_week_${week}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Scores file not found');
        return res.json();
      })
      .then(data => {
        setScores(data);
        setLoading(false);
      })
      .catch(() => {
        setScores([]);
        setError(`No score data available for Week ${week}.`);
        setLoading(false);
      });
  }, [week]);

  return (
    <div className="page-container">
      <h2>Weekly Scores – Week {week ?? '?'}</h2>

      {loading && <p>Loading scores...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && scores.length > 0 && scores.map((game, index) => (
        <p key={index}>
          {game.team1} ({game.score1}) vs {game.team2} ({game.score2})
        </p>
      ))}

      {!loading && scores.length === 0 && !error && (
        <p style={{ color: 'gray' }}>No scores available for this week.</p>
      )}
    </div>
  );
};

export default WeeklyScoresPage;
