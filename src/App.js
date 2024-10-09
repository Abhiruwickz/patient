import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// import Navbar from './components/home/navbar/navbar';
import Hero from './components/home/hero/hero';
// import Footer from './components/home/footer/footer';
import DoctorGrid from './components/doctor/doctorgrid';
import AboutUs from './components/about/about';
import MapSection from './components/contact/map';
import DoctorSchedule from './components/doctorshedule/doctorshedule';
import Confirm from './components/ConfirmSlot/ConfirmSlot';
import ConfirmTimeSlot from './components/ConfirmTimeSlot/ConfirmTimeSlot';
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import Notification from './components/Notification/Notification';
import Profile from './components/Profile/Profile';
import WelcomeSection from './components/home/welcome/WelcomeSection';
import Footer from './components/footer/footer';
import Header from './components/header1/header1';
import AppointmentForm from './components/appoinment/AppoinmentForm';

function App() {
  return (
    <Router>
      <div>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/doctors" element={<DoctorGrid />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/map" element={<MapSection />} />
          <Route path="/schedule" element={<DoctorSchedule />} />
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/confirm-time-slot" element={<ConfirmTimeSlot />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/notifications" element={<Notification />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/welcome" element={<WelcomeSection />} />
          <Route path="/header" element={<Header />} />
          <Route path="/footer" element={<Footer />} />
          <Route path="/app" element={<AppointmentForm />} />

          


          AppointmentForm

        </Routes>
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;
