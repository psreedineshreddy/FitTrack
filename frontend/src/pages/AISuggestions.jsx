import { useEffect, useState } from "react";
import {
  Sparkles,
  Dumbbell,
  Clock,
  Target,
  RefreshCw,
  Activity
} from "lucide-react";
import api from "../services/api";

export default function AISuggestions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/ai-suggestions/");
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load workout suggestions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  if (loading) {
    return <div className="ai-page"><p>Generating your workout suggestions...</p></div>;
  }

  return (
    <div className="ai-page">
      <div className="ai-header">
        <div>
          <span className="ai-eyebrow">
            <Sparkles size={16} /> SMART FITNESS
          </span>
          <h1>AI Workout Suggestions</h1>
          <p>Personalized workout ideas based on your goals and recent activity.</p>
        </div>

        <button className="ai-refresh-btn" onClick={loadSuggestions}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      {error && <div className="ai-error">{error}</div>}

      {data && (
        <>
          <div className="ai-overview-grid">
            <div className="ai-overview-card">
              <Target size={22} />
              <span>YOUR FITNESS FOCUS</span>
              <h2>{data.goal_focus}</h2>
            </div>

            <div className="ai-overview-card">
              <Activity size={22} />
              <span>WORKOUTS THIS WEEK</span>
              <h2>{data.workouts_this_week}</h2>
            </div>

            <div className="ai-overview-card">
              <Dumbbell size={22} />
              <span>RECOMMENDATIONS</span>
              <h2>{data.suggestions.length}</h2>
            </div>
          </div>

          <section className="ai-section">
            <div className="ai-section-heading">
              <div>
                <span className="ai-eyebrow">YOUR PERSONAL PLAN</span>
                <h2>Recommended Workouts</h2>
              </div>
              <Sparkles size={23} />
            </div>

            {data.suggestions.length === 0 ? (
              <div className="ai-empty">
                <Dumbbell size={35} />
                <h3>No exercises available yet</h3>
                <p>Add exercises to your Exercise Library to receive recommendations.</p>
              </div>
            ) : (
              <div className="ai-suggestions-grid">
                {data.suggestions.map((item) => (
                  <article className="ai-suggestion-card" key={item.exercise_id}>
                    <div className="ai-card-top">
                      <span className="ai-category">{item.category}</span>
                      <Sparkles size={19} />
                    </div>

                    <h3>{item.name}</h3>
                    <p>{item.description || "A useful addition to your workout routine."}</p>

                    <div className="ai-duration">
                      <Clock size={16} />
                      {item.duration} minutes
                    </div>

                    <div className="ai-reason">
                      <strong>Why this workout?</strong>
                      <p>{item.reason}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="ai-insight">
            <Sparkles size={20} />
            <p>{data.message}</p>
          </div>
        </>
      )}
    </div>
  );
}

