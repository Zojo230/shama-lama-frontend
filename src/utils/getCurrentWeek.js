// src/utils/getCurrentWeek.js

export const getCurrentWeek = async () => {
  try {
    const res = await fetch('/data/current_week.json');
    const json = await res.json();
    return json.currentWeek; // ✅ must match the key inside current_week.json
  } catch (err) {
    console.error('Error fetching current week:', err);
    return 1; // fallback to week 1 if anything fails
  }
};
