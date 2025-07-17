import React, { useEffect, useState } from "react";

function ViewPicksPage() {
  const [picks, setPicks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/picks")
      .then((res) => res.json())
      .then((data) => setPicks(data))
      .catch((err) => {
        console.error("Error loading picks:", err);
      });
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>📋 All Player Picks</h1>
      {picks.length === 0 ? (
        <p>No picks submitted yet.</p>
      ) : (
        picks.map((entry, index) => (
          <div key={index} style={{ marginBottom: "1.5rem" }}>
            <h3>{entry.name}</h3>
            <ul>
              {entry.picks.map((team, i) => (
                <li key={i}>{team}</li>
              ))}
            </ul>
            <small>
              {entry.timestamp
                ? new Date(entry.timestamp).toLocaleString()
                : "No timestamp"}
            </small>
          </div>
        ))
      )}
    </div>
  );
}

export default ViewPicksPage;

