import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import loginImage from "../assets/1.jpg";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      await signInWithEmailAndPassword(auth, trimmedUsername, trimmedPassword);

      if (trimmedUsername.endsWith('@med.lk')) {
        const doctorsRef = collection(db, "Doctors");
        const doctorQuery = query(doctorsRef, where("UserName", "==", trimmedUsername));
        const doctorQuerySnapshot = await getDocs(doctorQuery);

        if (!doctorQuerySnapshot.empty) {
          const doctorDoc = doctorQuerySnapshot.docs[0];
          const doctorId = doctorDoc.id;
          navigate('/dashboard', { state: { doctorId } });
        } else {
          setErrorMessage("Doctor not found.");
        }
      } else if (trimmedUsername.endsWith('@pharmacy.lk')) {
        navigate('/pharmacy/dashboard');
      } else {
        const webpatientsRef = collection(db, "webpatients");
        const patientQuery = query(webpatientsRef, where("email", "==", trimmedUsername));
        const patientQuerySnapshot = await getDocs(patientQuery);

        if (!patientQuerySnapshot.empty) {
          navigate('/');
        } else {
          setErrorMessage("Patient not found.");
        }
      }
    } catch (error) {
      setErrorMessage(`Failed to log in: ${error.message}`);
      console.error("Error logging in: ", error);
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
      navigate('/');
    } catch (error) {
      setErrorMessage('Error during Google sign-in.');
      console.error('Error during Google sign-in:', error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${loginImage})` }}>
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-md lg:mx-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
          />
          <div>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
            />
            <div
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:underline mt-2 cursor-pointer text-right"
            >
              Forgot Password?
            </div>
          </div>
        </div>

        {errorMessage && <div className="text-sm text-red-600 mt-4">{errorMessage}</div>}
        {resetMessage && <div className="text-sm text-green-600 mt-4">{resetMessage}</div>}

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded-md mt-6 hover:bg-blue-700 transition-colors"
        >
          Login
        </button>

        <div className="text-center mt-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-transparent border border-blue-600 text-blue-600 py-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
          >
            Sign in with Google
          </button>
        </div>

        <div className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
