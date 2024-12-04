import React, { useState, useEffect } from 'react';
import logoph from '../components/assets/logo.png';
import { FiBell } from 'react-icons/fi'; // Bell icon from react-icons
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const TopBar_pharmacy = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      setGreeting('Good Morning!');
    } else if (hours >= 12 && hours < 18) {
      setGreeting('Good Afternoon!');
    } else {
      setGreeting('Good Night!');
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase sign-out function
      alert('You have successfully logged out.');
      navigate('/login'); // Redirect to the login page
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="fixed top-0 left-[270px] right-0 z-50 flex items-center justify-between bg-white text-black px-6 py-4 shadow-md rounded-lg">
      {/* Greeting Section */}
      <div className="flex flex-col">
        <span className="text-lg font-bold text-teal-600">{greeting}</span>
        <span className="text-sm text-gray-500">Your Health, Our Priority</span>
      </div>

      {/* Right Section */}
      <div className="flex items-center">
        {/* Notification Icon */}
        <FiBell className="text-xl mr-4 cursor-pointer hover:text-teal-600" />

        {/* User Info */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogout}>
          <img
            src={logoph}
            alt="Admin Profile"
            className="w-10 h-10 rounded-full shadow-sm"
          />
          <span className="font-medium">Pharmacist</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar_pharmacy;
