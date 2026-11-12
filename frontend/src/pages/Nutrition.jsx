import { useEffect, useState } from "react";
import {
  Apple,
  Plus,
  Trash2,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Utensils,
  CalendarDays,
} from "lucide-react";

import api from "../services/api";
import "../styles/application.css";

const getToday = () =>
  new Date().toLocaleDateString("en-CA");

const emptyForm = {
  meal_type: "Breakfast",
  food_name: "",
  calories: "",
  protein: "",
  carbs: "",
  fats: "",
};

export default function Nutrition() {
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState({
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fats: 0,
  });

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadNutrition = async () => {
    try {
      setLoading(true);

      const [mealResponse, summaryResponse] = await Promise.all([
        api.get("/api/meals/", {
          params: { selected_date: selectedDate },
        }),
        api.get("/api/meals/daily-summary", {
          params: { selected_date: selectedDate },
        }),
      ]);

      setMeals(mealResponse.data);
      setSummary(summaryResponse.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load nutrition data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNutrition();
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        calories: Number(form.calories),
        protein: Number(form.protein || 0),
        carbs: Number(form.carbs || 0),
        fats: Number(form.fats || 0),
      };

      await api.post("/api/meals/", payload);

      setForm(emptyForm);
      setShowForm(false);

      await loadNutrition();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to add meal."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this meal entry?")) return;

    try {
      await api.delete(`/api/meals/${id}`);
      await loadNutrition();
    } catch (err) {
      setError("Unable to delete meal.");
    }
  };

  const nutritionCards = [
    {
      label: "Calories Consumed",
      value: Math.round(summary.total_calories || 0),
      unit: "kcal",
      icon: Flame,
      color: "calories",
    },
    {
      label: "Protein",
      value: Number(summary.total_protein || 0).toFixed(1),
      unit: "g",
      icon: Beef,
      color: "protein",
    },
    {
      label: "Carbohydrates",
      value: Number(summary.total_carbs || 0).toFixed(1),
      unit: "g",
      icon: Wheat,
      color: "carbs",
    },
    {
      label: "Fats",
      value: Number(summary.total_fats || 0).toFixed(1),
      unit: "g",
      icon: Droplets,
      color: "fats",
    },
  ];

  return (
    <div className="nutrition-page">
      <div className="nutrition-header">
        <div>
          <span className="eyebrow">HEALTH & WELLNESS</span>
          <h1>Nutrition Tracking</h1>
          <p className="muted">
            Nourish your body. Track your nutrition. Stay balanced.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Add Meal
        </button>
      </div>

      <div className="nutrition-date">
        <CalendarDays size={19} />
        <span>Daily Nutrition</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      {showForm && (
        <form className="content-card nutrition-form" onSubmit={handleSubmit}>
          <h3>Add Food Entry</h3>

          <div className="nutrition-form-grid">
            <div>
              <label>Meal Type</label>
              <select
                className="form-input"
                value={form.meal_type}
                onChange={(e) =>
                  setForm({ ...form, meal_type: e.target.value })
                }
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snacks</option>
              </select>
            </div>

            <div>
              <label>Food Name</label>
              <input
                className="form-input"
                placeholder="e.g. Oatmeal"
                value={form.food_name}
                onChange={(e) =>
                  setForm({ ...form, food_name: e.target.value })
                }
                required
                minLength={2}
                maxLength={150}
              />
            </div>

            <div>
              <label>Calories (kcal)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="10000"
                step="any"
                value={form.calories}
                onChange={(e) =>
                  setForm({ ...form, calories: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label>Protein (g)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="1000"
                step="any"
                value={form.protein}
                onChange={(e) =>
                  setForm({ ...form, protein: e.target.value })
                }
              />
            </div>

            <div>
              <label>Carbs (g)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="1000"
                step="any"
                value={form.carbs}
                onChange={(e) =>
                  setForm({ ...form, carbs: e.target.value })
                }
              />
            </div>

            <div>
              <label>Fats (g)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="1000"
                step="any"
                value={form.fats}
                onChange={(e) =>
                  setForm({ ...form, fats: e.target.value })
                }
              />
            </div>
          </div>

          <div className="nutrition-form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Meal"}
            </button>
          </div>
        </form>
      )}

      <div className="nutrition-stats">
        {nutritionCards.map((item) => {
          const Icon = item.icon;

          return (
            <div className="nutrition-stat-card" key={item.label}>
              <div className={`nutrition-stat-icon ${item.color}`}>
                <Icon size={21} />
              </div>

              <div>
                <p>{item.label}</p>
                <h2>
                  {item.value}
                  <small> {item.unit}</small>
                </h2>
              </div>
            </div>
          );
        })}
      </div>

      <section className="content-card nutrition-meals">
        <div className="section-heading">
          <div>
            <h3>Today's Food Log</h3>
            <p>Review the meals recorded for your selected date.</p>
          </div>

          <span>{meals.length} entries</span>
        </div>

        {loading ? (
          <div className="workout-empty">
            Loading nutrition data...
          </div>
        ) : meals.length === 0 ? (
          <div className="workout-empty">
            <Apple size={35} />
            <h3>No meals recorded</h3>
            <p className="muted">
              Start tracking your daily nutrition by adding a meal.
            </p>

            <button
              className="primary-button"
              onClick={() => setShowForm(true)}
            >
              <Plus size={17} /> Add Your First Meal
            </button>
          </div>
        ) : (
          <div className="nutrition-meal-list">
            {meals.map((meal) => (
              <div className="nutrition-meal-item" key={meal.id}>
                <div className="nutrition-meal-icon">
                  <Utensils size={20} />
                </div>

                <div className="nutrition-meal-info">
                  <span className="category-badge">
                    {meal.meal_type}
                  </span>
                  <h4>{meal.food_name}</h4>
                  <p>
                    Protein: {meal.protein}g ·
                    Carbs: {meal.carbs}g ·
                    Fats: {meal.fats}g
                  </p>
                </div>

                <div className="nutrition-meal-calories">
                  <strong>{meal.calories}</strong>
                  <span>kcal</span>
                </div>

                <button
                  className="icon-button"
                  onClick={() => handleDelete(meal.id)}
                  title="Delete meal"
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

