import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Hero from './components/home/hero/hero';
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
import Dashboard from './components/Dashboard';
import Appointment from './components/Appointment';
import PatientMedicalHistory from './components/PatientMedicalHistory';
import DoctorSchedule1 from './components/DoctorSchedule1';
import Prescription from './components/Prescription';
import Patientinfo from './components/info';
import PrescriptionSummary from './components/Summary';
import SideBar from './components/SideBar'; // Main app SideBar
import TopBar from './components/TopBar'; // Main app TopBar
import DoctorProfile from './components/DoctorProfile';
import DoctorLogin from './components/login';
import FilteredAppoinments from './components/filteredAppoinments';

// Import Pharmacy Components
import SideBar_pharmacy from './components/SideBar_pharmacy'; // Pharmacy SideBar
import TopBar_pharmacy from './components/TopBar_pharmacy'; // Pharmacy TopBar
import Dashboard_pharmacy from './components/Dashboard_pharmacy'; // Pharmacy Dashboard
import PrescriptionsList from './components/Prescription_pharmacy'; // Pharmacy Prescription
import View from './components/View'; // Pharmacy View
import PSummary from './components/psummary'; // Pharmacy Summary

function AppContent() {
  const location = useLocation();

  // Main app dashboard routes
  const dashboardRoutes = [
    '/dashboard',
    '/Appointment',
    '/MedicalHistory',
    '/doctor-schedule',
    '/prescription',
    '/info',
    '/summary',
  ];

  // Pharmacy routes
  const pharmacyRoutes = [
    '/pharmacy/dashboard',
    '/pharmacy-prescription',
    '/pharmacy/view',
    '/psummary',
  ];

  const isDashboardRoute = dashboardRoutes.includes(location.pathname);
  const isPharmacyRoute = pharmacyRoutes.includes(location.pathname);

  return (
    <div style={{ display: 'flex' }}>
      {isDashboardRoute && <SideBar />}
      {isPharmacyRoute && <SideBar_pharmacy />}
      <div style={{ flex: 1, marginLeft: isDashboardRoute || isPharmacyRoute ? '250px' : '0', paddingTop: '60px' }}>
        {isDashboardRoute && <TopBar />}
        {isPharmacyRoute && <TopBar_pharmacy />}
        <Routes>
          {/* Main Application Routes */}
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Appointment" element={<Appointment />} />
          <Route path="/MedicalHistory" element={<PatientMedicalHistory />} />
          <Route path="/doctor-schedule" element={<DoctorSchedule1 />} />
          <Route path="/prescription" element={<Prescription />} />
          <Route path="/info" element={<Patientinfo />} />
          <Route path="/summary" element={<PrescriptionSummary />} />
          <Route path="/doctor-profile" element={<DoctorProfile />} />
          <Route path="/doctor-login" element={<DoctorLogin />} />
          <Route path="/newfilteredAppointment" element={<FilteredAppoinments />} />

          {/* Pharmacy Routes */}
          <Route path="/pharmacy/dashboard" element={<Dashboard_pharmacy />} />
          <Route path="/pharmacy-prescription" element={<PrescriptionsList />} />
          <Route path="/pharmacy/view" element={<View />} />
          <Route path="/psummary" element={<PSummary />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
