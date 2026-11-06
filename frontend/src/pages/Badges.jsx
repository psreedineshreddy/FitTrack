
import { useEffect, useState } from "react";
import {
  Dumbbell,
  Award,
  Trophy,
  Flame,
  Crown,
  Target,
  Lock,
  Sparkles,
} from "lucide-react";
import api from "../services/api";

const iconMap = {
  Dumbbell,
  Award,
  Trophy,
  Flame,
  Crown,
  Target,
};

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [allResponse, earnedResponse] = await Promise.all([
          api.get("/api/badges/"),
          api.get("/api/badges/my"),
        ]);

        setBadges(allResponse.data);
        setEarnedBadges(earnedResponse.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load achievement badges."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const earnedIds = new Set(
    earnedBadges.map((item) => item.badge_id)
  );

  const earnedCount = earnedBadges.length;

  if (loading) {
    return <div className="loading-state">Loading achievements...</div>;
  }

  return (
    <div className="badges-page">
      <div className="badges-heading">
        <div>
          <span className="section-eyebrow">RECOGNITION & REWARDS</span>
          <h1>Achievement Badges</h1>
          <p>Celebrate every milestone in your fitness journey.</p>
        </div>

        <div className="badge-count-card">
          <Award size={25} />
          <div>
            <strong>{earnedCount} / {badges.length}</strong>
            <span>Badges earned</span>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="badges-summary">
        <div>
          <Sparkles size={22} />
          <span>
            You've unlocked <strong>{earnedCount}</strong> achievements.
            Keep training to collect more!
          </span>
        </div>
      </div>

      <div className="badges-grid">
        {badges.map((badge) => {
          const earned = earnedIds.has(badge.id);
          const Icon = iconMap[badge.icon] || Award;

          return (
            <div
              className={`achievement-card ${earned ? "earned" : "locked"}`}
              key={badge.id}
            >
              <div className="achievement-icon">
                {earned ? <Icon size={34} /> : <Lock size={30} />}
              </div>

              <div className="achievement-details">
                <span className="achievement-status">
                  {earned ? "UNLOCKED" : "LOCKED"}
                </span>
                <h3>{badge.name}</h3>
                <p>{badge.description}</p>
              </div>

              {earned && (
                <div className="earned-label">
                  <Award size={15} />
                  Earned
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!badges.length && (
        <div className="empty-state">
          No achievement badges are available yet.
        </div>
      )}
    </div>
  );
}

