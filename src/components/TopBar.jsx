import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../components/assets/logo.png';
import { FiBell } from 'react-icons/fi';

const TopBar = () => {
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location
  const doctorId = location.state?.doctorId || localStorage.getItem('doctorId'); // Retrieve doctorId

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

  // Function to handle profile click and navigate to doctor profile page with doctorId
  const handleProfileClick = () => {
    navigate(`/doctor-profile`, { state: { doctorId } }); // Pass doctorId in the state
  };

  return (
    <div className="flex justify-between items-center bg-blue-50 px-4 py-3 shadow-md border-b border-gray-300 w-full z-50 -mt-14 ml-4">
      {/* Greeting Section */}
      <div className="flex flex-col justify-center max-w-[50%]">
        <span className="text-xl font-bold text-blue-600">{greeting}</span>
        <span className="text-sm text-gray-500 mt-1">Your Health, Our Priority</span>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-end space-x-5">
        <FiBell className="text-2xl text-blue-600 cursor-pointer hover:text-blue-500 transition-colors duration-300" />
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={handleProfileClick}
        >
          <img
            className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
            src={logo}
            alt="Admin Profile"
          />
          <span className="text-lg font-medium text-gray-700 whitespace-nowrap mr-4">
            Mr Doctor
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
