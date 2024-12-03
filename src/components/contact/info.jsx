import React from 'react';

function InfoSection() {
  return (
    <section className="info-section flex justify-around bg-white p-6 gap-8">
      <div className="contact-card bg-teal-100 p-6 text-center rounded-xl shadow-lg w-1/3">
        <h3 className="text-teal-600 mb-4 text-xl font-semibold">Mihisetha Channeling Center</h3>
        <p className="text-gray-700">Godakawela</p>
      </div>
      <div className="contact-card bg-yellow-100 p-6 text-center rounded-xl shadow-lg w-1/3">
        <h3 className="text-yellow-600 mb-4 text-xl font-semibold">Opening Hours</h3>
        <p className="text-gray-700">Monday - Friday: 9AM - 5PM</p>
        <p className="text-gray-700">Saturday: 9AM - 8PM</p>
      </div>
      <div className="contact-card bg-blue-100 p-6 text-center rounded-xl shadow-lg w-1/3">
        <h3 className="text-blue-600 mb-4 text-xl font-semibold">Mihisetha Contacts</h3>
        <p className="text-gray-700">+94 718922278</p>
        <p className="text-gray-700">+94 35462909</p>
      </div>
    </section>
  );
}

export default InfoSection;
