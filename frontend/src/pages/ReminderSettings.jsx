
import { useEffect, useState } from "react";
import {
  BellRing,
  Dumbbell,
  Utensils,
  Droplets,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";

const initialForm = {
  reminder_type: "Workout",
  title: "",
  reminder_time: "07:00",
  repeat_days: "Every day",
  is_enabled: true,
};

const reminderIcons = {
  Workout: Dumbbell,
  Meal: Utensils,
  Water: Droplets,
};

export default function ReminderSettings() {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReminders = async () => {
    try {
      const response = await api.get("/api/reminders/");
      setReminders(response.data);
      setError("");
    } catch {
      setError("Unable to load reminders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (editingId) {
        await api.put(`/api/reminders/${editingId}`, form);
        setMessage("Reminder updated successfully.");
      } else {
        await api.post("/api/reminders/", form);
        setMessage("Reminder created successfully.");
      }

      resetForm();
      await loadReminders();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to save reminder.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (reminder) => {
    setEditingId(reminder.id);
    setForm({
      reminder_type: reminder.reminder_type,
      title: reminder.title,
      reminder_time: reminder.reminder_time.slice(0, 5),
      repeat_days: reminder.repeat_days,
      is_enabled: reminder.is_enabled,
    });
    setMessage("");
    setError("");
  };

  const handleToggle = async (reminder) => {
    try {
      await api.put(`/api/reminders/${reminder.id}`, {
        reminder_type: reminder.reminder_type,
        title: reminder.title,
        reminder_time: reminder.reminder_time.slice(0, 5),
        repeat_days: reminder.repeat_days,
        is_enabled: !reminder.is_enabled,
      });
      await loadReminders();
    } catch {
      setError("Unable to update reminder status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;

    try {
      await api.delete(`/api/reminders/${id}`);
      setMessage("Reminder deleted successfully.");
      if (editingId === id) resetForm();
      await loadReminders();
    } catch {
      setError("Unable to delete reminder.");
    }
  };

  const formatTime = (value) => {
    const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
  };

  return (
    <div className="reminder-page">
      <div className="reminder-header">
        <div>
          <span className="reminder-eyebrow">STAY CONSISTENT</span>
          <h1>Reminder Settings</h1>
          <p>Build healthy habits with personalized daily reminders.</p>
        </div>
        <div className="reminder-header-icon">
          <BellRing size={27} />
        </div>
      </div>

      <div className="reminder-overview">
        <div className="reminder-overview-card">
          <span>Total reminders</span>
          <strong>{reminders.length}</strong>
        </div>
        <div className="reminder-overview-card">
          <span>Active reminders</span>
          <strong>{reminders.filter((item) => item.is_enabled).length}</strong>
        </div>
        <div className="reminder-overview-card">
          <span>Disabled reminders</span>
          <strong>{reminders.filter((item) => !item.is_enabled).length}</strong>
        </div>
      </div>

      <div className="reminder-layout">
        <section className="reminder-form-card">
          <div className="reminder-section-heading">
            <div>
              <span className="reminder-eyebrow">
                {editingId ? "UPDATE SCHEDULE" : "PERSONALIZE"}
              </span>
              <h2>{editingId ? "Edit Reminder" : "Create Reminder"}</h2>
            </div>
            <Plus size={21} />
          </div>

          <form onSubmit={handleSubmit} className="reminder-form">
            <label>
              Reminder category
              <select
                name="reminder_type"
                value={form.reminder_type}
                onChange={handleChange}
              >
                <option value="Workout">Workout</option>
                <option value="Meal">Meal</option>
                <option value="Water">Water intake</option>
              </select>
            </label>

            <label>
              Reminder title
              <input
                type="text"
                name="title"
                placeholder="e.g. Morning workout"
                value={form.title}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </label>

            <label>
              Reminder time
              <input
                type="time"
                name="reminder_time"
                value={form.reminder_time}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Repeat schedule
              <select
                name="repeat_days"
                value={form.repeat_days}
                onChange={handleChange}
              >
                <option value="Every day">Every day</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
              </select>
            </label>

            <label className="reminder-checkbox">
              <input
                type="checkbox"
                name="is_enabled"
                checked={form.is_enabled}
                onChange={handleChange}
              />
              Enable this reminder
            </label>

            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Reminder"
                  : "Create Reminder"}
            </button>

            {editingId && (
              <button
                type="button"
                className="reminder-cancel-btn"
                onClick={resetForm}
              >
                Cancel Editing
              </button>
            )}
          </form>
        </section>

        <section className="reminder-list-card">
          <div className="reminder-section-heading">
            <div>
              <span className="reminder-eyebrow">YOUR SCHEDULE</span>
              <h2>Saved Reminders</h2>
            </div>
            <button
              className="reminder-refresh-btn"
              onClick={loadReminders}
              title="Refresh reminders"
            >
              <RefreshCw size={17} />
            </button>
          </div>

          {loading ? (
            <p className="reminder-empty">Loading reminders...</p>
          ) : reminders.length === 0 ? (
            <div className="reminder-empty">
              <BellRing size={35} />
              <h3>No reminders yet</h3>
              <p>Create your first reminder to build a consistent routine.</p>
            </div>
          ) : (
            <div className="reminder-items">
              {reminders.map((reminder) => {
                const Icon =
                  reminderIcons[reminder.reminder_type] || BellRing;

                return (
                  <div className="reminder-item" key={reminder.id}>
                    <div className="reminder-item-icon">
                      <Icon size={21} />
                    </div>

                    <div className="reminder-item-details">
                      <h3>{reminder.title}</h3>
                      <span>{reminder.reminder_type}</span>
                      <div className="reminder-item-meta">
                        <span>
                          <Clock size={13} />
                          {formatTime(reminder.reminder_time)}
                        </span>
                        <span>
                          <CalendarDays size={13} />
                          {reminder.repeat_days}
                        </span>
                      </div>
                    </div>

                    <div className="reminder-item-actions">
                      <button
                        className={`reminder-status ${
                          reminder.is_enabled ? "active" : "inactive"
                        }`}
                        onClick={() => handleToggle(reminder)}
                      >
                        {reminder.is_enabled ? "Active" : "Paused"}
                      </button>
                      <button
                        className="reminder-edit-btn"
                        onClick={() => handleEdit(reminder)}
                      >
                        Edit
                      </button>
                      <button
                        className="reminder-delete-btn"
                        onClick={() => handleDelete(reminder.id)}
                        title="Delete reminder"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {message && (
        <div className="reminder-success">
          <CheckCircle2 size={17} />
          {message}
        </div>
      )}
      {error && <div className="reminder-error">{error}</div>}
    </div>
  );
}

