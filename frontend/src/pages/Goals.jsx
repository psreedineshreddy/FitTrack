
import { useEffect, useState } from "react";
import { Target, Plus, Pencil, CalendarDays, TrendingUp } from "lucide-react";
import api from "../services/api";
import "../styles/application.css";

const initialForm = {
  goal_type: "Weight Loss",
  target_value: "",
  current_value: 0,
  deadline: "",
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadGoals = async () => {
    try {
      const response = await api.get("/api/goals/");
      setGoals(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (Number(form.current_value) > Number(form.target_value)) {
      setError("Current value cannot exceed the target value.");
      return;
    }

    setSaving(true);

    const payload = {
      goal_type: form.goal_type,
      target_value: Number(form.target_value),
      current_value: Number(form.current_value),
      deadline: form.deadline,
    };

    try {
      if (editingId) {
        await api.put(`/api/goals/${editingId}`, {
          target_value: payload.target_value,
          current_value: payload.current_value,
          deadline: payload.deadline,
        });
        setSuccess("Goal updated successfully.");
      } else {
        await api.post("/api/goals/", payload);
        setSuccess("Goal created successfully.");
      }

      setForm(initialForm);
      setEditingId(null);
      await loadGoals();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to save goal.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingId(goal.id);
    setForm({
      goal_type: goal.goal_type,
      target_value: goal.target_value,
      current_value: goal.current_value,
      deadline: goal.deadline,
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return <div className="loading-screen">Loading goals...</div>;
  }

  return (
    <main className="workouts-page">
      <header className="workouts-header">
        <div>
          
          <h1 className="page-title">Goal Setting</h1>
          <p className="muted">
            Set your fitness goals and track your progress.
          </p>
        </div>
      </header>

      <section className="goal-form-section">
        <h2>
          <Target size={21} />
          {editingId ? "Update Goal" : "Set a New Goal"}
        </h2>

        <form onSubmit={handleSubmit} className="goal-form">
          <div className="form-group">
            <label>Goal Type</label>
            <select
              name="goal_type"
              value={form.goal_type}
              onChange={handleChange}
              disabled={Boolean(editingId)}
              required
            >
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="Steps">Steps</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target Value</label>
            <input
              type="number"
              name="target_value"
              min="0.01"
              step="any"
              value={form.target_value}
              onChange={handleChange}
              placeholder="Enter target"
              required
            />
          </div>

          <div className="form-group">
            <label>Current Value</label>
            <input
              type="number"
              name="current_value"
              min="0"
              step="any"
              value={form.current_value}
              onChange={handleChange}
              placeholder="Enter current progress"
              required
            />
          </div>

          <div className="form-group">
            <label>Deadline</label>
            <input
              type="date"
              name="deadline"
              min={new Date().toISOString().split("T")[0]}
              value={form.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="goal-form-actions">
            <button type="submit" disabled={saving}>
              <Plus size={17} />
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Goal"
                  : "Create Goal"}
            </button>

            {editingId && (
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}
      </section>

      <section className="goals-list-section">
        <h2>My Goals</h2>

        {goals.length === 0 ? (
          <div className="empty-state">
            <Target size={35} />
            <p>No goals created yet. Set your first fitness goal!</p>
          </div>
        ) : (
          <div className="goals-grid">
            {goals.map((goal) => {
              const percentage = Math.min(
                100,
                Math.round(
                  (goal.current_value / goal.target_value) * 100
                )
              );

              return (
                <article className="goal-card" key={goal.id}>
                  <div className="goal-card-header">
                    <div className="goal-icon">
                      <Target size={22} />
                    </div>
                    <span
                      className={`goal-status ${
                        goal.status === "COMPLETED"
                          ? "completed"
                          : "active"
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>

                  <h3>{goal.goal_type}</h3>

                  <div className="goal-values">
                    <strong>
                      {goal.current_value} / {goal.target_value}
                    </strong>
                    <span>{percentage}%</span>
                  </div>

                  <div className="goal-progress-track">
                    <div
                      className="goal-progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="goal-deadline">
                    <CalendarDays size={16} />
                    Deadline: {goal.deadline}
                  </p>

                  <p className="goal-progress-text">
                    <TrendingUp size={16} />
                    {percentage}% completed
                  </p>

                  <button
                    type="button"
                    className="goal-edit-button"
                    onClick={() => handleEdit(goal)}
                  >
                    <Pencil size={16} />
                    Update Progress
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

