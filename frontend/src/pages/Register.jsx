import "../styles/auth.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";


export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(form);
      await login(form.username, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Link to="/register" className="brand">
          <span className="brand-icon"><Activity size={23} /></span>
          FITTRACK
        </Link>

        <div className="visual-content">
          <span className="eyebrow">START STRONG. STAY CONSISTENT.</span>
          <h1>Your goals.<br />Your journey.<br /><span>Your progress.</span></h1>
          <p>
            Create your account and take control of your workouts,
            fitness goals and daily progress.
          </p>

          <div className="visual-stats">
            <div><strong>01</strong><span>Create your plan</span></div>
            <div><strong>02</strong><span>Track every workout</span></div>
            <div><strong>03</strong><span>Celebrate progress</span></div>
          </div>
        </div>

        <p className="visual-footer">EVERY REP TAKES YOU FORWARD.</p>
      </section>

      <section className="auth-form-section">
        <div className="auth-card">
          <div className="mobile-brand">
            <Activity size={24} /> FITTRACK
          </div>

          <span className="eyebrow">GET STARTED</span>
          <h2>Create your account</h2>
          <p className="auth-description">
            Join FitTrack and start building healthier habits.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <User size={18} />
              <input
                id="username"
                name="username"
                className="form-input"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                minLength={3}
                maxLength={50}
                required
              />
            </div>

            <label htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                id="email"
                name="email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <LockKeyhole size={18} />
              <input
                id="password"
                name="password"
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                minLength={8}
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
              {submitting ? "Creating account..." : "Create account"}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <p className="auth-security">
            Your fitness data is private and secure.
          </p>
        </div>
      </section>
    </main>
  );
}
