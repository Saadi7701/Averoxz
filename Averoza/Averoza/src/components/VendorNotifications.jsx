import React from "react";
import useNotifications from "../hooks/useNotifications";

const VendorNotifications = () => {
  const token = localStorage.getItem("token");
  const { notifications, loading } = useNotifications(token);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">🔔 Vendor Notifications</h1>

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications to show.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((note) => (
            <li
              key={note._id}
              className={`p-4 border rounded shadow-sm ${
                note.isRead ? "bg-white" : "bg-yellow-100"
              }`}
            >
              {note.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VendorNotifications;
