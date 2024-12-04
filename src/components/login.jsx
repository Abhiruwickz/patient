import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import the Firestore database
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
      const q = query(
        doctorsRef,
        where('UserName', '==', trimmedUsername),
        where('password', '==', trimmedPassword)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid username or password');
      } else {
        const doctorDoc = querySnapshot.docs[0];
        const doctorId = doctorDoc.id;

        // Successful login, navigate to the dashboard with doctorId
        navigate('/Appoinment', { state: { doctorId } });
      }
    } catch (err) {
      setError('Failed to log in. Please try again.');
      console.error('Error logging in: ', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-800 ">
      <div className="flex flex-col items-center">
        <img src={logo} alt="Logo" className="w-24 h-24 mb-6" />
        <h1 className="text-white text-4xl font-bold mb-8">MediConnect</h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Login</h2>
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded text-sm">
            {error}
          </div>
        )}
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
          User Name
        </label>
        <input
          type="text"
          id="username"
          className="w-full px-4 py-2 mb-4 border rounded-md text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          value={userName}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          className="w-full px-4 py-2 mb-4 border rounded-md text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="text-right mb-4">
          <a href="/forgot-password" className="text-blue-500 hover:text-blue-700 text-sm">
            Forgot Password?
          </a>
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded-md font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Home;
