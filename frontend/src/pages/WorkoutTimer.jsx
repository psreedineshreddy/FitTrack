
import { useEffect, useState } from "react";
import {
  Play, Square, RotateCcw, Timer, Flame, Activity, CheckCircle2
} from "lucide-react";
import api from "../services/api";

const calorieRates = {
  Cardio: 8,
  Strength: 6,
  Yoga: 3,
  Flexibility: 3,
  Other: 5,
};

export default function WorkoutTimer() {
  const [workoutName, setWorkoutName] = useState("Workout Session");
  const [category, setCategory] = useState("Cardio");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const calories = Math.floor(
    (elapsed / 60) * calorieRates[category]
  );

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setElapsed((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hours, minutes, secs]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };

  const startWorkout = () => {
    setMessage("");
    setRunning(true);
  };

  const stopWorkout = async () => {
    if (elapsed < 60) {
      setRunning(false);
      setMessage("Complete at least one minute before saving.");
      return;
    }

    try {
      setRunning(false);
      setSaving(true);
      setMessage("");

      await api.post("/api/workouts/", {
        workout_name: workoutName,
        category,
        duration: Math.max(1, Math.round(elapsed / 60)),
        calories_burned: calories,
        workout_date: new Date().toISOString().slice(0, 10),
      });

      setMessage("Workout completed and saved successfully!");
      setElapsed(0);
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Unable to save workout."
      );
    } finally {
      setSaving(false);
    }
  };

  const resetWorkout = () => {
    setRunning(false);
    setElapsed(0);
    setMessage("");
  };

  return (
    <div className="timer-page">
      <div className="timer-header">
        <div>
          <span className="timer-eyebrow">LIVE ACTIVITY TRACKING</span>
          <h1>Workout Timer</h1>
          <p>Track your workout duration and estimated calories in real time.</p>
        </div>
      </div>

      <div className="timer-panel">
        <div className="timer-icon"><Timer size={25} /></div>

        <span className="timer-status">
          {running ? "WORKOUT IN PROGRESS" : "READY TO WORKOUT"}
        </span>

        <div className="timer-display">{formatTime(elapsed)}</div>

        <div className="timer-live-stats">
          <div>
            <Flame size={22} />
            <span>ESTIMATED CALORIES</span>
            <strong>{calories} kcal</strong>
          </div>
          <div>
            <Activity size={22} />
            <span>DURATION</span>
            <strong>{Math.floor(elapsed / 60)} min</strong>
          </div>
        </div>

        <div className="timer-controls">
          {!running ? (
            <button
              className="timer-primary-btn"
              onClick={startWorkout}
              disabled={saving}
            >
              <Play size={19} /> Start Workout
            </button>
          ) : (
            <button
              className="timer-primary-btn"
              onClick={() => setRunning(false)}
            >
              <Square size={18} /> Stop & Save
            </button>
          )}

          <button
            className="timer-reset-btn"
            onClick={resetWorkout}
            disabled={saving || running}
          >
            <RotateCcw size={18} /> Reset
          </button>
        </div>
      </div>

      <div className="timer-details">
        <h2>Workout Details</h2>

        <label>Workout Name</label>
        <input
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          disabled={running || saving}
        />

        <label>Workout Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={running || saving}
        >
          {Object.keys(calorieRates).map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <button
          className="timer-save-btn"
          onClick={stopWorkout}
          disabled={running || saving || elapsed < 60 || !workoutName.trim()}
        >
          
          {saving ? "Saving..." : "Finish & Save Workout"}
        </button>

        {message && <p className="timer-message">{message}</p>}
        <p className="timer-note">
          Calories are estimated using category-based activity rates.
        </p>
      </div>
    </div>
  );
}

