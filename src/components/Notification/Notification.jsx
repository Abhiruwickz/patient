import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, where, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";
import "./Notification.css";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const navigate = useNavigate();

  // Set up a real-time listener for notifications
  useEffect(() => {
    const notificationsCollection = collection(db, "Notifications");

    // Get the current date and calculate the date 24 hours ago
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Query to fetch only the notifications from the last 24 hours
    const notificationsQuery = query(
      notificationsCollection,
      orderBy("createdAt", "desc"),
      where("createdAt", ">=", oneDayAgo)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notificationsData);
      setLoading(false); // Stop loading once data is fetched
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    // Mark notification as read in Firestore
    try {
      await updateDoc(doc(db, "Notifications", notification.id), {
        unread: false, // Set unread to false
      });

      // Update the notifications state to reflect this change
      setNotifications((prevNotifications) =>
        prevNotifications.map((not) =>
          not.id === notification.id ? { ...not, unread: false } : not
        )
      );
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const handleBackToNotifications = () => {
    setSelectedNotification(null);
  };

  // Calculate the total notifications count
  const totalCount = notifications.length;

  return (
    <div className="container">
      <div className="notification-center">
        <div className="notification-header">Notification Center</div>

        {loading ? (
          <p>Loading notifications...</p>
        ) : selectedNotification ? (
          <div className="selected-notification">
            <h4>Notification Details</h4>
            <p>
              <strong>Dear {selectedNotification.patientName},</strong>
            </p>
            <p>
              This is a confirmation message for your appointment with{" "}
              <strong>Dr. {selectedNotification.doctorName}</strong>
            </p>
            <p>
              Appointment Date:{" "}
              <strong>{selectedNotification.appointmentDate}</strong>
            </p>
            <p>
              Visiting Time: <strong>{selectedNotification.visitingTime}</strong>
            </p>
            <p>
              Appointment Number:{" "}
              <strong>{selectedNotification.appointmentNumber}</strong>
            </p>
            <button
              className="back-button"
              onClick={handleBackToNotifications}
            >
              Back to Notifications
            </button>
          </div>
        ) : (
          <div className="notifications-pane">
            <div className="notifications-header">
              <div className="header-left">
                <h4>Notifications</h4>
                <span className="badge">
                  Total Notifications: {totalCount}
                </span>
              </div>
            </div>

            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.unread ? "unread-highlight" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p>
                    Dear {notification.patientName}, this is a confirmation
                    message for your appointment with Dr. {notification.doctorName} on{" "}
                    {notification.appointmentDate} at {notification.visitingTime}. Your
                    appointment number is {notification.appointmentNumber}.
                  </p>
                  {notification.unread && (
                    <span className="unread-badge">Unread</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="footer">
        <p>mediconnect@gmail.com</p>
        <p>+94 1234567878 / +94 9876757423</p>
      </div>
    </div>
  );
};

export default Notification;
