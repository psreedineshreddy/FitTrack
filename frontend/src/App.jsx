import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Progress from "./pages/Progress";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import WorkoutPlans from "./pages/WorkoutPlans";
import Exercises from "./pages/Exercises";
import Streaks from "./pages/Streaks";
import Badges from "./pages/Badges";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/workout-plans" element={<WorkoutPlans />} />
                <Route path="/exercises" element={<Exercises />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/streaks" element={<Streaks />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/badges" element={<Badges />} />
                
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;