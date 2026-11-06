
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  Target,
  BarChart3,
  LogOut,
  CalendarDays,
  BookOpen,
  Flame,
  Award,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Notifications from "./Notifications";

export default function MainLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/workouts", label: "Workouts", icon: Dumbbell },
    { to: "/workout-plans", label: "Workout Plans", icon: CalendarDays },
    { to: "/exercises", label: "Exercise Library", icon: BookOpen },
    { to: "/progress", label: "Progress", icon: TrendingUp },
    { to: "/goals", label: "Goals", icon: Target },
    { to: "/streaks", label: "Streaks", icon: Flame },
    { to: "/badges", label: "Achievements", icon: Award },
    { to: "/reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <div className="fittrack-layout">
      <header className="fittrack-topbar">
        <div className="brand">
          <span className="brand-icon">
            <Activity size={25} />
          </span>
          FITTRACK
        </div>

        <div className="fittrack-topbar-actions">
          <Notifications />

          <button className="secondary-button" onClick={handleLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      <div className="fittrack-body">
        <aside className="fittrack-sidebar">
          <div className="sidebar-label">MAIN MENU</div>

          <nav>
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/dashboard"}
                className={({ isActive }) =>
                  `fittrack-sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="fittrack-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
