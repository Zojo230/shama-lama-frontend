import React from 'react';
import { useNavigate } from 'react-router-dom';

const tabs = [
  { label: 'Place Your Picks Here', path: '/picks' },
  { label: "All Players' Picks Page", path: '/allpicks' },
  { label: 'The Spread by Week', path: '/spread' },
  { label: 'Weekly Scores', path: '/weekly-scores' },
  { label: 'Player Roster & Payments', path: '/roster-payments' },
  { label: 'Administration Tools', path: '/admin-tools' },
  { label: 'Rules', path: '/rules' },
  { label: 'Chat', path: '/chat' },
  { label: 'The Pot', path: '/pot' },
  { label: 'Leaderboard', path: '/leaderboard' } // ✅ New tab at far right
];

const Layout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '26px', marginBottom: '20px' }}>
        Welcome to the Football Pick'em Game
      </h1>
      <div style={{ marginBottom: '20px' }}>
        {tabs.map(({ label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              margin: '4px',
              padding: '8px 12px',
              border: '1px solid #333',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Layout;
