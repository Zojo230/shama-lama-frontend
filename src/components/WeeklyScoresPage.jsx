import React, { useEffect, useState } from 'react';

const WeeklyScoresPage = () => {
  const [week, setWeek] = useState(null);
  const [scores, setScores] = useState([]);

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
    fetch(`/data/scores_week_${week}.json`)
      .then(res => res.json())
      .then(data => setScores(data));
  }, [week]);

  return (
    <div className="page-container">
      <h2>Weekly Scores – Week {week}</h2>
      {scores.map((game, index) => (
        <p key={index}>
          {game["Team 1"]} ({game["Score 1"]}) vs {game["Team 2"]} ({game["Score 2"]})
        </p>
      ))}
    </div>
  );
};

export default WeeklyScoresPage;
