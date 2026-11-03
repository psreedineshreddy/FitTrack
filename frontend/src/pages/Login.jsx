import "../styles/auth.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ArrowRight, Eye, EyeOff, LockKeyhole, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Link to="/login" className="brand">
          <span className="brand-icon"><Activity size={23} /></span>
          FITTRACK
        </Link>

        <div className="visual-content">
          <span className="eyebrow">YOUR FITNESS JOURNEY STARTS HERE</span>
          <h1>Build strength.<br />Track progress.<br /><span>Become better.</span></h1>
          <p>
            Your personal space to manage workouts, reach your goals
            and build a healthier lifestyle.
          </p>

          <div className="visual-stats">
            <div><strong>01</strong><span>Track workouts</span></div>
            <div><strong>02</strong><span>Set goals</span></div>
            <div><strong>03</strong><span>See progress</span></div>
          </div>
        </div>

        <p className="visual-footer">CONSISTENCY IS THE KEY TO PROGRESS.</p>
      </section>

      <section className="auth-form-section">
        <div className="auth-card">
          <div className="mobile-brand">
            <Activity size={24} /> FITTRACK
          </div>

          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to your account</h2>
          <p className="auth-description">
            Continue your fitness journey. Your progress is waiting.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <User size={18} />
              <input
                id="username"
                className="form-input"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <LockKeyhole size={18} />
              <input
                id="password"
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              className="primary-button auth-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign in"}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>

          <p className="auth-security">Your fitness data is private and secure.</p>
        </div>
      </section>
    </main>
  );
}
