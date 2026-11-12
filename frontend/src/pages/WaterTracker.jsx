
import { useEffect, useState } from "react";
import {
  Droplets,
  Plus,
  Trash2,
  GlassWater,
  CalendarDays,
  Target,
} from "lucide-react";

import api from "../services/api";
import "../styles/application.css";

const getToday = () => new Date().toLocaleDateString("en-CA");

export default function WaterTracker() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({
    total_intake: 0,
    daily_goal: 2500,
    remaining: 2500,
    progress_percentage: 0,
  });
  const [quantity, setQuantity] = useState("250");
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadWaterData = async () => {
    try {
      setLoading(true);

      const [entriesResponse, summaryResponse] = await Promise.all([
        api.get("/api/water/", {
          params: { selected_date: selectedDate },
        }),
        api.get("/api/water/daily-summary", {
          params: { selected_date: selectedDate },
        }),
      ]);

      setEntries(entriesResponse.data);
      setSummary(summaryResponse.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load water intake data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaterData();
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.post("/api/water/", {
        quantity: Number(quantity),
      });

      setQuantity("250");
      await loadWaterData();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to save water intake."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this water entry?")) return;

    try {
      await api.delete(`/api/water/${id}`);
      await loadWaterData();
    } catch (err) {
      setError("Unable to delete water entry.");
    }
  };

  const percentage = Math.min(
    Number(summary.progress_percentage || 0),
    100
  );

  return (
    <div className="water-page">
      <div className="water-header">
        <div>
          <span className="eyebrow">HEALTH & WELLNESS</span>
          <h1>Water Intake Tracker</h1>
          <p className="muted">
            Stay hydrated. Build healthy habits. Feel your best.
          </p>
        </div>

        <div className="water-header-icon">
          <Droplets size={30} />
        </div>
      </div>

      <div className="water-date">
        <CalendarDays size={19} />
        <span>Daily Hydration</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="water-overview content-card">
        <div className="water-overview-top">
          <div>
            <span className="water-label">TODAY'S INTAKE</span>
            <h2>
              {Number(summary.total_intake || 0).toLocaleString()}
              <small> ml</small>
            </h2>
            <p>
              Daily goal: {Number(summary.daily_goal || 2500).toLocaleString()} ml
            </p>
          </div>

          <div className="water-progress-icon">
            <Droplets size={32} />
          </div>
        </div>

        <div className="water-progress-track">
          <div
            className="water-progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="water-progress-details">
          <strong>{percentage}% completed</strong>
          <span>
            {Number(summary.remaining || 0).toLocaleString()} ml remaining
          </span>
        </div>
      </div>

      <div className="water-stats">
        <div className="water-stat-card">
          <div className="water-stat-icon">
            <Droplets size={21} />
          </div>
          <div>
            <p>Total Intake</p>
            <h3>{Number(summary.total_intake || 0).toLocaleString()} ml</h3>
          </div>
        </div>

        <div className="water-stat-card">
          <div className="water-stat-icon">
            <Target size={21} />
          </div>
          <div>
            <p>Daily Goal</p>
            <h3>{Number(summary.daily_goal || 2500).toLocaleString()} ml</h3>
          </div>
        </div>

        <div className="water-stat-card">
          <div className="water-stat-icon">
            <GlassWater size={21} />
          </div>
          <div>
            <p>Remaining</p>
            <h3>{Number(summary.remaining || 0).toLocaleString()} ml</h3>
          </div>
        </div>
      </div>

      <section className="content-card water-log-card">
        <div className="section-heading">
          <div>
            <h3>Log Water Intake</h3>
            <p>Record the amount of water you drink.</p>
          </div>
        </div>

        <form className="water-entry-form" onSubmit={handleSubmit}>
          <div>
            <label>Water Quantity (ml)</label>
            <input
              className="form-input"
              type="number"
              min="1"
              max="10000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            <Plus size={18} />
            {saving ? "Saving..." : "Add Water"}
          </button>
        </form>
      </section>

      <section className="content-card water-history">
        <div className="section-heading">
          <div>
            <h3>Water Intake History</h3>
            <p>All water entries for your selected date.</p>
          </div>
          <span>{entries.length} entries</span>
        </div>

        {loading ? (
          <div className="workout-empty">Loading water entries...</div>
        ) : entries.length === 0 ? (
          <div className="workout-empty">
            <Droplets size={35} />
            <h3>No water entries yet</h3>
            <p className="muted">
              Start tracking your hydration by logging your first glass.
            </p>
          </div>
        ) : (
          <div className="water-entry-list">
            {entries.map((entry) => (
              <div className="water-entry-item" key={entry.id}>
                <div className="water-entry-icon">
                  <GlassWater size={20} />
                </div>

                <div className="water-entry-info">
                  <strong>{entry.quantity} ml</strong>
                  <span>Water intake</span>
                </div>

                <button
                  className="icon-button"
                  onClick={() => handleDelete(entry.id)}
                  title="Delete water entry"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

