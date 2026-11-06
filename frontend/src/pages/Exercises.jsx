
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  Dumbbell,
  Clock3,
  X,
  BookOpen,
} from "lucide-react";
import api from "../services/api";
import "../styles/application.css";

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "Cardio",
    description: "",
    duration: 30,
  });

  const fetchExercises = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/exercises/", {
        params: {
          search: search || undefined,
          category: category || undefined,
        },
      });

      setExercises(response.data);
      setError("");
    } catch (err) {
      setError("Unable to load exercises.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchExercises, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.post("/api/exercises/", {
        ...form,
        duration: Number(form.duration),
      });

      setForm({
        name: "",
        category: "Cardio",
        description: "",
        duration: 30,
      });

      setShowForm(false);
      await fetchExercises();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to add exercise."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exercise?")) {
      return;
    }

    try {
      setError("");
      await api.delete(`/api/exercises/${id}`);
      await fetchExercises();
    } catch (err) {
      setError("Unable to delete exercise.");
    }
  };

  return (
    <div className="page-container exercise-library-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">FITNESS LIBRARY</p>
          <h1>Exercise Library</h1>
          <p>
            Explore, discover and manage exercises for your fitness journey.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close Form" : "Add Exercise"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {showForm && (
        <form
          className="content-card exercise-form"
          onSubmit={handleSubmit}
        >
          <h3>Add New Exercise</h3>

          <input
            type="text"
            placeholder="Exercise name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          >
            <option value="Cardio">Cardio</option>
            <option value="Strength">Strength</option>
            <option value="Yoga">Yoga</option>
          </select>

          <textarea
            placeholder="Describe this exercise..."
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <input
            type="number"
            min="1"
            placeholder="Duration in minutes"
            value={form.duration}
            onChange={(e) =>
              setForm({ ...form, duration: e.target.value })
            }
            required
          />

          <button
            className="primary-button"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Exercise"}
          </button>
        </form>
      )}

      <div className="content-card library-card">
        <div className="section-heading">
          <div>
            <h3>Browse Exercises</h3>
            <p>Find the right activity for your training routine.</p>
          </div>

          <span>{exercises.length} exercises</span>
        </div>

        <div className="library-toolbar">
          <div className="search-filter-row">
            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Cardio">Cardio</option>
              <option value="Strength">Strength</option>
              <option value="Yoga">Yoga</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <Dumbbell size={30} />
            <p>Loading exercises...</p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={34} />
            <p>No exercises found.</p>
            <span>Add an exercise or adjust your search filters.</span>
          </div>
        ) : (
          <div className="exercise-grid">
            {exercises.map((exercise) => (
              <div className="content-card" key={exercise.id}>
                <div className="section-heading">
                  <div className="exercise-icon">
                    <Dumbbell size={21} />
                  </div>

                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => handleDelete(exercise.id)}
                    title="Delete exercise"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <h3>{exercise.name}</h3>

                <span className="category-badge">
                  {exercise.category}
                </span>

                <p>
                  {exercise.description || "No description provided."}
                </p>

                <div className="exercise-duration">
                  <Clock3 size={16} />
                  <span>{exercise.duration} minutes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
