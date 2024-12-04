import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";

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
    <div className="max-w-4xl mx-auto p-6 bg-gray-100">
      <div className="bg-white p-6 shadow-md rounded-lg">
        <div className="text-2xl font-bold text-blue-700 mb-6">Notification Center</div>

        {loading ? (
          <p className="text-center">Loading notifications...</p>
        ) : selectedNotification ? (
          <div className="p-6 bg-white border border-gray-300 rounded-lg">
            <h4 className="text-lg font-semibold">Notification Details</h4>
            <p><strong>Dear {selectedNotification.patientName},</strong></p>
            <p>This is a confirmation message for your appointment with <strong>Dr. {selectedNotification.doctorName}</strong></p>
            <p>Appointment Date: <strong>{selectedNotification.appointmentDate}</strong></p>
            <p>Visiting Time: <strong>{selectedNotification.visitingTime}</strong></p>
            <p>Appointment Number: <strong>{selectedNotification.appointmentNumber}</strong></p>
            <button
              className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
              onClick={handleBackToNotifications}
            >
              Back to Notifications
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-semibold text-blue-700">Notifications</h4>
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                Total Notifications: {totalCount}
              </span>
            </div>

            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 bg-white rounded-lg shadow-md cursor-pointer transition ${notification.unread ? "bg-blue-50" : "bg-white"}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p className="text-gray-800">
                    Dear {notification.patientName}, this is a confirmation message for your appointment with Dr. {notification.doctorName} on {notification.appointmentDate} at {notification.visitingTime}. Your appointment number is {notification.appointmentNumber}.
                  </p>
                  {notification.unread && (
                    <span className="bg-blue-500 text-white text-xs py-1 px-2 rounded-full absolute top-2 right-2">
                      Unread
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-700 text-white text-center p-4 rounded-lg">
        <p>mediconnect@gmail.com</p>
        <p>+94 1234567878 / +94 9876757423</p>
      </div>
    </div>
  );
};

export default Notification;
