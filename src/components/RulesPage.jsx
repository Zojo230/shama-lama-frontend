import React, { useEffect, useState } from 'react';

const RulesPage = () => {
  const [rulesText, setRulesText] = useState('');
  const backendBase = 'https://pickem-backend-2025.onrender.com';

  useEffect(() => {
    fetch(`${backendBase}/api/rules`)
      .then(res => res.json())
      .then(data => {
        if (data.rulesText) {
          setRulesText(data.rulesText);
        } else {
          setRulesText('No rules found.');
        }
      })
      .catch(() => setRulesText('Error loading rules.'));
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
        Rules & Instructions
      </h2>
      <div style={{ whiteSpace: 'pre-wrap', fontSize: '15px', lineHeight: '1.5' }}>
        {rulesText}
      </div>
    </div>
  );
};

export default RulesPage;

