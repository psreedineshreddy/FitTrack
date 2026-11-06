import { useEffect, useState } from "react";
import {
  Activity,
  Flame,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock3,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import api from "../services/api";
import "../styles/application.css";

export default function Progress() {
  const [progress, setProgress] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0]
  );
  const [period, setPeriod] = useState("weekly");
  const [metric, setMetric] = useState("workouts");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparisonLoading, setComparisonLoading] = useState(true);
  const [error, setError] = useState("");
  const [comparisonError, setComparisonError] = useState("");

  const loadProgress = async (date) => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/progress/daily", {
        params: { selected_date: date },
      });
      setProgress(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load daily progress.");
    } finally {
      setLoading(false);
    }
  };

  const loadComparison = async (selectedPeriod) => {
    try {
      setComparisonLoading(true);
      setComparisonError("");
      setComparison(null);

      const endpoint =
        selectedPeriod === "weekly"
          ? "/api/progress/weekly-comparison"
          : "/api/progress/monthly-comparison";

      const response = await api.get(endpoint);
      setComparison(response.data);
    } catch (err) {
      setComparisonError(
        err.response?.data?.detail || "Unable to load progress comparison."
      );
    } finally {
      setComparisonLoading(false);
    }
  };

  useEffect(() => {
    loadProgress(selectedDate);
  }, []);

  useEffect(() => {
    loadComparison(period);
  }, [period]);

  const handleTrackProgress = () => {
    if (selectedDate) loadProgress(selectedDate);
  };

  const formattedDate = progress?.date
    ? new Date(`${progress.date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const current = comparison?.current_period;
  const previous = comparison?.previous_period;
  const changes = comparison?.percentage_changes;

  const chartData = comparison?.chart_data?.map((item) => ({
    ...item,
    current_value:
      metric === "workouts"
        ? item.current_workouts
        : metric === "calories"
        ? item.current_calories
        : item.current_duration,
    previous_value:
      metric === "workouts"
        ? item.previous_workouts
        : metric === "calories"
        ? item.previous_calories
        : item.previous_duration,
  })) || [];

  const metricLabel =
    metric === "workouts"
      ? "Workouts"
      : metric === "calories"
      ? "Calories"
      : "Duration (minutes)";

  const metricChange =
    metric === "workouts"
      ? changes?.total_workouts
      : metric === "calories"
      ? changes?.total_calories
      : changes?.total_duration;

  const InsightIcon =
    metricChange > 0
      ? TrendingUp
      : metricChange < 0
      ? TrendingDown
      : Minus;

  const insightText =
    metricChange > 0
      ? `${metricLabel} increased by ${metricChange}% compared with the previous period.`
      : metricChange < 0
      ? `${metricLabel} decreased by ${Math.abs(metricChange)}% compared with the previous period.`
      : `${metricLabel} remained unchanged compared with the previous period.`;

  return (
    <main className="progress-page">
      <header className="progress-heading">
        <div>
          <span className="eyebrow">YOUR FITNESS ACTIVITY</span>
          <h1>Daily Progress</h1>
          <p>Track your daily activity and compare your fitness improvements.</p>
        </div>
      </header>

      <section className="progress-date-filter">
        <div>
          <label htmlFor="progress-date">Select Progress Date</label>
          <input
            id="progress-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <button
          className="primary-button"
          onClick={handleTrackProgress}
          disabled={!selectedDate || loading}
        >
          {loading ? "Loading..." : "Track Progress"}
        </button>
      </section>

      {error ? (
        <p className="form-error">{error}</p>
      ) : loading ? (
        <div className="loading-screen">Loading daily progress...</div>
      ) : (
        <section className="progress-cards">
          <article className="progress-card">
            <div className="progress-card-icon"><Activity size={22} /></div>
            <span className="progress-card-label">Total Workouts</span>
            <h2>{progress?.total_workouts ?? 0}</h2>
            <p className="progress-card-description">
              Workouts completed on this date
            </p>
          </article>

          <article className="progress-card">
            <div className="progress-card-icon"><Flame size={22} /></div>
            <span className="progress-card-label">Calories Burned</span>
            <h2>{progress?.total_calories ?? 0}</h2>
            <p className="progress-card-description">
              Calories burned on this date
            </p>
          </article>

          <article className="progress-card">
            <div className="progress-card-icon"><CalendarDays size={22} /></div>
            <span className="progress-card-label">Progress Date</span>
            <h2>{formattedDate}</h2>
            <p className="progress-card-description">
              Selected daily activity summary
            </p>
          </article>
        </section>
      )}

      <section className="comparison-section">
        <div className="comparison-heading">
          <div>
            <h2>Progress Comparison</h2>
            <p>See how your fitness performance changes over time.</p>
          </div>
          <div className="comparison-icon"><BarChart3 size={23} /></div>
        </div>

        <div className="comparison-toolbar">
          <div className="comparison-period">
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

          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            aria-label="Select comparison metric"
          >
            <option value="workouts">Workouts</option>
            <option value="calories">Calories Burned</option>
            <option value="duration">Duration</option>
          </select>
        </div>

        {comparisonError ? (
          <p className="form-error">{comparisonError}</p>
        ) : comparisonLoading ? (
          <div className="loading-screen">Loading comparison...</div>
        ) : comparison ? (
          <>
            <div className="comparison-stats">
              <article className="comparison-stat-card">
                <span>Current {period === "weekly" ? "Week" : "Month"}</span>
                <h3>
                  {metric === "workouts"
                    ? current?.total_workouts
                    : metric === "calories"
                    ? current?.total_calories
                    : current?.total_duration}
                </h3>
                <p>{metricLabel}</p>
              </article>

              <article className="comparison-stat-card">
                <span>Previous {period === "weekly" ? "Week" : "Month"}</span>
                <h3>
                  {metric === "workouts"
                    ? previous?.total_workouts
                    : metric === "calories"
                    ? previous?.total_calories
                    : previous?.total_duration}
                </h3>
                <p>{metricLabel}</p>
              </article>

              <article className="comparison-stat-card">
                <span>Performance Change</span>
                <h3 className={metricChange > 0 ? "positive-change" : metricChange < 0 ? "negative-change" : ""}>
                  {metricChange > 0 ? "+" : ""}{metricChange ?? 0}%
                </h3>
                <p>Compared with previous period</p>
              </article>
            </div>

            <div className="comparison-chart-card">
              <div className="comparison-chart-heading">
                <div>
                  <h3>{metricLabel} Trend</h3>
                  <p>Current period compared with previous period</p>
                </div>
              </div>

              <div className="comparison-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="current_value"
                      name="Current Period"
                      fill="#a3e635"
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="previous_value"
                      name="Previous Period"
                      fill="#64748b"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="progress-insight">
              <div className="insight-icon"><InsightIcon size={22} /></div>
              <div>
                <h3>Progress Insight</h3>
                <p>{insightText}</p>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
