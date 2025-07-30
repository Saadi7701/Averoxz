import { useEffect, useState } from "react";
import axios from "axios";

const useNotifications = (token) => {
  const [notifications, setNotifications] = useState([]); // ✅ Always start as array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/notifications/vendor", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;

        // ✅ Handle both array or wrapped object
        if (Array.isArray(data)) {
          setNotifications(data);
        } else if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        } else {
          setNotifications([]); // fallback
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchNotifications();
  }, [token]);

  return { notifications, loading };
};

export default useNotifications;
