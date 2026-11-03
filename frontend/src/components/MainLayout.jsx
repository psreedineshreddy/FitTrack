import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  Target,
  BarChart3,
  LogOut,
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

  return (
    <>
      <div className="dashboard-placeholder app-header-shell">
        <header>
          <div className="brand">
            <span className="brand-icon">
              <Activity size={23} />
            </span>
            FITTRACK
          </div>

          <nav>
            <NavLink to="/dashboard">
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>

            <NavLink to="/workouts">
              <Dumbbell size={18} />
              Workouts
            </NavLink>

            <NavLink to="/progress">
              <TrendingUp size={18} />
              Progress
            </NavLink>

            <NavLink to="/goals">
              <Target size={18} />
              Goals
            </NavLink>

            <NavLink to="/reports">
              <BarChart3 size={18} />
              Reports
            </NavLink>
          </nav>

          <div className="dashboard-header-actions">
            <Notifications />

            <button className="secondary-button" onClick={handleLogout}>
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>
      </div>

      <Outlet />
    </>
  );
}
