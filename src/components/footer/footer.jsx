import React from 'react';
import logo1 from '../../components/assets/logomedi.png'
import facebook from '../../components/assets/facebook.png'
import instagram from '../../components/assets/instagram.png'
import twitter from '../../components/assets/twitter.png'
import linkedin from '../../components/assets/linkedin.png'

const Footer = () => {
    return (
    <footer className="bg-blue-500 text-white p-10 flex justify-between items-start border-t-4 border-white w-full">
      {/* Left Box - Logo and Description */}
      <div className="flex flex-col items-start w-1/3 h-[250px] border-r-2 border-slate-200 pr-4">
        <div className="mb-4">
          <img src={logo1} alt="MediConnect Logo" className="h-[200px] w-auto" />
        </div>
        <p className="text-lg -mt-7 ml-2 font-semibold">
          Committed to delivering exceptional healthcare across a range of specialties for more than 5 years.
        </p>
      </div>

      {/* Middle Box - Contact Information */}
      <div className="flex flex-col items-start w-1/2 h-[250px] px-4 border-r-2 border-slate-200 font-semiblod">
        <h3 className="text-lg font-bold mb-2">Contact Us</h3>
        <p className="font-semibold text-lg">MediConnect Channeling Center</p>
        <p className="text-lg">Phone numbers:</p>
        <p className="text-lg">+94 123456878</p>
        <p className="text-lg">+94 9876757423</p>
        <div className="flex flex-row">
          <p className="text-lg">
            Email:{' '}
            <a href="mailto:mediconnect@gmail.com" className="underline hover:text-gray-200">
              mediconnect@gmail.com
            </a>
          </p>
        </div>
        <p className="mt-4 font-semibold">FOLLOW US ON</p>
        <div className="flex gap-3 mt-5">
          <img src={facebook} alt="Facebook" className="h-8 w-8" />
          <img src={instagram} alt="Instagram" className="h-8 w-8" />
          <img src={twitter} alt="Twitter" className="h-8 w-8" />
          <img src={linkedin} alt="LinkedIn" className="h-8 w-8" />
        </div>
      </div>

      {/* Right Box - Pharmacy Information */}
      <div className="flex flex-col items-start w-1/2 h-[250px] px-4">
        <h3 className="text-lg font-bold mb-2">MediConnect Pharmacy</h3>
        <p className="text-lg">Phone numbers:</p>
        <p className="text-lg">+94 712789890</p>
        <p className="text-lg">+94 011500001</p>
        <p className="text-lg">
          Email:{' '}
          <a href="mailto:mediconpharmacy@gmail.com" className="underline hover:text-gray-200">
            mediconpharmacy@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
