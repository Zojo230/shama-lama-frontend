import React, { useEffect, useState } from 'react';
import './AllPlayersPicksPage.css';

const AllPlayersPicksPage = () => {
  const [week, setWeek] = useState(1);
  const [players, setPlayers] = useState([]);
  const [winners, setWinners] = useState([]);
  const [totals, setTotals] = useState({});
  const [canReveal, setCanReveal] = useState(false);

  const backendBase = 'https://pickem-backend-2025.onrender.com';

  const loadData = (selectedWeek) => {
    fetch(`${backendBase}/data/picks_week_${selectedWeek}.json`)
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(() => setPlayers([]));

    fetch(`${backendBase}/data/winners_week_${selectedWeek}.json`)
      .then(res => res.json())
      .then(data => setWinners(data))
      .catch(() => setWinners([]));

    fetch(`${backendBase}/data/totals.json`)
      .then(res => res.json())
      .then(data => setTotals(data))
      .catch(() => setTotals({}));

    // 🔒 Lockout logic: Hide picks until Thursday at 1:00pm CST
    const now = new Date();
    const deadline = new Date();
    deadline.setHours(13, 0, 0, 0); // 1:00 PM
    const isThursday = now.getDay() === 4;
    setCanReveal(!isThursday || now >= deadline);
  };

  useEffect(() => {
    fetch(`${backendBase}/data/current_week.json`)
      .then(res => res.json())
      .then(data => {
        const current = data.currentWeek || 1;
        setWeek(current);
        loadData(current);
      });
  }, []);

  useEffect(() => {
    loadData(week);
  }, [week]);

  const getWinner = (playerName) =>
    winners.find(w => w.player?.toLowerCase() === playerName?.toLowerCase()) || { correct: [], total: 0 };

  return (
    <div className="page-container">
      <h2>All Players' Picks - Week {week}</h2>

      <div style={{ marginBottom: '12px' }}>
        <label>Select Week: </label>
        <select value={week} onChange={e => setWeek(Number(e.target.value))}>
          {Array.from({ length: 14 }, (_, i) => i + 1).map(w => (
            <option key={w} value={w}>Week {w}</option>
          ))}
        </select>
        <button
          onClick={() => loadData(week)}
          style={{ marginLeft: '10px', padding: '4px 10px', cursor: 'pointer' }}
        >
          🔄 Refresh
        </button>
      </div>

      {!canReveal && (
        <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>
          ⛔ Picks are hidden until Thursday at 1:00pm CST.
        </p>
      )}

      <table className="all-picks-table">
        <thead>
          <tr>
            <th>Game Name</th>
            <th>Picks</th>
            <th>Winning Picks</th>
            <th>Weekly Points</th>
            <th>Cumulative</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => {
            const winData = getWinner(player.player);
            return (
              <tr key={player.player}>
                <td>{player.player}</td>
                <td>
                  {canReveal
                    ? player.picks.map((p, idx) => {
                        const isCorrect = winData.correct.includes(p.pick);
                        return (
                          <span
                            key={idx}
                            style={{
                              color: isCorrect ? 'green' : 'black',
                              fontWeight: isCorrect ? 'bold' : 'normal',
                              marginRight: '6px'
                            }}
                          >
                            {p.pick}
                          </span>
                        );
                      })
                    : '—'}
                </td>
                <td>{canReveal ? winData.correct.join(', ') || 'None' : '—'}</td>
                <td>
                  {canReveal ? (
                    <>
                      {winData.total}
                      {winData.total >= 9 && (
                        <span title="Great job! You nailed it!" className="all-picks-star">
                          ⭐
                        </span>
                      )}
                    </>
                  ) : '—'}
                </td>
                <td>{canReveal ? totals[player.player] || 0 : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AllPlayersPicksPage;

