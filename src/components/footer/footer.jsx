import React from 'react';
import './footer.css';  // Import the module CSS

const Footer = () => {
  return (
      <footer className="footer-container">
          <div className="footer-section">
              <h2 className="footer-title">MediConnect</h2>
              <p className="footer-description">
                  Committed to delivering exceptional healthcare across a range of specialties for more than 5 years
              </p>
          </div>
          <div className="footer-section">
              <h3 className="footer-subtitle">Contact Us</h3>
              <p className="footer-contact-header">MediConnect Channeling Center</p>
              <p className="footer-contact">Phone numbers:</p>
              <p className="footer-phone">+94 123456878</p>
              <p className="footer-phone">+94 9876757423</p>
              <p className="footer-E">Email: <a href="mailto:mediconnect@gmail.com" className="footer-email">mediconnect@gmail.com</a></p>
              <p className="footer-follow">FOLLOW US ON</p>
              <div className="footer-icons">
                  <span className="footer-icon">F</span>
                  <span className="footer-icon">P</span>
                  <span className="footer-icon">I</span>
                  <span className="footer-icon">T</span>
              </div>
          </div>
          <div className="footer-section">
              <h3 className="footer-subtitle">MediConnect Pharmacy</h3>
              <p className="footer-contact">Phone numbers:</p>
              <p className="footer-phone">+94 712789890</p>
              <p className="footer-phone">+94 011500001</p>
              <p className="footer-contact">Email: <a href="mailto:mediconpharmacy@gmail.com" className="footer-email">mediconpharmacy@gmail.com</a></p>
          </div>
      </footer>
  );
};
export default Footer;