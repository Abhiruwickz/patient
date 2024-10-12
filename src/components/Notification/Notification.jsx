import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, updateDoc, doc } from "firebase/firestore"; 
import { useNavigate } from "react-router-dom"; 
import { db } from "../../firebaseConfig"; 
import "./Notification.css";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null); 
  const [isUnreadTab, setIsUnreadTab] = useState(true); // State for tab switching
  const navigate = useNavigate(); 

  // Fetch notifications function
  const fetchNotifications = async () => {
    setLoading(true); // Show loading state
    try {
      const notificationsCollection = collection(db, "Notifications");
      const notificationsQuery = query(
        notificationsCollection,
        orderBy("createdAt", "desc")
      ); 
      const notificationsSnapshot = await getDocs(notificationsQuery);

      const notificationsData = notificationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification); 
    // Mark notification as read in Firestore
    try {
      await updateDoc(doc(db, "Notifications", notification.id), {
        unread: false, // Set unread to false
      });
      // Refresh notifications to update state
      fetchNotifications(); // Re-fetch notifications after updating
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const handleBackToNotifications = () => {
    setSelectedNotification(null); 
  };

  const handleTabClick = (tab) => {
    setIsUnreadTab(tab === "unread"); // Update tab based on selection
  };

  // Calculate the unread notifications count
  const unreadCount = notifications.filter(notification => notification.unread).length;

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
                  {isUnreadTab ? unreadCount : notifications.length}
                </span>{" "}
                {/* Show the count of unread or all notifications based on tab */}
              </div>
            </div>

            <div className="tabs">
              <button
                className={`tab ${isUnreadTab ? "active" : ""}`}
                onClick={() => handleTabClick("unread")}
              >
                Unread
              </button>
              <button
                className={`tab ${!isUnreadTab ? "active" : ""}`}
                onClick={() => handleTabClick("all")}
              >
                All
              </button>
            </div>

            <div className="notification-list">
              {notifications
                .filter(notification => 
                  isUnreadTab ? notification.unread : true // Show unread or all based on tab
                )
                .map((notification) => (
                  <div
                    key={notification.id}
                    className="notification-item"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p>
                      Dear {notification.patientName}, this is a confirmation
                      message for your appointment with Dr. {notification.doctorName} on{" "}
                      {notification.appointmentDate} at {notification.visitingTime}. Your
                      appointment number is {notification.appointmentNumber}.
                    </p>
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
