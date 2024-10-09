import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; // Firebase Auth methods
import { auth, db } from '../../firebaseConfig'; // Import Firebase Auth and Firestore
import { collection, getDocs, query, where } from 'firebase/firestore'; // Firestore methods
import './Login.css';
import login from "../assets/1.jpg";

const Login = () => {
  const [username, setUsername] = useState(''); // username = email
  const [password, setPassword] = useState(''); // password entered by user
  const [errorMessage, setErrorMessage] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  // Function to fetch user credentials from Firestore
  const fetchPatientCredentials = async () => {
    const webpatientsRef = collection(db, "webpatients"); // Reference to the webpatients collection
    const q = query(webpatientsRef, where("email", "==", username)); // Query to find the user by email

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // If the user exists, retrieve the email and password from Firestore
      const patientData = querySnapshot.docs[0].data();
      return {
        email: patientData.email,
        password: patientData.password
      };
    } else {
      throw new Error('User not found');
    }
  };

  // Handle login
  const handleLogin = async () => {
    try {
      // Fetch credentials from Firestore based on entered email
      const { email, password: dbPassword } = await fetchPatientCredentials();

      // Sign in using the retrieved credentials from Firestore
      await signInWithEmailAndPassword(auth, email, password || dbPassword);

      // Navigate to home page upon successful login
      navigate('/');
    } catch (error) {
      setErrorMessage('Invalid email or password.');
      console.error('Error during login:', error);
    }
  };

  const handleForgotPassword = async () => {
    if (!username.includes('@')) {
      setResetMessage('Please enter a valid email to reset password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, username);
      setResetMessage('Password reset email sent successfully. Please check your inbox.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setResetMessage('Error sending password reset email. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/'); // Navigate to home page upon successful Google sign-in
    } catch (error) {
      setErrorMessage('Error during Google sign-in.');
      console.error('Error during Google sign-in:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-image">
          <img src={login} alt="Doctors group" />
        </div>

        <div className="login-form">
          <h2>Login</h2>

          <div className="form-group1">
            <input
              type="email"
              placeholder="Enter your email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group1">
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="forgot-password" onClick={handleForgotPassword}>
              Forgot Password?
            </div>
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {resetMessage && <div className="reset-message">{resetMessage}</div>}

          <button type="submit" className="login-button" onClick={handleLogin}>
            Login
          </button>

          <div className="google-signin">
            <button className="google-button" onClick={handleGoogleSignIn}>
              Sign in with Google
            </button>
          </div>

          <div className="signup-section">
            <span>Do not have an account?</span>
            <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
