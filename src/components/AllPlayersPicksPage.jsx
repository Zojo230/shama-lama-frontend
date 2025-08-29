import React, { useState, useEffect } from "react";

const AllPlayersPicksPage = () => {
  const [week, setWeek] = useState(1);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [picksData, setPicksData] = useState([]);
  const [winnersData, setWinnersData] = useState([]);
  const [totalsData, setTotalsData] = useState({});
  const [canReveal, setCanReveal] = useState(false);
  const [loading, setLoading] = useState(true);

  // NEW: status line
  const [visibilityMode, setVisibilityMode] = useState("auto");
  const [visibilityNote, setVisibilityNote] = useState("");

  // IMPORTANT: use the same backend base as Admin Tools
  const backendBase =
    process.env.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5001"
      : "https://pickem-backend-2025.onrender.com");

  // Fetch available weeks based on picks files
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

  // Fetch visibility + picks + winners + totals for the selected week
  useEffect(() => {
    if (!week) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // --- Visibility (admin-controlled) ---
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
              // auto — use server’s computed flag if present; else legacy lock-status
              if (typeof j.revealNow === "boolean") {
                reveal = j.revealNow;
              } else {
                try {
                  const res = await fetch(`${backendBase}/api/lock-status?week=${week}`, { cache: "no-store" });
                  const jj = res.ok ? await res.json() : { revealPicks: false };
                  reveal = Boolean(jj.revealPicks);
                } catch {
                  reveal = false;
                }
              }
              note = "Auto schedule (Thu 1:00 PM CT)";
            }
          } else {
            // total fallback if endpoint missing
            try {
              const res = await fetch(`${backendBase}/api/lock-status?week=${week}`, { cache: "no-store" });
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

        // --- Picks (obeys visibility on backend) ---
        try {
          const res = await fetch(`${backendBase}/api/picks_week_${week}.json`, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            setPicksData(Array.isArray(data) ? data : []);
          } else {
            setPicksData([]);
          }
        } catch {
          setPicksData([]);
        }

        // --- Winners detail (for ✓/✗ and weekly points) ---
        try {
          const res = await fetch(`${backendBase}/data/winners_detail_week_${week}.json`, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            setWinnersData(Array.isArray(data) ? data : []);
          } else {
            setWinnersData([]);
          }
        } catch {
          setWinnersData([]);
        }

        // --- Totals (cumulative points) ---
        try {
          const res = await fetch(`${backendBase}/data/totals.json`, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            setTotalsData(data || {});
          } else {
            setTotalsData({});
          }
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

  const getWinnerForGame = (gameIndex) => {
    if (!winnersData || winnersData.length === 0) return null;
    const g = winnersData[gameIndex];
    if (!g) return null;
    return g.winner || null;
  };

  const getWeeklyScoreForPlayer = (playerName) => {
    if (!picksData || picksData.length === 0) return 0;
    return picksData
      .filter((p) => p.player === playerName)
      .flatMap((p) => p.picks)
      .reduce((acc, pick) => {
        const winner = getWinnerForGame(pick.gameIndex);
        return acc + (winner && pick.pick === winner ? 1 : 0);
      }, 0);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-1">All Players' Picks</h2>

      <div className="text-sm text-gray-600 mb-3">
        Visibility:&nbsp;
        <span className="font-semibold uppercase">{visibilityMode}</span>
        {visibilityNote ? <> — {visibilityNote}</> : null}
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
        <p className="text-red-600">
          {visibilityMode === "off"
            ? "Picks are hidden by Admin."
            : "Picks are hidden (Auto schedule)."}
        </p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Player</th>
              <th className="border px-2 py-1">Picks</th>
              <th className="border px-2 py-1">Correct Picks</th>
              <th className="border px-2 py-1">Weekly Points</th>
              <th className="border px-2 py-1">Cumulative Points</th>
            </tr>
          </thead>
          <tbody>
            {picksData.map((player, idx) => {
              const weeklyScore = getWeeklyScoreForPlayer(player.player);
              const cumulativeScore = totalsData[player.player] || 0;

              return (
                <tr key={idx}>
                  <td className="border px-2 py-1">{player.player}</td>
                  <td className="border px-2 py-1">
                    {player.picks.map((p, i) => (
                      <div key={i}>{p.pick}</div>
                    ))}
                  </td>
                  <td className="border px-2 py-1">
                    {player.picks.map((p, i) => {
                      const winner = getWinnerForGame(p.gameIndex);
                      const isCorrect = winner && p.pick === winner;
                      return (
                        <div
                          key={i}
                          className={isCorrect ? "text-green-600" : "text-red-600"}
                        >
                          {winner ? (isCorrect ? "✓" : "✗") : "-"}
                        </div>
                      );
                    })}
                  </td>
                  <td className="border px-2 py-1 text-center">{weeklyScore}</td>
                  <td className="border px-2 py-1 text-center">{cumulativeScore}</td>
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


