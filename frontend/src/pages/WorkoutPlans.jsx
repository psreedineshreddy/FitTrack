import { useEffect, useState } from "react";
import {
  CalendarDays,
  Plus,
  Clock3,
  Pencil,
  Trash2,
  X,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  NotebookPen,
} from "lucide-react";
import api from "../services/api";
import "../styles/application.css";

const emptyForm = {
  title: "",
  description: "",
  scheduled_date: new Date().toISOString().split("T")[0],
};

function WorkoutPlans() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const fetchPlans = async () => {
    try {
      const response = await api.get("/api/workout-plans/");
      setPlans(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load workout plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await api.put(`/api/workout-plans/${editingId}`, form);
      } else {
        await api.post("/api/workout-plans/", form);
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await fetchPlans();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to save workout plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plan) => {
    setForm({
      title: plan.title,
      description: plan.description || "",
      scheduled_date: plan.scheduled_date,
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this workout plan?")) return;

    try {
      await api.delete(`/api/workout-plans/${id}`);
      await fetchPlans();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to delete workout plan.");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const monthStart = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    1
  );
  const daysInMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDay = monthStart.getDay();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getPlansForDay = (day) => {
    if (!day) return [];

    const date = [
      selectedMonth.getFullYear(),
      String(selectedMonth.getMonth() + 1).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");

    return plans.filter((plan) => plan.scheduled_date === date);
  };

  const upcomingPlans = plans
    .filter((plan) => plan.scheduled_date >= new Date().toLocaleDateString("en-CA"))
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));

  const formatDate = (value) =>
    new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return <div className="page-container">Loading workout plans...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">PLAN YOUR FITNESS</span>
          <h1>Workout Planner</h1>
          <p>Schedule your sessions and stay consistent with your goals.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} /> Create Plan
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
             <NotebookPen />
          <div>
            <span>Total Plans</span>
            <h2>{plans.length}</h2>
          </div>
        </div>

        <div className="stat-card">
            <Dumbbell />
          <div>
            <span>Upcoming Workouts</span>
            <h2>{upcomingPlans.length}</h2>
          </div>
        </div>

        <div className="stat-card">
           <CalendarDays />
          <div>
            <span>This Month</span>
            <h2>
              {
                plans.filter((plan) => {
                  const date = new Date(`${plan.scheduled_date}T00:00:00`);
                  return (
                    date.getMonth() === new Date().getMonth() &&
                    date.getFullYear() === new Date().getFullYear()
                  );
                }).length
              }
            </h2>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <section className="content-card calendar-card">
          <div className="section-heading">
            <div>
              <h2>Workout Calendar</h2>
              <p>View your scheduled fitness sessions</p>
            </div>

            <div className="calendar-navigation">
              <button
                onClick={() =>
                  setSelectedMonth(
                    new Date(
                      selectedMonth.getFullYear(),
                      selectedMonth.getMonth() - 1,
                      1
                    )
                  )
                }
              >
                <ChevronLeft size={18} />
              </button>

              <strong>
                {selectedMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </strong>

              <button
                onClick={() =>
                  setSelectedMonth(
                    new Date(
                      selectedMonth.getFullYear(),
                      selectedMonth.getMonth() + 1,
                      1
                    )
                  )
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div className="calendar-weekday" key={day}>
                  {day}
                </div>
              )
            )}

            {calendarDays.map((day, index) => {
              const dayPlans = getPlansForDay(day);
              const isToday =
                day === new Date().getDate() &&
                selectedMonth.getMonth() === new Date().getMonth() &&
                selectedMonth.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={index}
                  className={`calendar-day ${isToday ? "today" : ""} ${
                    dayPlans.length ? "has-workout" : ""
                  }`}
                >
                  {day && (
                    <>
                      <span>{day}</span>
                      {dayPlans.map((plan) => (
                        <div className="calendar-event" key={plan.id}>
                          {plan.title}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="content-card upcoming-card">
          <div className="section-heading">
            <div>
              <h2>Upcoming Workouts</h2>
              <p>Your next scheduled sessions</p>
            </div>
          </div>

          <div className="upcoming-list">
            {upcomingPlans.length === 0 ? (
              <div className="empty-state">
                <CalendarDays size={32} />
                <h3>No upcoming workouts</h3>
                <p>Create your first workout plan.</p>
              </div>
            ) : (
              upcomingPlans.map((plan) => (
                <div className="upcoming-item" key={plan.id}>
                  <div className="upcoming-icon">
                    <Dumbbell size={20} />
                  </div>

                  <div className="upcoming-details">
                    <h3>{plan.title}</h3>
                    <span>{formatDate(plan.scheduled_date)}</span>
                    {plan.description && <p>{plan.description}</p>}
                  </div>

                  <div className="plan-actions">
                    <button onClick={() => handleEdit(plan)}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(plan.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="form-modal">
            <div className="modal-heading">
              <div>
                <h2>{editingId ? "Edit Workout Plan" : "Create Workout Plan"}</h2>
                <p>Schedule your next fitness session.</p>
              </div>
              <button onClick={closeForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Workout Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="e.g. Morning Cardio"
                maxLength={150}
                required
              />

              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe your planned workout"
                rows={4}
              />

              <label>Scheduled Date</label>
              <input
                type="date"
                value={form.scheduled_date}
                onChange={(e) =>
                  setForm({ ...form, scheduled_date: e.target.value })
                }
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : editingId ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutPlans;