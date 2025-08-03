import React, { useState, useEffect } from 'react';

const PlayerPicksPage = () => {
  const [week, setWeek] = useState(null);
  const [games, setGames] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [picks, setPicks] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [locked, setLocked] = useState(false);
  const [activated, setActivated] = useState(false);
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
        setWeek(data.currentWeek || 1);
        setLocked(false);
      })
      .catch(() => {
        setWeek(1);
        setError('Failed to load current week.');
      });
  }, []);

  useEffect(() => {
    if (!week) return;
    setLoading(true);
    fetch(`${backendBase}/data/games_week_${week}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Game file missing');
        return res.json();
      })
      .then(data => {
        setGames(data);
        setLoading(false);
      })
      .catch(() => {
        setGames([]);
        setError(`No games available for Week ${week}.`);
        setLoading(false);
      });
  }, [week]);

  useEffect(() => {
    setActivated(true);
  }, []);

  const handleTogglePick = (index, team) => {
    if (!authenticated) return;
    setPicks(prev => {
      const filtered = prev.filter(p => p.gameIndex !== index);
      if (!prev.find(p => p.gameIndex === index)) {
        filtered.push({ gameIndex: index, pick: team });
      }
      return filtered;
    });
  };

  const handleLogin = () => {
    fetch(`${backendBase}/api/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameName: playerName, pin })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPicks([]);
          setGames([]);

          fetch(`${backendBase}/data/current_week.json`)
            .then(res => res.json())
            .then(weekData => {
              const current = weekData.currentWeek || 1;
              setWeek(current);
              setLocked(false);

              fetch(`${backendBase}/api/check-player-picks`, {
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
                    fetch(`${backendBase}/data/games_week_${current}.json`)
                      .then(res => {
                        if (!res.ok) throw new Error('Game file missing');
                        return res.json();
                      })
                      .then(data => {
                        setGames(data);
                        setError(null);
                      })
                      .catch(() => {
                        setGames([]);
                        setError(`No games available for Week ${current}.`);
                      });
                  }
                });
            });
        } else {
          alert('Invalid name or PIN');
        }
      });
  };

  const handleSubmit = () => {
    if (picks.length > 10) return alert('Max 10 picks allowed.');
    if (picks.length === 0) return alert('You must make at least one pick.');
    fetch(`${backendBase}/submit-picks/${week}`, {
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
      {submitSuccess ? (
        <>
          <h2>✅ Your picks have been submitted.</h2>
          <p>You will be able to view them once everyone else has submitted their picks. Good luck!</p>
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
          <h2>Place Your Picks - Week {week ?? '?'}</h2>

          {/* 📌 Sticky Pick Tally */}
          <div style={{
            position: 'sticky',
            top: 64,
            zIndex: 10,
            backgroundColor: '#f9f9f9',
            padding: '10px',
            borderBottom: '1px solid #ccc',
          }}>
            <p style={{
              margin: 0,
              fontWeight: 'bold',
              fontSize: '16px',
              color: picks.length === 10 ? 'green' : picks.length > 10 ? 'red' : 'black'
            }}>
              You have selected {picks.length} out of 10 games.
            </p>
            <p style={{
              margin: 0,
              fontStyle: 'italic',
              fontSize: '14px',
              color: '#555'
            }}>
              Picks will be viewable after Thursday at 1:00pm. Submission is final!
            </p>
          </div>

          {loading && <p>Loading games...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && games.length > 0 && (
            <>
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
                            style={{
                              backgroundColor: selected === game.team1 ? '#d0f0c0' : '',
                              fontWeight: selected === game.team1 ? 'bold' : 'normal',
                              padding: '6px 10px',
                              margin: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            {game.team1} ({game.spread1 > 0 ? '+' : ''}{game.spread1})
                          </button>
                        </td>
                        <td style={{ fontWeight: 'bold' }}>vs</td>
                        <td>
                          <button
                            onClick={() => handleTogglePick(index, game.team2)}
                            style={{
                              backgroundColor: selected === game.team2 ? '#d0f0c0' : '',
                              fontWeight: selected === game.team2 ? 'bold' : 'normal',
                              padding: '6px 10px',
                              margin: '4px',
                              cursor: 'pointer'
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
