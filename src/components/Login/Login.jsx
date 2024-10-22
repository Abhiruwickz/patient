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

  // Handle login
  const handleLogin = async () => {
    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      // Attempt to sign in with Firebase Auth first
      await signInWithEmailAndPassword(auth, trimmedUsername, trimmedPassword);

      // Check user role based on their email domain
      if (trimmedUsername.endsWith('@med.lk')) {
        // Query the Doctors collection
        const doctorsRef = collection(db, "Doctors");
        const doctorQuery = query(doctorsRef, where("UserName", "==", trimmedUsername));
        const doctorQuerySnapshot = await getDocs(doctorQuery);

        if (!doctorQuerySnapshot.empty) {
          // If a matching doctor is found, navigate to the doctor's dashboard
          const doctorDoc = doctorQuerySnapshot.docs[0];
          const doctorId = doctorDoc.id;
          navigate('/dashboard', { state: { doctorId } });
        } else {
          setErrorMessage("Doctor not found.");
        }
      } else if (trimmedUsername.endsWith('@pharmacy.lk')) {
        // Navigate to pharmacy dashboard if the email ends with @pharmacy.lk
        navigate('/pharmacy/dashboard');
      } else {
        // Query the webpatients collection
        const webpatientsRef = collection(db, "webpatients");
        const patientQuery = query(webpatientsRef, where("email", "==", trimmedUsername));
        const patientQuerySnapshot = await getDocs(patientQuery);

        if (!patientQuerySnapshot.empty) {
          // If a matching patient is found, navigate to the patient home/dashboard
          navigate('/');
        } else {
          setErrorMessage("Patient not found.");
        }
      }
    } catch (error) {
      setErrorMessage(`Failed to log in: ${error.message}`);
      console.error("Error logging in: ", error); // Provide more details in the console
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
