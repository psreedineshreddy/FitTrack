
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import api from "../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/notifications/");
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkDueReminders = async () => {
    try {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      const weekday = now.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const response = await api.post("/api/reminders/check-due", null, {
        params: {
          current_time: currentTime,
          weekday,
        },
      });

      if (response.data.due_reminders?.length > 0) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to check reminders:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    checkDueReminders();

    const interval = setInterval(() => {
      checkDueReminders();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="notification-container">
      <button
        className="notification-bell"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        aria-label="Notifications"
      >
        <Bell size={21} />
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button onClick={fetchNotifications}>Refresh</button>
          </div>

          {loading ? (
            <p className="notification-empty">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="notification-empty">No notifications yet.</p>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.is_read ? "read" : "unread"
                  }`}
                >
                  <div className="notification-content">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <small>
                      {new Date(notification.created_at).toLocaleString()}
                    </small>
                  </div>

                  {!notification.is_read && (
                    <button
                      className="notification-read-button"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
