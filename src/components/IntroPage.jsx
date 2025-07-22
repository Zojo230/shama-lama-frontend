import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './IntroPage.css';

function IntroPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (
      (username === 'Test' && password === 'Weareready') || // 🟢 TEMP TEST LOGIN
      (username === 'Admin' && password === 'letmein')
    ) {
      const route = username === 'Admin' ? '/admin-tools' : '/home';
      navigate(route);
    } else {
      setError('Incorrect username or password');
    }
  };

  return (
    <div className="intro-container">
      <h1 className="intro-title">Welcome to Shama-Lama Football Challenge</h1>

      <div className="login-box">
        <h2>Enter UserID and Password</h2>
        <input
          type="text"
          placeholder="UserID"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Enter</button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default IntroPage;

