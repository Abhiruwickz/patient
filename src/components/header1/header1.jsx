import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './header1.css';
import logo1 from '../assets/logomedi.png';
import noicon from '../assets/pngkey.com-bell-icon-png-1120149.png';
import user from '../assets/circle-icon-16059.png';

const Header = () => {
  const navigate = useNavigate(); // Initialize navigate for navigation

  const handleNotificationClick = () => {
    navigate('/notifications'); // Navigate to the notification page
  };

  const handleUserClick = () => {
    navigate('/profile'); // Navigate to the profile page
  };

  return (
    <header className="header1"> {/* Changed class name to header1 */}
      <div className="logo">
        <img src={logo1} alt="MediConnect" /> 
      </div>
      <div className="header-icons">
        <div className="notification-icon" onClick={handleNotificationClick}>
          <img src={noicon} alt="Notification" />
        </div>
        <div className="user-icon" onClick={handleUserClick}>
          <img src={user} alt="User" />
        </div>
      </div>
    </header>
  );
};

export default Header;
