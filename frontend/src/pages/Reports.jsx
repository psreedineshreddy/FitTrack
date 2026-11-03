import { useEffect, useState } from "react";
import {
  Activity,
  Flame,
  Clock3,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import api from "../services/api";
import "../styles/application.css";

const getToday = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

export default function Reports() {
  const [period, setPeriod] = useState("weekly");
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedMonth, setSelectedMonth] = useState(
    getToday().slice(0, 7)
  );
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError("");

        let response;

        if (period === "weekly") {
          response = await api.get("/api/reports/weekly", {
            params: { selected_date: selectedDate },
          });
        } else {
          response = await api.get("/api/reports/monthly", {
            params: { selected_month: `${selectedMonth}-01` },
          });
        }

        setReport(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load reports."
        );
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    if (
      (period === "weekly" && selectedDate) ||
      (period === "monthly" && selectedMonth)
    ) {
      loadReport();
    }
  }, [period, selectedDate, selectedMonth]);

  const chartData =
    period === "weekly"
      ? Object.values(
          (report?.workouts || []).reduce((acc, item) => {
            const date = item.date;

            if (!acc[date]) {
              acc[date] = {
                date: new Date(`${date}T00:00:00`).toLocaleDateString(
                  "en-IN",
                  { day: "2-digit", month: "short" }
                ),
                calories: 0,
              };
            }

            acc[date].calories += item.calories_burned;
            return acc;
          }, {})
        )
      : (report?.daily_summary || []).map((item) => ({
          date: new Date(`${item.date}T00:00:00`).toLocaleDateString(
            "en-IN",
            { day: "2-digit", month: "short" }
          ),
          calories: item.total_calories,
        }));

  return (
    <main className="workouts-page">
      <header className="workouts-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="muted">
            Review your workout activity and fitness progress.
          </p>
        </div>
      </header>

      <div className="report-controls">
        <button
          className={period === "weekly" ? "active" : ""}
          onClick={() => setPeriod("weekly")}
        >
          Weekly Report
        </button>

        <button
          className={period === "monthly" ? "active" : ""}
          onClick={() => setPeriod("monthly")}
        >
          Monthly Report
        </button>
      </div>

      <section className="report-date-filter">
        {period === "weekly" ? (
          <div>
            <label htmlFor="weekly-date">Select a date to view its week</label>
            <input
              id="weekly-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="monthly-date">Select month and year</label>
            <input
              id="monthly-date"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        )}

        {report && (
          <p className="report-period-label">
            {new Date(`${report.start_date}T00:00:00`).toLocaleDateString(
              "en-IN",
              { day: "2-digit", month: "short", year: "numeric" }
            )}
            {" – "}
            {new Date(`${report.end_date}T00:00:00`).toLocaleDateString(
              "en-IN",
              { day: "2-digit", month: "short", year: "numeric" }
            )}
          </p>
        )}
      </section>

      {loading ? (
        <div className="loading-screen">Loading report...</div>
      ) : error ? (
        <div className="loading-screen">{error}</div>
      ) : (
        <>
          <section className="report-stats">
            <article className="report-stat-card">
              <Activity size={23} />
              <span>Total Workouts</span>
              <h2>{report?.total_workouts ?? 0}</h2>
            </article>

            <article className="report-stat-card">
              <Flame size={23} />
              <span>Calories Burned</span>
              <h2>{report?.total_calories ?? 0}</h2>
            </article>

            <article className="report-stat-card">
              <Clock3 size={23} />
              <span>Total Duration</span>
              <h2>{report?.total_duration ?? 0} min</h2>
            </article>
          </section>

          <section className="report-chart-section">
            <h2>
              <BarChart3 size={21} />
              Calories Tracking
            </h2>

            {chartData.length === 0 ? (
              <p className="muted">
                No workout data available for this period.
              </p>
            ) : (
              <div className="report-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 15, right: 20, left: 5, bottom: 5 }}
                    barCategoryGap="55%"
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#303a30"
                      strokeDasharray="4 4"
                    />

                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#999f96", fontSize: 12 }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#999f96", fontSize: 12 }}
                    />

                    <Tooltip
                      cursor={{ fill: "rgba(168, 217, 87, 0.08)" }}
                      contentStyle={{
                        background: "#202820",
                        border: "1px solid #394536",
                        borderRadius: "10px",
                        color: "#ffffff",
                      }}
                    />

                    <Bar
                      dataKey="calories"
                      name="Calories Burned"
                      fill="#a8d957"
                      barSize={48}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
