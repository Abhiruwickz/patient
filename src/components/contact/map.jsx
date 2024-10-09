import React from 'react';
import './map.css';
import Navbar from '../home/navbar/navbar';
import Info from '../contact/info';        
import Disclaimer from '../contact/disclamer'; 
import Footer from '../footer/footer';


function MapSection() {
    return (
      
      <section className="map-section">
        <Navbar />
        <div className='map-section'>
        <div className='gmap-frame'> 
        <iframe width="1400" height="550" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?width=520&amp;height=400&amp;hl=en&amp;q=Mihisetha%20Channel%20Center,%20Main%20Street,%20Godakawela,sri%20lanka+(Mihisetha%20Channel%20Center)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"><a href="https://www.gps.ie/">gps tracker sport</a></iframe>
        </div>      
        </div> 
          
          
          <div>
          <Info />        
          <Disclaimer />
         
        </div>
        <Footer />
      </section>
      
    );
  }
  
  export default MapSection;
  