import React from 'react';
import './Footer.css';

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="footer-main">
      <div className="footer-info">
        <span style={{ fontSize: '0.95rem', color: '#bfaec2' }}>
          © 2024 <span className="footer-logo-pixel">Neural Synth Modeler</span> | An open-source AI-powered synth preset generator.
        </span>
      </div>
      <div className="footer-links">
        <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://your-docs-link" target="_blank" rel="noopener noreferrer">Docs</a>
        <a href="mailto:contact@yoursite.com">Contact</a>
      </div>
      <div className="footer-attribution">
        Made with <span style={{color: '#ff7eb9', fontSize: '1.1em'}}>❤️</span> by Sayantan Mukherjee
      </div>
    </div>
  </footer>
);

export default Footer;
export {}; 