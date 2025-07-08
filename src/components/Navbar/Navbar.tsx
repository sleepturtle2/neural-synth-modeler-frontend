import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Neural Synth Modeler
        </Link>
        <div className="navbar-links">
          <Link 
            to="/" 
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/convert" 
            className={`navbar-link ${location.pathname === '/convert' ? 'active' : ''}`}
          >
            Convert
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 