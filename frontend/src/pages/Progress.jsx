import { useEffect, useState } from "react";
import { Activity, Flame, CalendarDays } from "lucide-react";
import api from "../services/api";
import "../styles/application.css";

export default function Progress() {
  const [progress, setProgress] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProgress = async (date) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/progress/daily", {
        params: { selected_date: date },
      });

      setProgress(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load daily progress."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress(selectedDate);
  }, []);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTrackProgress = () => {
    if (selectedDate) {
      loadProgress(selectedDate);
    }
  };

  const formattedDate = progress?.date
    ? new Date(`${progress.date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <main className="progress-page">
      <header className="progress-heading">
        <div>
          <span className="eyebrow">YOUR FITNESS ACTIVITY</span>
          <h1>Daily Progress</h1>
          <p>Choose any date to track your workouts and calories.</p>
        </div>
      </header>

      <section className="progress-date-filter">
        <div>
          <label htmlFor="progress-date">Select Progress Date</label>
          <input
            id="progress-date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>

        <button
          className="primary-button"
          onClick={handleTrackProgress}
          disabled={!selectedDate || loading}
        >
          {loading ? "Loading..." : "Track Progress"}
        </button>
      </section>

      {error ? (
        <p className="form-error">{error}</p>
      ) : loading ? (
        <div className="loading-screen">Loading daily progress...</div>
      ) : (
        <section className="progress-cards">
          <article className="progress-card">
            <div className="progress-card-icon">
              <Activity size={22} />
            </div>
            <span className="progress-card-label">Total Workouts</span>
            <h2>{progress?.total_workouts ?? 0}</h2>
            <p className="progress-card-description">
              Workouts completed on this date
            </p>
          </article>

          <article className="progress-card">
            <div className="progress-card-icon">
              <Flame size={22} />
            </div>
            <span className="progress-card-label">Calories Burned</span>
            <h2>{progress?.total_calories ?? 0}</h2>
            <p className="progress-card-description">
              Calories burned on this date
            </p>
          </article>

          <article className="progress-card">
            <div className="progress-card-icon">
              <CalendarDays size={22} />
            </div>
            <span className="progress-card-label">Progress Date</span>
            <h2>{formattedDate}</h2>
            <p className="progress-card-description">
              Selected daily activity summary
            </p>
          </article>
        </section>
      )}
    </main>
  );
}
