import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore'; // Firestore imports
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase Auth imports
import { auth, db } from '../../firebaseConfig'; // Import Firebase Auth and Firestore db
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
    const { email, password, confirmPassword, nic, title, firstName, lastName, contactNo } = formData;
  
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase Auth successful. User:', user);
      
      // Save input details to Firestore with nic as the document ID
      await setDoc(doc(db, "webpatients", nic), {
        title,
        firstName,
        lastName,
        email,
        contactNo,
        nic,
        photoURL: photo ? photo.name : '', // You can later store the uploaded file to Firebase Storage if needed
      });
      console.log('User data saved to Firestore');

      navigate('/login'); // Navigate to login page after successful signup
    } catch (error) {
      console.error('Error during signup process:', error.message); 
      alert(`Failed to sign up: ${error.message}`);
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
