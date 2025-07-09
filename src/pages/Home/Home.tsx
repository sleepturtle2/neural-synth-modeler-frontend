import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <div className="content-section">
        <div className="container">
          <div className="info-section">
            <h2>How It Works</h2>
            <p>
              Simply upload your audio file in WAV format. Our AI model will analyze the spectral content, 
              harmonic structure, and dynamic characteristics of your audio to generate a synthesizer preset 
              that captures the essence of your sound. The process is fully automated and optimized for 
              the Vital synthesizer, ensuring compatibility and quality results.
            </p>
            <p>
              Whether you're looking to recreate a specific sound, get inspiration for new patches, 
              or simply want to explore the possibilities of AI-assisted sound design, our tool provides 
              a seamless bridge between audio analysis and synthesizer programming.
            </p>
          </div>
        </div>
      </div>
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Transform Audio into Synth Presets</h1>
          <p className="hero-subtitle">
            Upload your audio files and get AI-generated synthesizer presets instantly
          </p>
          <Link to="/convert" className="cta-button">
            Start Converting
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 