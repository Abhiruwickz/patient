
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import the Firestore database
import './login.css'; // Ensure the CSS path is correct
import logo from '../components/assets/logomedi.png';

function Home() {
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const trimmedUsername = userName.trim();
      const trimmedPassword = password.trim();

      const doctorsRef = collection(db, 'Doctors');
      const q = query(doctorsRef, where('UserName', '==', trimmedUsername), where('password', '==', trimmedPassword));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid username or password");
      } else {
        const doctorDoc = querySnapshot.docs[0];
        const doctorId = doctorDoc.id;

        // Successful login, navigate to the dashboard with doctorId
        navigate('/doctor-schedule', { state: { doctorId } });
      }
    } catch (err) {
      setError("Failed to log in. Please try again.");
      console.error("Error logging in: ", err);
    }
  };

  return (
    <div className="home">
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h1 className="header-title">MediConnect</h1>
      </header>

      <div className="main">
        <div className="login-section">
          <h2 className="login-header">Login</h2>
          {error && <div className="error-message">{error}</div>}
          <label className="input-label" htmlFor="username">
            User Name
            <input 
              type="text" 
              id="username" 
              className="input-field" 
              value={userName} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </label>
          <label className="input-label" htmlFor="password">
            Password
            <input 
              type="password" 
              id="password" 
              className="input-field" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </label>
          <div className="forgot-password">Forget Password?</div>
          <button className="login-button" onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
