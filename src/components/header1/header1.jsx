import React from 'react';
import './header1.css';
import { FaBell } from 'react-icons/fa'; // Using Font Awesome icons

const Header = () => {
    return (
        <header className="header-container">
            <div className="header-logo">
                {/* Placeholder for the logo */}
                <img src="logo-placeholder.png" alt="Logo" className="logo-image" />
            </div>
            <div className="header-title">
                <span className="brand-name">Medi</span><span className="highlight">Connect</span>
            </div>
            <div className="header-icon">
                {/* Bell icon */}
                <FaBell className="bell-icon" />
            </div>
        </header>
    );
};

export default Header;
