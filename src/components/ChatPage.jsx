import React, { useEffect, useState } from 'react';
import './ChatPage.css';

const ChatPage = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const fetchMessages = () => {
    fetch('/api/chat')
      .then(res => res.json())
      .then(data => {
        setMessages(data.reverse()); // newest at bottom
      })
      .catch(err => console.error('Failed to load chat:', err));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!name || !message) return;
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message }),
    })
      .then(() => {
        setMessage('');
        fetchMessages();
      });
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="chat-message">
              <strong>{msg.name}:</strong> {msg.message}
            </div>
          ))
        )}
      </div>
      <input
        className="chat-input"
        type="text"
        placeholder="Enter your game name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <textarea
        className="chat-textarea"
        placeholder="Type your message"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <button className="chat-button" onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatPage;
