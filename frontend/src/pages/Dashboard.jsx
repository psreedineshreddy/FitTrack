
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Flame,
  Clock3,
  CalendarDays,
  Target,
  Trophy,
  ArrowRight,
  TrendingUp,
  Activity,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/dashboard.css";

const getToday = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [upcomingPlans, setUpcomingPlans] = useState([]);
  const [goals, setGoals] = useState([]);
  const [streak, setStreak] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const results = await Promise.allSettled([
        api.get("/api/workouts/"),
        api.get("/api/workout-plans/upcoming"),
        api.get("/api/goals/"),
        api.get("/api/streaks/me"),
        api.get("/api/badges/my"),
      ]);

      if (results[0].status === "fulfilled") {
        setWorkouts(results[0].value.data || []);
      }

      if (results[1].status === "fulfilled") {
        setUpcomingPlans(results[1].value.data || []);
      }

      if (results[2].status === "fulfilled") {
        setGoals(results[2].value.data || []);
      }

      if (results[3].status === "fulfilled") {
        setStreak(results[3].value.data);
      }

      if (results[4].status === "fulfilled") {
        setBadges(results[4].value.data || []);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const today = getToday();

  const todayWorkouts = workouts.filter(
    (workout) => workout.workout_date === today
  );

  const totalCalories = todayWorkouts.reduce(
    (total, workout) => total + Number(workout.calories_burned || 0),
    0
  );

  const totalDuration = todayWorkouts.reduce(
    (total, workout) => total + Number(workout.duration || 0),
    0
  );

  const activeGoals = goals.filter(
    (goal) => String(goal.status || "").toLowerCase() !== "completed"
  );

  const getGoalPercentage = (goal) => {
    const target = Number(goal.target_value || 0);
    const current = Number(goal.current_value || 0);

    if (target <= 0) return 0;

    return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
  };

  if (loading) {
    return <div className="dashboard-placeholder">Loading your fitness overview...</div>;
  }

  return (
    <div className="dashboard-placeholder personalized-dashboard">
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow">YOUR FITNESS OVERVIEW</span>

          <h1 className="page-title">
            Welcome back, {user?.username || "Athlete"}!
          </h1>

          <p className="muted">
            Your fitness journey continues. Let's make today count.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/workouts")}
        >
          <Dumbbell size={18} />
          Manage Workouts
        </button>
      </section>

      <div className="dashboard-section-heading">
        <div>
          <span className="eyebrow">TODAY'S ACTIVITY</span>
          <h2>Daily Summary</h2>
        </div>
        <span className="dashboard-date">{formatDate(today)}</span>
      </div>

      <div className="dashboard-summary-grid">
        <div className="dashboard-summary-card">
          <div className="dashboard-card-icon"><Dumbbell /></div>
          <span>Total Workouts</span>
          <strong>{todayWorkouts.length}</strong>
          <small>Completed today</small>
        </div>

        <div className="dashboard-summary-card">
          <div className="dashboard-card-icon"><Flame /></div>
          <span>Calories Burned</span>
          <strong>{totalCalories.toLocaleString()}</strong>
          <small>kcal today</small>
        </div>

        <div className="dashboard-summary-card">
          <div className="dashboard-card-icon"><Clock3 /></div>
          <span>Workout Duration</span>
          <strong>{totalDuration}</strong>
          <small>Minutes today</small>
        </div>

        <div className="dashboard-summary-card">
          <div className="dashboard-card-icon"><TrendingUp /></div>
          <span>Current Streak</span>
          <strong>{streak?.current_streak || 0}</strong>
          <small>Consecutive days</small>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span className="eyebrow">YOUR SCHEDULE</span>
              <h2>Upcoming Workouts</h2>
            </div>
            <button
              className="dashboard-text-button"
              onClick={() => navigate("/workout-plans")}
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          {upcomingPlans.length > 0 ? (
            <div className="dashboard-list">
              {upcomingPlans.slice(0, 4).map((plan) => (
                <div className="dashboard-list-item" key={plan.id}>
                  <div className="dashboard-list-icon">
                    <CalendarDays size={20} />
                  </div>
                  <div className="dashboard-list-info">
                    <strong>{plan.title}</strong>
                    <span>{formatDate(plan.scheduled_date)}</span>
                  </div>
                  <ArrowRight size={17} className="dashboard-item-arrow" />
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <CalendarDays size={28} />
              <p>No upcoming workouts scheduled.</p>
              <button
                className="dashboard-text-button"
                onClick={() => navigate("/workout-plans")}
              >
                Create a plan <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span className="eyebrow">STAY CONSISTENT</span>
              <h2>Streak Status</h2>
            </div>
            <Flame size={23} className="dashboard-highlight-icon" />
          </div>

          <div className="dashboard-streak-content">
            <div className="dashboard-streak-number">
              <Flame size={34} />
              <strong>{streak?.current_streak || 0}</strong>
              <span>Current streak days</span>
            </div>

            <div className="dashboard-streak-best">
              <Trophy size={20} />
              <div>
                <strong>{streak?.longest_streak || 0} days</strong>
                <span>Longest streak</span>
              </div>
            </div>
          </div>

          <button
            className="dashboard-text-button"
            onClick={() => navigate("/streaks")}
          >
            View streak achievements <ArrowRight size={16} />
          </button>
        </section>
      </div>

      <section className="dashboard-panel dashboard-goals-panel">
        <div className="dashboard-panel-heading">
          <div>
            <span className="eyebrow">YOUR FITNESS TARGETS</span>
            <h2>Goal Progress</h2>
          </div>
          <button
            className="dashboard-text-button"
            onClick={() => navigate("/goals")}
          >
            View goals <ArrowRight size={16} />
          </button>
        </div>

        {activeGoals.length > 0 ? (
          <div className="dashboard-goals-grid">
            {activeGoals.slice(0, 4).map((goal) => {
              const percentage = getGoalPercentage(goal);

              return (
                <div className="dashboard-goal-card" key={goal.id}>
                  <div className="dashboard-goal-title">
                    <Target size={19} />
                    <strong>{goal.goal_type}</strong>
                  </div>

                  <div className="dashboard-goal-values">
                    <span>{goal.current_value} / {goal.target_value}</span>
                    <strong>{percentage}%</strong>
                  </div>

                  <div className="dashboard-progress-track">
                    <div
                      className="dashboard-progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <small>Deadline: {formatDate(goal.deadline)}</small>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dashboard-empty">
            <Target size={28} />
            <p>No active fitness goals. Set a target to track your progress.</p>
            <button
              className="dashboard-text-button"
              onClick={() => navigate("/goals")}
            >
              Create a goal <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>

      <section className="dashboard-panel dashboard-achievements-panel">
        <div className="dashboard-panel-heading">
          <div>
            <span className="eyebrow">MILESTONES</span>
            <h2>Recent Achievements</h2>
          </div>
          <button
            className="dashboard-text-button"
            onClick={() => navigate("/badges")}
          >
            All badges <ArrowRight size={16} />
          </button>
        </div>

        {badges.length > 0 ? (
          <div className="dashboard-achievements-list">
            {badges.slice(0, 3).map((item) => (
              <div className="dashboard-achievement-item" key={item.id}>
                <div className="dashboard-list-icon">
                  <Trophy size={20} />
                </div>
                <div>
                  <strong>{item.badge?.name || "Achievement"}</strong>
                  <span>{item.badge?.description || "Milestone unlocked"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty">
            <Activity size={28} />
            <p>Your achievements will appear here as you reach milestones.</p>
          </div>
        )}
      </section>
    </div>
  );
}
