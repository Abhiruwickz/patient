import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import { auth } from '../../../firebaseConfig'; // Import Firebase Auth
import './navbar.css';
import logo1 from '../../assets/logomedi.png';
import noicon from '../../assets/pngkey.com-bell-icon-png-1120149.png';
import userIcon from '../../assets/circle-icon-16059.png';

const Navbar = () => {
  const [userEmail, setUserEmail] = useState(null); // State to store user email
  const navigate = useNavigate(); // Initialize navigate for navigation

  useEffect(() => {
    // Get the currently logged-in user from Firebase Auth
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserEmail(currentUser.email); // Set the email of the logged-in user
    }
  }, []);

  const handleNotificationClick = () => {
    navigate('/notifications'); // Navigate to the notification page
  };

  const handleUserClick = () => {
    navigate('/profile'); // Navigate to the profile page
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logo1} alt="MediConnect" className="logo" />
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link> {/* Link to Home page */}
        <Link to="/doctors">Meet Your Doctor</Link> {/* Link to Doctor page */}
        <Link to="/about">About Us</Link> {/* Link to About page */}
        <Link to="/map">Contact Us</Link> {/* Link to Contact/Map page */}
      </div>
      
      <div className="noti-icon" onClick={handleNotificationClick}>
        <img src={noicon} alt="Notification" />
      </div>
      <div className="us-icon" onClick={handleUserClick}>
        <img src={userIcon} alt="User" />
      </div>
      
      <div className="navbar-buttons">
        {userEmail ? (
          <span className="welcome-text">Hi {userEmail}</span> // Display the logged-in user's email
        ) : (
          <Link to="/login">
            <button className="login-btn">Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
