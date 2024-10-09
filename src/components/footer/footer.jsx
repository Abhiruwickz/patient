import React from 'react';
import styles from './footer.module.css';  // Import the module CSS

const Footer = () => {
  return (
    <div className={styles.container}>
      {/* First Column */}
      <div className={styles.section}>
        <h1>MediConnect</h1>
        <p>
          Committed to delivering exceptional healthcare across a range of
          specialties for more than 5 years
        </p>
      </div>

      {/* Second Column */}
      <div className={styles.section}>
        <h3>Contact Us</h3>
        <p>Phone numbers:</p>
        <p>
          +94 1234567878
          <br />
          +94 9876757423
        </p>
      </div>

      {/* Third Column */}
      <div className={styles.section}>
        <h3>Email Us</h3>
        <p>Email: mediconnect@gmail.com</p>
      </div>
    </div>
  );
};

export default Footer;