import React from 'react';
import Navbar from '../home/navbar/navbar';
import InfoSection from '../contact/info';
import Disclaimer from '../contact/disclamer';
import Footer from '../footer/footer';

function MapSection() {
  return (
    <>
      <Navbar />
      <section className="py-8 bg-white">
        <div className="gmap-frame w-full h-[500px] max-w-screen-lg mx-auto mb-8 border-2 border-gray-300 rounded-lg shadow-lg">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src="https://maps.google.com/maps?width=520&height=400&hl=en&q=Mihisetha%20Channel%20Center,%20Main%20Street,%20Godakawela,sri%20lanka+(Mihisetha%20Channel%20Center)&t=&z=14&ie=UTF8&iwloc=B&output=embed"
            title="Mihisetha Channel Center Location Map"  
          ></iframe>
        </div>
        <div className="info-disclaimer max-w-screen-lg mx-auto pt-8">
          <InfoSection />
          <Disclaimer />
        </div>
      </section>
      <Footer />
    </>
  );
}

export default MapSection;
