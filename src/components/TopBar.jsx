import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import './TopBar.css';
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
        <div className="topbar">
            <div className="greeting-container">
                <span className="greeting">{greeting}</span>
                <span className="subtitle">Your Health, Our Priority</span>
            </div>

            <div className="right-section">
                
                <div className="user-info">
                    <img className="profile-image" src={logo} alt="Admin Profile" />
                    <span className="admin-name" onClick={handleProfileClick}>Mr Doctor</span>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
