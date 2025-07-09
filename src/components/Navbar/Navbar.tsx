import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo-group">
          <Link to="/" className="navbar-logo">
            Neural Synth Modeler
          </Link>
          <span className="navbar-beta-tag">BETA</span>
        </div>
        <div className="navbar-links">
          <Link 
            to="/" 
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            /home
          </Link>
          <Link 
            to="/convert" 
            className={`navbar-link ${location.pathname === '/convert' ? 'active' : ''}`}
          >
            /convert
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 