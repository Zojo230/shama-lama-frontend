import React, { useEffect, useState } from 'react';
import './RosterPaymentsPage.css';

function RosterPaymentsPage() {
  const [players, setPlayers] = useState([]);
  const backendBase = 'https://pickem-backend-2025.onrender.com';

  useEffect(() => {
    fetch(`${backendBase}/data/roster.json`)
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data);
      });
  }, []);

  const getPaymentStatus = (balance) => {
    if (balance >= 140) return '✅ Fully Paid';
    if (balance > 0) return '🟡 Partially Paid';
    return '❌ No Payment';
  };

  return (
    <div className="roster-page">
      <h1 className="roster-title">Shama-Lama Football Challenge 2025 Roster</h1>
      <h3 className="roster-subtitle">Here are all the players for this year's challenge</h3>

      <div className="roster-list">
        {players.map((player, index) => (
          <div className="player-card" key={index}>
            <span className="player-name">🧢 {player.name}</span>
            <div className="icons">
              <span>🏈 👕</span>
              <span className="payment-status">{getPaymentStatus(player.Balance)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RosterPaymentsPage;
