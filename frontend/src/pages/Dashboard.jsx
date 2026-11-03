import { useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-placeholder">
      <section>
        <span className="eyebrow">YOUR FITNESS OVERVIEW</span>

        <h1 className="page-title">
          Welcome back, {user?.username || "Athlete"}!
        </h1>

        <p className="muted">
          Your fitness journey continues. Let's make today count.
        </p>

        <button
          className="primary-button"
          onClick={() => navigate("/workouts")}
        >
          <Dumbbell size={18} />
          Manage Workouts
        </button>
      </section>
    </div>
  );
}