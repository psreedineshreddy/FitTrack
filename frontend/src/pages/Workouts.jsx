import { useEffect, useState } from "react";
import {
  Activity, Plus, Search, Pencil, Trash2,
  Clock3, Flame, CalendarDays, X
} from "lucide-react";
import api from "../services/api";
import "../styles/application.css";

const emptyForm = {
  workout_name: "",
  category: "Cardio",
  duration: "",
  calories_burned: "",
  workout_date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0],
};

export default function Workouts() {

  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadWorkouts = async () => {
    try {
      const response = await api.get("/api/workouts/");
      setWorkouts(response.data);
    } catch {
      setError("Unable to load workouts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (workout) => {
    setForm({
      workout_name: workout.workout_name,
      category: workout.category,
      duration: String(workout.duration),
      calories_burned: String(workout.calories_burned),
      workout_date: workout.workout_date,
    });
    setEditingId(workout.id);
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      duration: Number(form.duration),
      calories_burned: Number(form.calories_burned),
    };

    try {
      if (editingId) {
        await api.put(`/api/workouts/${editingId}`, payload);
      } else {
        await api.post("/api/workouts/", payload);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadWorkouts();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to save workout.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workout?")) {
      return;
    }

    try {
      await api.delete(`/api/workouts/${id}`);
      await loadWorkouts();
    } catch {
      setError("Unable to delete workout. Please try again.");
    }
  };

  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch = workout.workout_name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || workout.category === category;

    return matchesSearch && matchesCategory;
  });

  const totalDuration = workouts.reduce((sum, item) => sum + item.duration, 0);
  const totalCalories = workouts.reduce(
    (sum, item) => sum + item.calories_burned, 0
  );

  return (
    <main className="workouts-page">
      <section className="workouts-content">
        <div className="workouts-heading">
          <div>
            <span className="eyebrow">YOUR TRAINING SPACE</span>
            <h1 className="page-title">Workout Management</h1>
            <p className="muted">
              Track your sessions. Stay consistent. Keep improving.
            </p>
          </div>

          <button className="primary-button add-workout-btn" onClick={openAddForm}>
            <Plus size={18} /> Add Workout
          </button>
        </div>

        <div className="workout-stats">
          <article className="workout-stat-card">
            <span><Activity size={19} /></span>
            <div>
              <p>Total Workouts</p>
              <h2>{workouts.length}</h2>
            </div>
          </article>

          <article className="workout-stat-card">
            <span><Clock3 size={19} /></span>
            <div>
              <p>Total Duration</p>
              <h2>{totalDuration} <small>min</small></h2>
            </div>
          </article>

          <article className="workout-stat-card">
            <span><Flame size={19} /></span>
            <div>
              <p>Calories Burned</p>
              <h2>{totalCalories.toLocaleString()}</h2>
            </div>
          </article>
        </div>

        <div className="workout-toolbar">
          <div className="workout-search">
            <Search size={18} />
            <input
              placeholder="Search workouts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-input category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All</option>
            <option>Cardio</option>
            <option>Strength</option>
            <option>Yoga</option>
          </select>
        </div>

        {error && <p className="form-error">{error}</p>}

        {loading ? (
          <div className="workout-empty">Loading your workouts...</div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="workout-empty">
            <Activity size={34} />
            <h3>No workouts found</h3>
            <p className="muted">
              Add your first workout or change your search filters.
            </p>
            <button className="primary-button" onClick={openAddForm}>
              <Plus size={17} /> Add your first workout
            </button>
          </div>
        ) : (
          <div className="workout-grid">
            {filteredWorkouts.map((workout) => (
              <article className="workout-card" key={workout.id}>
                <div className="workout-card-top">
                  <span className={`category-tag ${workout.category.toLowerCase()}`}>
                    {workout.category}
                  </span>
                  <div className="workout-actions">
                    <button
                      onClick={() => openEditForm(workout)}
                      aria-label="Edit workout"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(workout.id)}
                      aria-label="Delete workout"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3>{workout.workout_name}</h3>

                <div className="workout-details">
                  <span><Clock3 size={15} /> {workout.duration} min</span>
                  <span><Flame size={15} /> {workout.calories_burned} kcal</span>
                  <span>
                    <CalendarDays size={15} />
                    {new Date(`${workout.workout_date}T00:00:00`).toLocaleDateString()}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="workout-modal-backdrop">
          <section className="workout-modal">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">WORKOUT DETAILS</span>
                <h2>{editingId ? "Edit Workout" : "Add New Workout"}</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Workout Name</label>
              <input
                className="form-input"
                name="workout_name"
                placeholder="e.g. Morning Run"
                value={form.workout_name}
                onChange={handleChange}
                minLength={2}
                maxLength={100}
                required
              />

              <label>Category</label>
              <select
                className="form-input"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Cardio</option>
                <option>Strength</option>
                <option>Yoga</option>
              </select>

              <div className="form-two-columns">
                <div>
                  <label>Duration (minutes)</label>
                  <input
                    className="form-input"
                    type="number"
                    name="duration"
                    min="1"
                    max="1440"
                    placeholder="45"
                    value={form.duration}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>Calories Burned</label>
                  <input
                    className="form-input"
                    type="number"
                    name="calories_burned"
                    min="0"
                    placeholder="300"
                    value={form.calories_burned}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <label>Workout Date</label>
              <input
                className="form-input"
                type="date"
                name="workout_date"
                value={form.workout_date}
                onChange={handleChange}
                required
              />

              {error && <p className="form-error">{error}</p>}

              <button className="primary-button modal-submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Workout"}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

