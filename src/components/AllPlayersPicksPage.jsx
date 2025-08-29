import React, { useState, useEffect } from "react";

const AllPlayersPicksPage = () => {
  const [week, setWeek] = useState(1);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [picksData, setPicksData] = useState([]);
  const [winnersData, setWinnersData] = useState([]);
  const [totalsData, setTotalsData] = useState({});
  const [gamesData, setGamesData] = useState([]); // NEW: games for spreads
  const [canReveal, setCanReveal] = useState(false);
  const [loading, setLoading] = useState(true);

  // status line
  const [visibilityMode, setVisibilityMode] = useState("auto");
  const [visibilityNote, setVisibilityNote] = useState("");

  // IMPORTANT: same base as Admin Tools
  const backendBase =
    process.env.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5001"
      : "https://pickem-backend-2025.onrender.com");

  // Simple table styles
  const styles = {
    table: { width: "100%", borderCollapse: "collapse", marginTop: 10 },
    th: {
      textAlign: "left",
      border: "1px solid #ddd",
      padding: "8px 10px",
      background: "#f7f7f7",
      whiteSpace: "nowrap",
    },
    td: { border: "1px solid #ddd", padding: "8px 10px", verticalAlign: "top" },
    colPlayer: { width: "18%" },
    colPicks: { width: "52%", whiteSpace: "normal", lineHeight: 1.35 },
    colSmall: { width: "10%", textAlign: "center", whiteSpace: "nowrap" },
    status: { fontSize: 14, color: "#555", marginBottom: 8 },
  };

  // Fetch available weeks from picks files
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const res = await fetch(`${backendBase}/api/debug/files`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const foundWeeks = data.files
            .filter((f) => f.name.startsWith("picks_week_"))
            .map((f) => parseInt(f.name.replace("picks_week_", "").replace(".json", ""), 10))
            .sort((a, b) => a - b);
          setAvailableWeeks(foundWeeks);
          if (foundWeeks.length > 0) setWeek(foundWeeks[foundWeeks.length - 1]);
        }
      } catch (err) {
        console.error("Error fetching weeks:", err);
      }
    };
    fetchWeeks();
  }, [backendBase]);

  // Fetch visibility + games + picks + winners + totals
  useEffect(() => {
    if (!week) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Visibility (admin-controlled)
        let reveal = false;
        let mode = "auto";
        let note = "";

        try {
          const r = await fetch(`${backendBase}/api/picks-visibility`, { cache: "no-store" });
          if (r.ok) {
            const j = await r.json();
            mode = String(j.mode || j.value || "auto").toLowerCase();
            if (mode === "on") {
              reveal = true;
              note = "Admin override: visible now";
            } else if (mode === "off") {
              reveal = false;
              note = "Admin override: hidden";
            } else {
              if (typeof j.revealNow === "boolean") {
                reveal = j.revealNow;
              } else {
                try {
                  const res = await fetch(`${backendBase}/api/lock-status?week=${week}`, {
                    cache: "no-store",
                  });
                  const jj = res.ok ? await res.json() : { revealPicks: false };
                  reveal = Boolean(jj.revealPicks);
                } catch {
                  reveal = false;
                }
              }
              note = "Auto schedule (Thu 1:00 PM CT)";
            }
          } else {
            // legacy fallback
            try {
              const res = await fetch(`${backendBase}/api/lock-status?week=${week}`, {
                cache: "no-store",
              });
              const jj = res.ok ? await res.json() : { revealPicks: false };
              reveal = Boolean(jj.revealPicks);
              mode = "auto";
              note = "Auto schedule (legacy)";
            } catch {
              reveal = false;
              mode = "auto";
              note = "Auto schedule (legacy)";
            }
          }
        } catch {
          reveal = false;
          mode = "auto";
          note = "Auto schedule (legacy)";
        }

        setVisibilityMode(mode);
        setVisibilityNote(note);
        setCanReveal(reveal);

        // Games (for spreads)
        try {
          const res = await fetch(`${backendBase}/data/games_week_${week}.json`, {
            cache: "no-store",
          });
          setGamesData(res.ok ? (await res.json()) : []);
        } catch {
          setGamesData([]);
        }

        // Picks (backend enforces visibility)
        try {
          const res = await fetch(`${backendBase}/api/picks_week_${week}.json`, {
            cache: "no-store",
          });
          setPicksData(res.ok ? (await res.json()) : []);
        } catch {
          setPicksData([]);
        }

        // Winners detail
        try {
          const res = await fetch(`${backendBase}/data/winners_detail_week_${week}.json`, {
            cache: "no-store",
          });
          setWinnersData(res.ok ? (await res.json()) : []);
        } catch {
          setWinnersData([]);
        }

        // Totals
        try {
          const res = await fetch(`${backendBase}/data/totals.json`, {
            cache: "no-store",
          });
          setTotalsData(res.ok ? (await res.json()) : {});
        } catch {
          setTotalsData({});
        }
      } catch (err) {
        console.error("Error fetching picks/winners/totals:", err);
      }
      setLoading(false);
    };

    fetchAll();
  }, [week, backendBase]);

  // Helpers
  const getWinnerForGame = (gameIndex) => {
    if (!Array.isArray(winnersData) || winnersData.length === 0) return null;
    const g = winnersData[gameIndex];
    return g ? g.winner || null : null;
  };

  const getWeeklyScoreForPlayer = (playerName) => {
    if (!Array.isArray(picksData) || picksData.length === 0) return 0;
    return picksData
      .filter((p) => p.player === playerName)
      .flatMap((p) => p.picks)
      .reduce((acc, pick) => {
        const w = getWinnerForGame(pick.gameIndex);
        return acc + (w && pick.pick === w ? 1 : 0);
      }, 0);
  };

  const correctRatioForPlayer = (playerName) => {
    if (!Array.isArray(winnersData) || winnersData.length === 0) return "—";
    const total = 10;
    const weekly = getWeeklyScoreForPlayer(playerName);
    return `${weekly} / ${total}`;
  };

  // NEW: pick label with spread "(±X.X)"
  const labelWithSpread = (pickObj) => {
    const g = Array.isArray(gamesData) ? gamesData[pickObj?.gameIndex] : null;
    let spread = null;
    if (g) {
      if (pickObj.pick === g.team1) spread = g.spread1;
      else if (pickObj.pick === g.team2) spread = g.spread2;
    } else if (Array.isArray(gamesData) && gamesData.length) {
      // fallback by team name if index not aligned
      const match = gamesData.find((gg) => gg.team1 === pickObj.pick || gg.team2 === pickObj.pick);
      if (match) spread = match.team1 === pickObj.pick ? match.spread1 : match.spread2;
    }
    const fmt = (n) =>
      typeof n === "number" && !Number.isNaN(n)
        ? (n > 0 ? `+${n}` : `${n}`)
        : "";
    return spread === null || spread === undefined || Number.isNaN(Number(spread))
      ? pickObj.pick
      : `${pickObj.pick} (${fmt(Number(spread))})`;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-1">All Players' Picks</h2>

      <div style={styles.status}>
        Visibility: <strong>{visibilityMode}</strong> — {visibilityNote}
      </div>

      {availableWeeks.length > 0 && (
        <div className="mb-4">
          <label className="mr-2">Select Week:</label>
          <select
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="border p-2"
          >
            {availableWeeks.map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : !canReveal ? (
        <p style={{ color: "#b00020" }}>
          {visibilityMode === "off"
            ? "Picks are hidden by Admin."
            : "Picks are hidden (Auto schedule)."}
        </p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...styles.colPlayer }}>Player</th>
              <th style={{ ...styles.th, ...styles.colPicks }}>Picks</th>
              <th style={{ ...styles.th, ...styles.colSmall }}>Correct Picks</th>
              <th style={{ ...styles.th, ...styles.colSmall }}>Weekly Points</th>
              <th style={{ ...styles.th, ...styles.colSmall }}>Cumulative Points</th>
            </tr>
          </thead>
          <tbody>
            {picksData.map((player, idx) => {
              const picksLine = (player.picks || [])
                .map((p) => labelWithSpread(p))
                .join(", ");

              const weeklyScore = getWeeklyScoreForPlayer(player.player);
              const cumulativeScore = totalsData[player.player] || 0;
              const correctRatio = correctRatioForPlayer(player.player);

              return (
                <tr key={idx}>
                  <td style={{ ...styles.td, ...styles.colPlayer }}>{player.player}</td>
                  <td style={{ ...styles.td, ...styles.colPicks }}>{picksLine}</td>
                  <td style={{ ...styles.td, ...styles.colSmall }}>{correctRatio}</td>
                  <td style={{ ...styles.td, ...styles.colSmall }}>{weeklyScore}</td>
                  <td style={{ ...styles.td, ...styles.colSmall }}>{cumulativeScore}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllPlayersPicksPage;


