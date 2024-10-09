import React from 'react';
import './Profile.css';

function Profile() {
  return (
    <div className="profile-container">
      <div className="profile-content">
        <h2>My Profile</h2>
        <form className="profile-form">
          <div className="profile-title-group">
            <label>Title</label>
            <select>
              <option>Miss</option>
              <option>Mr</option>
              <option>Mrs</option>
            </select>
          </div>

          <div className="profile-firstname-group">
            <label>First Name</label>
            <input type="text" value="Pamudi" readOnly />
          </div>

          <div className="profile-lastname-group">
            <label>Last Name</label>
            <input type="text" value="Dayarathne" readOnly />
          </div>

          <div className="profile-displayname-group">
            <label>Display Name</label>
            <input type="text" value="Pamudi Dayarathne" readOnly />
          </div>

          <div className="profile-contactno-group">
            <label>Contact No</label>
            <input type="text" value="+94 718792070" readOnly />
          </div>

          <div className="profile-nic-group">
            <label>NIC</label>
            <input type="text" value="200179945670" readOnly />
          </div>

          <div className="profile-picture">
            <img src="https://via.placeholder.com/150" alt="profile-pic" />
          </div>

          <div className="profile-buttons">
            <button type="button" className="profile-cancel-btn">Cancel</button>
            <button type="submit" className="profile-update-btn">Update</button>
          </div>
        </form>
      </div>

      <footer className="profile-footer">
        <div>mediconnect@gmail.com</div>
        <div>
          <span>+94 1234567878</span> / <span>+94 9876757423</span>
        </div>
      </footer>
    </div>
  );
}

export default Profile;
