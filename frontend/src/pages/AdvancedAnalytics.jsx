
import { useEffect, useState } from "react";
import {
  Activity,
  Target,
  Flame,
  CalendarCheck,
  TrendingUp,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import api from "../services/api";

export default function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/advanced-analytics/");
      setAnalytics(response.data);
    } catch (err) {
      console.error("Analytics error:", err);
      setError("Unable to load advanced analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="advanced-analytics-page">Loading analytics...</div>;
  }

  if (error || !analytics) {
    return (
      <div className="advanced-analytics-page">
        <p className="analytics-error">{error || "No analytics available."}</p>
        <button className="analytics-refresh-btn" onClick={fetchAnalytics}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const chartData =
    period === "weekly"
      ? analytics.weekly_trend
      : analytics.monthly_trend;

  const goal = analytics.goal_completion;
  const consistency = analytics.consistency;

  const formatLabel = (value) =>
    period === "weekly"
      ? new Date(`${value}T00:00:00`).toLocaleDateString("en", {
          weekday: "short",
        })
      : value;

  return (
    <div className="advanced-analytics-page">
      <div className="analytics-header">
        <div>
          <span className="analytics-eyebrow">PERFORMANCE OVERVIEW</span>
          <h1>Advanced Analytics</h1>
          <p>Understand your fitness progress and consistency.</p>
        </div>

        <button className="analytics-refresh-btn" onClick={fetchAnalytics}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="analytics-stats-grid">
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <Target size={21} />
          </div>
          <span>Goal Completion</span>
          <strong>{goal.completion_rate}%</strong>
          <small>{goal.completed_goals} of {goal.total_goals} goals completed</small>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <CalendarCheck size={21} />
          </div>
          <span>Workout Consistency</span>
          <strong>{consistency.consistency_rate}%</strong>
          <small>{consistency.active_days} active days in 30 days</small>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <Activity size={21} />
          </div>
          <span>Total Workouts</span>
          <strong>{consistency.total_workouts}</strong>
          <small>During the last 30 days</small>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <Flame size={21} />
          </div>
          <span>Active Days</span>
          <strong>{consistency.active_days}/30</strong>
          <small>Days with recorded workouts</small>
        </div>
      </div>

      <div className="analytics-chart-card">
        <div className="analytics-section-header">
          <div>
            <h2>Performance Trends</h2>
            <p>Compare your workout activity over time.</p>
          </div>

          <div className="analytics-period-toggle">
            <button
              className={period === "weekly" ? "active" : ""}
              onClick={() => setPeriod("weekly")}
            >
              Weekly
            </button>
            <button
              className={period === "monthly" ? "active" : ""}
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="analytics-chart-heading">
          <BarChart3 size={18} />
          <span>Workouts completed</span>
        </div>

        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#29372d" />
              <XAxis
                dataKey={period === "weekly" ? "date" : "month"}
                tickFormatter={formatLabel}
                stroke="#89978c"
                tick={{ fill: "#aeb9b0", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                stroke="#89978c"
                tick={{ fill: "#aeb9b0", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#18231b",
                  border: "1px solid #344536",
                  borderRadius: "10px",
                  color: "#fff",
                }}
                labelFormatter={formatLabel}
              />
              <Bar
                dataKey="workouts"
                name="Workouts"
                fill="#b6ed75"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-chart-heading calories-heading">
          <Flame size={18} />
          <span>Calories burned</span>
        </div>

        <div className="analytics-chart calories-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#29372d" />
              <XAxis
                dataKey={period === "weekly" ? "date" : "month"}
                tickFormatter={formatLabel}
                stroke="#89978c"
                tick={{ fill: "#aeb9b0", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                stroke="#89978c"
                tick={{ fill: "#aeb9b0", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#18231b",
                  border: "1px solid #344536",
                  borderRadius: "10px",
                  color: "#fff",
                }}
                labelFormatter={formatLabel}
              />
              <Line
                type="monotone"
                dataKey="calories"
                name="Calories"
                stroke="#b6ed75"
                strokeWidth={3}
                dot={{ fill: "#b6ed75", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-bottom-grid">
        <div className="analytics-goal-card">
          <h2>Goal Achievement</h2>
          <p>Your overall goal completion rate</p>

          <div className="analytics-progress-track">
            <div
              className="analytics-progress-fill"
              style={{ width: `${goal.completion_rate}%` }}
            />
          </div>

          <div className="analytics-progress-labels">
            <strong>{goal.completion_rate}% completed</strong>
            <span>{goal.total_goals - goal.completed_goals} remaining</span>
          </div>
        </div>

        <div className="analytics-insights-card">
          <div className="analytics-insights-title">
            <TrendingUp size={20} />
            <h2>Performance Insights</h2>
          </div>

          {analytics.insights.map((insight, index) => (
            <div className="analytics-insight-item" key={index}>
              <span className="analytics-insight-dot" />
              <p>{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

