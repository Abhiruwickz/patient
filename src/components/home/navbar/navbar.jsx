import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../../firebaseConfig';
import logo1 from '../../assets/logomedi.png';
import noicon from '../../assets/pngkey.com-bell-icon-png-1120149.png';
import userIcon from '../../assets/circle-icon-16059.png';

const Navbar = () => {
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserEmail(currentUser.email);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUserEmail(null);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleUserClick = () => {
    navigate('/profile');
  };

  return (
    <nav className="absolute top-0 left-0 w-full bg-blue-600 text-white flex items-center justify-between px-3 py-4 shadow-lg ">
      {/* Logo */}
      <div className="flex items-center">
        <img src={logo1} alt="MediConnect" className="h-10 mr-4" />
        <span className="font-bold text-lg">MediConnect</span>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-6">
        <Link to="/" className="hover:text-gray-200">
          Home
        </Link>
        <Link to="/doctors" className="hover:text-gray-200">
          Meet Your Doctor
        </Link>
        <Link to="/about" className="hover:text-gray-200">
          About Us
        </Link>
        <Link to="/map" className="hover:text-gray-200">
          Contact Us
        </Link>
      </div>

      {/* User and Notification Section */}
      <div className="flex items-center space-x-4">
        {userEmail ? (
          <>
            <span className="hidden md:inline-block text-sm">
              Hi, {userEmail}
            </span>
            <button
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
        <div className="flex space-x-4">
          <Link to="/login">
            <button className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded">
              Login
            </button>
          </Link>
        </div>
        )}
        <div
          className="cursor-pointer p-2 rounded-full hover:bg-blue-500"
          onClick={handleNotificationClick}
        >
          <img src={noicon} alt="Notification" className="h-6" />
        </div>
        <div
          className="cursor-pointer p-2 rounded-full hover:bg-blue-500"
          onClick={handleUserClick}
        >
          <img src={userIcon} alt="User" className="h-6" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
