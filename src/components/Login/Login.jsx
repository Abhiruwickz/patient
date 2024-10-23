import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import login from "../assets/1.jpg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      await signInWithEmailAndPassword(auth, trimmedUsername, trimmedPassword);

      if (trimmedUsername.endsWith("@med.lk")) {
        const doctorsRef = collection(db, "Doctors");
        const doctorQuery = query(
          doctorsRef,
          where("UserName", "==", trimmedUsername)
        );
        const doctorQuerySnapshot = await getDocs(doctorQuery);

        if (!doctorQuerySnapshot.empty) {
          const doctorDoc = doctorQuerySnapshot.docs[0];
          const doctorId = doctorDoc.id;
          navigate("/dashboard", { state: { doctorId } });
        } else {
          setErrorMessage("Doctor not found.");
        }
      } else if (trimmedUsername.endsWith("@pharmacy.lk")) {
        navigate("/pharmacy/dashboard");
      } else {
        const webpatientsRef = collection(db, "webpatients");
        const patientQuery = query(
          webpatientsRef,
          where("email", "==", trimmedUsername)
        );
        const patientQuerySnapshot = await getDocs(patientQuery);

        if (!patientQuerySnapshot.empty) {
          navigate("/");
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
    if (!username.includes("@")) {
      setResetMessage("Please enter a valid email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, username);
      setResetMessage(
        "Password reset email sent successfully. Please check your inbox."
      );
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setResetMessage("Error sending password reset email. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      setErrorMessage("Error during Google sign-in.");
      console.error("Error during Google sign-in:", error);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="row justify-content-center w-100">
        <div className="col-md-6">
          <div className="card shadow-lg">
            <img src={login} className="card-img-top img-fluid" alt="Doctors group" style={{ height: '200px', objectFit: 'cover' }} />
            <div className="card-body">
              <h2 className="card-title text-center">Login</h2>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="text-end mt-1">
                  <button
                    className="btn btn-link p-0"
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
              {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
              )}
              {resetMessage && (
                <div className="alert alert-info">{resetMessage}</div>
              )}
              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={handleLogin}
                >
                  Login
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleGoogleSignIn}
                >
                  Sign in with Google
                </button>
              </div>
              <div className="text-center mt-3">
                <span>Do not have an account? </span>
                <Link to="/signup">Sign up</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
