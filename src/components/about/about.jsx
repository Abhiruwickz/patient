import React from 'react';
import './about.css'; // Linking the CSS file for styling
// import logo from '../../assets/logomedi.png'; // Adjust the image path
import clinicImage from '../assets/2.jpg'; // Replace with your clinic image
import Navbar from '../home/navbar/navbar'
import Footer from '../footer/footer';

const AboutUs = () => {
  return (

    <div className="about-us-container">
         <Navbar /> 

      <section className="our-story-section">
        <div className="text-content">
          <h2>Our Story</h2>
          <p>
            <strong>Mihisetha Channeling Center</strong> is a healthcare facility located in Godakawela, Sri Lanka. 
            It serves as a local hub for patients seeking medical consultations and treatments. The center offers a variety of medical services, including specialist consultations, diagnostic services, and routine check-ups.
          </p>
          <p>
            Mihisetha Channeling Center is known for its commitment to providing accessible and quality healthcare to the community of Godakawela and surrounding areas. 
            The facility is equipped with modern medical technology and staffed by experienced healthcare professionals who are dedicated to ensuring patient well-being.
          </p>
        </div>
        <div className="image-content">
          <img src={clinicImage} alt="Clinic" />
        </div>
      </section>

      <section className="highlights-section">
        <div className="highlight-box">
          <h3>Dedicated Compassion</h3>
          <p>We produce significant client-centered experiences.</p>
        </div>
        <div className="highlight-box">
          <h3>Advancing Medical Excellence</h3>
          <p>We drive the medical industry towards greater heights.</p>
        </div>
        <div className="highlight-box">
          <h3>Exciting Pride</h3>
          <p>We attract, encourage, and motivate enthusiastic individuals.</p>
        </div>
      </section>
      <Footer /> 
    </div>
    
  );
};

export default AboutUs;
