
import { useEffect, useState } from "react";
import { Flame, Trophy, CalendarDays, Target, Sparkles } from "lucide-react";
import api from "../services/api";

export default function Streaks() {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await api.get("/api/streaks/me");
        setStreak(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Unable to load streak details.");
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading streak statistics...</div>;
  }

  if (error) {
    return <div className="form-error">{error}</div>;
  }

  const milestones = [
    { days: 3, title: "Getting Started", description: "Complete 3 consecutive workout days." },
    { days: 7, title: "One Week Strong", description: "Reach a 7-day workout streak." },
    { days: 14, title: "Consistency Champion", description: "Reach a 14-day workout streak." },
    { days: 30, title: "Fitness Dedicated", description: "Reach a 30-day workout streak." },
    { days: 60, title: "Unstoppable", description: "Reach a 60-day workout streak." },
  ];

  return (
    <div className="streaks-page">
      <div className="streaks-heading">
        <span className="eyebrow">CONSISTENCY TRACKER</span>
        <h1>Your Workout Streaks</h1>
        <p>Build consistency, stay active, and celebrate every milestone.</p>
      </div>

      <div className="streaks-hero">
        <div className="streaks-hero-content">
          <div className="streaks-fire-icon">
            <Flame size={34} />
          </div>
          <span>YOUR CURRENT STREAK</span>
          <h2>{streak?.current_streak || 0} <small>days</small></h2>
          <p>
            {streak?.current_streak > 0
              ? "Keep going! Your consistency is paying off."
              : "Start today and build your workout streak!"}
          </p>
        </div>

        <div className="streaks-hero-decoration">
          <Flame size={150} />
        </div>
      </div>

      <div className="streaks-stats">
        <div className="streak-stat-card">
          <div className="streak-stat-icon"><Trophy /></div>
          <span>Longest Streak</span>
          <h3>{streak?.longest_streak || 0} <small>days</small></h3>
          <p>Your personal best</p>
        </div>

        <div className="streak-stat-card">
          <div className="streak-stat-icon"><CalendarDays /></div>
          <span>Last Workout</span>
          <h3 className="streak-date">
            {streak?.last_workout_date
              ? new Date(`${streak.last_workout_date}T00:00:00`).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "No workouts"}
          </h3>
          <p>Most recent workout date</p>
        </div>
      </div>

      <section className="streak-milestones">
        <div className="streak-section-heading">
          <div>
            <span className="eyebrow">YOUR ACHIEVEMENTS</span>
            <h2>Streak Milestones</h2>
          </div>
          <Sparkles size={24} />
        </div>

        <div className="streak-milestone-list">
          {milestones.map((milestone) => {
            const achieved = (streak?.longest_streak || 0) >= milestone.days;

            return (
              <div
                className={`streak-milestone ${achieved ? "achieved" : ""}`}
                key={milestone.days}
              >
                <div className="milestone-icon">
                  {achieved ? <Trophy size={22} /> : <Target size={22} />}
                </div>

                <div className="milestone-details">
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>

                <div className="milestone-status">
                  {achieved ? "Achieved" : `${milestone.days} days`}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
