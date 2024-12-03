import React, { useState, useEffect } from 'react';
import './TopBar_pharmacy.css';
import logoph from '../components/assets/logo.png';
import { FiBell } from 'react-icons/fi'; // Replaced with react-icons for bell

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
        <div className="topbar">
            <div className="greeting-container">
                <span className="greeting">{greeting}</span>
                <span className="subtitle">Your Health, Our Priority</span>
            </div>

            <div className="right-section">
               
                <div className="user-info">
                <img className="profile-image" src={logoph} alt="Admin Profile" />
                <div className="user-info" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <span>Pharmacist</span>
                </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar_pharmacy;
