import React, { useEffect, useState } from 'react';
import './PotPage.css';

const PotPage = () => {
  const [potData, setPotData] = useState({});
  const [currentWeek, setCurrentWeek] = useState(1);
  const [playerCount, setPlayerCount] = useState(0);

  const backendBase = 'https://pickem-backend-2025.onrender.com';

  useEffect(() => {
    fetch(`${backendBase}/data/current_week.json`)
      .then(res => res.json())
      .then(data => setCurrentWeek(data.currentWeek || 1)); // ✅ fixed key name

    fetch(`${backendBase}/data/roster.json`)
      .then(res => res.json())
      .then(data => setPlayerCount(data.length || 0));
  }, []);

  useEffect(() => {
    const base = playerCount * 10;
    const potTracker = {};
    let rolling = 0;

    const checkWeek = async (week) => {
      const file = `${backendBase}/data/winners_week_${week}.json`;
      try {
        const res = await fetch(file);
        if (!res.ok) throw new Error('No file');
        const data = await res.json();
        const anyWinner = data.some(entry => entry.total >= 9);
        if (anyWinner) {
          rolling = base;
        } else {
          rolling += base;
        }
        potTracker[week] = rolling;
      } catch (err) {
        potTracker[week] = 0;
      }
    };

    const run = async () => {
      for (let i = 1; i <= 14; i++) {
        await checkWeek(i);
      }
      setPotData(potTracker);
    };

    if (playerCount > 0) {
      run();
    }
  }, [playerCount]);

  return (
    <div className="page-container">
      <h2>🏆 Weekly Pot Totals</h2>
      {Object.keys(potData).map(week => (
        <div key={week} className="pot-box">
          Week {week}: ${potData[week]}
        </div>
      ))}
    </div>
  );
};

export default PotPage;
