
import { useEffect, useState } from "react";
import { Activity, Footprints, Flame, Clock, RefreshCw, Link2 } from "lucide-react";
import api from "../services/api";

const getToday = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

function ActivitySync() {
  const [form, setForm] = useState({
    source: "Google Fit",
    activity_date: getToday(),
    steps: "",
    calories: "",
    active_minutes: "",
  });

  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({
    total_steps: 0,
    total_calories: 0,
    total_active_minutes: 0,
    sync_count: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadActivities = async () => {
    try {
      setLoading(true);

      const [activityResponse, summaryResponse] = await Promise.all([
        api.get("/api/activity-sync/"),
        api.get("/api/activity-sync/daily-summary"),
      ]);

      setActivities(activityResponse.data);
      setSummary(summaryResponse.data);
      setError("");
    } catch (err) {
      setError("Unable to load activity data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSync = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await api.post("/api/activity-sync/", {
        source: form.source,
        activity_date: form.activity_date,
        steps: Number(form.steps || 0),
        calories: Number(form.calories || 0),
        active_minutes: Number(form.active_minutes || 0),
      });

      setMessage("Activity data saved successfully!");

      setForm({
        source: "Google Fit",
        activity_date: getToday(),
        steps: "",
        calories: "",
        active_minutes: "",
      });

      await loadActivities();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to save activity data."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="activity-sync-page">
      <div className="activity-sync-header">
        <div>
          <span className="activity-sync-eyebrow">FITNESS INTEGRATION</span>
          <h1>Activity Sync</h1>
          <p>Manage and track your activity data from fitness platforms.</p>
        </div>

        <button
          className="activity-refresh-btn"
          onClick={loadActivities}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="activity-provider-grid">
        <div className="activity-provider-card">
          <div className="activity-provider-icon google-icon">
            <Activity size={25} />
          </div>
          <div>
            <h3>Google Fit</h3>
            <p>Optional activity data source</p>
          </div>
          <span className="activity-provider-status">Manual Import</span>
        </div>

        <div className="activity-provider-card">
          <div className="activity-provider-icon apple-icon">
            <Activity size={25} />
          </div>
          <div>
            <h3>Apple Health</h3>
            <p>Optional activity data source</p>
          </div>
          <span className="activity-provider-status">Manual Import</span>
        </div>
      </div>

      <div className="activity-sync-notice">
        <Link2 size={19} />
        <p>
          Direct provider connections are not enabled in this web version.
          You can enter exported activity data below. Automatic syncing
          requires provider-specific mobile or API integration.
        </p>
      </div>

      <div className="activity-summary-grid">
        <div className="activity-summary-card">
          <Footprints size={23} />
          <span>Total Steps Today</span>
          <strong>{summary.total_steps.toLocaleString()}</strong>
        </div>

        <div className="activity-summary-card">
          <Flame size={23} />
          <span>Calories Burned</span>
          <strong>{summary.total_calories.toLocaleString()} kcal</strong>
        </div>

        <div className="activity-summary-card">
          <Clock size={23} />
          <span>Active Minutes</span>
          <strong>{summary.total_active_minutes} min</strong>
        </div>
      </div>

      <div className="activity-content-grid">
        <form className="activity-form-card" onSubmit={handleSync}>
          <h2>Import Activity Data</h2>
          <p className="activity-form-description">
            Add your daily activity information.
          </p>

          <label>
            Data Source
            <select
              name="source"
              value={form.source}
              onChange={handleChange}
            >
              <option value="Google Fit">Google Fit</option>
              <option value="Apple Health">Apple Health</option>
            </select>
          </label>

          <label>
            Activity Date
            <input
              type="date"
              name="activity_date"
              value={form.activity_date}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Steps
            <input
              type="number"
              name="steps"
              min="0"
              placeholder="Example: 6500"
              value={form.steps}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Calories Burned (kcal)
            <input
              type="number"
              name="calories"
              min="0"
              placeholder="Example: 320"
              value={form.calories}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Active Minutes
            <input
              type="number"
              name="active_minutes"
              min="0"
              placeholder="Example: 45"
              value={form.active_minutes}
              onChange={handleChange}
              required
            />
          </label>

          <button
            type="submit"
            className="activity-submit-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Activity Data"}
          </button>

          {message && <p className="activity-success">{message}</p>}
          {error && <p className="activity-error">{error}</p>}
        </form>

        <div className="activity-history-card">
          <div className="activity-history-header">
            <div>
              <h2>Sync History</h2>
              <p>Your previously imported activity records</p>
            </div>
            <span>{activities.length} Records</span>
          </div>

          {loading ? (
            <p className="activity-empty">Loading activity records...</p>
          ) : activities.length === 0 ? (
            <p className="activity-empty">
              No activity records yet. Import your first activity data.
            </p>
          ) : (
            <div className="activity-history-list">
              {activities.map((item) => (
                <div className="activity-history-item" key={item.id}>
                  <div className="activity-history-icon">
                    <Activity size={20} />
                  </div>

                  <div className="activity-history-info">
                    <strong>{item.source}</strong>
                    <span>{item.activity_date}</span>
                    <small>
                      {item.steps.toLocaleString()} steps · {item.calories} kcal · {item.active_minutes} min
                    </small>
                  </div>

                  <span className="activity-saved-label">Saved</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivitySync;

