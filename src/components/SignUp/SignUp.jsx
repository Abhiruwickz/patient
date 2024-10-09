import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore'; // Firestore imports
import { db } from '../../firebaseConfig'; // Import Firestore db from firebase.js
import './SignUp.css';

const SignUp = () => {
  const [photo, setPhoto] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    lastName: '',
    contactNo: '',
    nic: '',
    password: '',
    confirmPassword: '',
    email: '',  // New email field
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSignup = async () => {
    try {
      // Save data to Firestore (patients collection)
      const patientDoc = doc(db, 'webpatients', formData.nic); // Use NIC as a document ID
      await setDoc(patientDoc, {
        ...formData,
        photo: photo ? photo.name : null, // You may want to handle photo uploads separately
      });

      // After saving, navigate to the login page
      navigate('/login');
    } catch (error) {
      console.error('Error saving data to Firestore:', error);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="signup-container">
      

      <div className="signup-content">
        <h2>Sign up</h2>

        <div className="form-group-row">
          <div className="form-group">
            <label>Title</label>
            <select name="title" onChange={handleInputChange}>
              <option value="Dr.">Dr.</option>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Miss.">Miss.</option>
            </select>
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label>Email</label> {/* New email input */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label>Contact No</label>
            <input
              type="text"
              name="contactNo"
              placeholder="Contact No"
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>NIC</label>
            <input
              type="text"
              name="nic"
              placeholder="NIC"
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label>Photo</label>
            <div className="photo-upload">
              <input type="file" onChange={handlePhotoChange} />
              <div className="photo-placeholder">
                {photo ? photo.name : 'Drag and drop a file here or click'}
              </div>
            </div>
          </div>
        </div>

        <button className="signup-button" onClick={handleSignup}>
          Signup
        </button>

        <div className="login-section">
          <span>Have an account?</span>
          <span className="login-link" onClick={handleLoginRedirect}>
            Log in
          </span>
        </div>
      </div>

      
    </div>
  );
};

export default SignUp;
