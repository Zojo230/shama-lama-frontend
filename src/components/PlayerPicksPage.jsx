
import React, { useState, useEffect } from 'react';

const PlayerPicksPage = () => {
  const [week, setWeek] = useState(1);
  const [games, setGames] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [picks, setPicks] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [locked, setLocked] = useState(false);
  const [activated, setActivated] = useState(false);

  const evaluateLockout = () => {
    const now = new Date();
    const deadline = new Date();
    deadline.setHours(13, 0, 0, 0);
    const isThursday = now.getDay() === 4;
    return isThursday && now >= deadline;
  };

  useEffect(() => {
    fetch('/data/current_week.json')
      .then(res => res.json())
      .then(data => {
        setWeek(data.currentWeek || 1);
        setLocked(evaluateLockout());
      });
  }, []);

  useEffect(() => {
    fetch(`/data/games_week_${week}.json`)
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(() => setGames([]));
  }, [week]);

  useEffect(() => {
    setActivated(true);
  }, []);

  const handleTogglePick = (index, team) => {
    if (!authenticated || locked) return;
    setPicks(prev => {
      const filtered = prev.filter(p => p.gameIndex !== index);
      if (!prev.find(p => p.gameIndex === index)) {
        filtered.push({ gameIndex: index, pick: team });
      }
      return filtered;
    });
  };

  const handleLogin = () => {
    fetch('/api/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameName: playerName, pin })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPicks([]);
          setGames([]);

          fetch('/data/current_week.json')
            .then(res => res.json())
            .then(weekData => {
              const current = weekData.currentWeek || 1;
              setWeek(current);
              setLocked(evaluateLockout());

              fetch('/api/check-player-picks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ week: current, playerName })
              })
                .then(res => res.json())
                .then(result => {
                  if (result.alreadyPicked) {
                    alert("Your picks have been submitted for this week. There is no override. Good luck!");
                    return;
                  } else {
                    setAuthenticated(true);
                    fetch(`/data/games_week_${current}.json`)
                      .then(res => res.json())
                      .then(data => setGames(data))
                      .catch(() => setGames([]));
                  }
                });
            });
        } else {
          alert('Invalid name or PIN');
        }
      });
  };

  const handleSubmit = () => {
    if (locked) return;
    if (picks.length > 10) return alert('Max 10 picks allowed.');
    fetch(`/submit-picks/${week}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player: playerName, pin, picks })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubmitSuccess(true);
          setAuthenticated(false);
        } else {
          alert('Failed to submit picks.');
        }
      });
  };

  if (!activated) return null;

  return (
    <div className="page-container">
      {locked ? (
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          🔒 Picks are now locked. You may return after the week ends to see results.
        </p>
      ) : submitSuccess ? (
        <>
          <h2>✅ Your picks have been submitted.</h2>
          <p>
            You will be able to view them once everyone else has submitted their picks — after 1:00 PM Thursday. Good luck!
          </p>
        </>
      ) : !authenticated ? (
        <>
          <h2>Place Your Picks</h2>
          <div>
            <label>Enter your Game Name and PIN:</label><br />
            <input
              type="text"
              placeholder="Game Name"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <input
              type="password"
              placeholder="PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <button onClick={handleLogin}>Login</button>
          </div>
        </>
      ) : (
        <>
          <h2>Place Your Picks - Week {week}</h2>
          <p>You have selected {picks.length} of 10.</p>
          <table className="picks-table" style={{ width: '100%', marginTop: '20px' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Team 1</th>
                <th></th>
                <th>Team 2</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, index) => {
                const selected = picks.find(p => p.gameIndex === index)?.pick;
                return (
                  <tr key={index}>
                    <td>{game.date}</td>
                    <td>
                      <button
                        onClick={() => handleTogglePick(index, game.team1)}
                        disabled={locked}
                        style={{
                          backgroundColor: selected === game.team1 ? '#d0f0c0' : '',
                          fontWeight: selected === game.team1 ? 'bold' : 'normal',
                          padding: '6px 10px',
                          margin: '4px',
                          cursor: locked ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {game.team1} ({game.spread1 > 0 ? '+' : ''}{game.spread1})
                      </button>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>vs</td>
                    <td>
                      <button
                        onClick={() => handleTogglePick(index, game.team2)}
                        disabled={locked}
                        style={{
                          backgroundColor: selected === game.team2 ? '#d0f0c0' : '',
                          fontWeight: selected === game.team2 ? 'bold' : 'normal',
                          padding: '6px 10px',
                          margin: '4px',
                          cursor: locked ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {game.team2} ({game.spread2 > 0 ? '+' : ''}{game.spread2})
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!locked && (
            <>
              <p style={{ marginTop: '10px', fontStyle: 'italic', color: 'darkred' }}>
                📝 Please double-check your picks before submitting. Once submitted, there’s no going back!
              </p>

              <button
                onClick={handleSubmit}
                disabled={picks.length === 0}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Submit Picks
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PlayerPicksPage;
