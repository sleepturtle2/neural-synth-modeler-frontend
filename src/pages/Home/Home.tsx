import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
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
      
      <div className="content-section">
        <div className="container">
          <div className="features">
            <div className="feature-card">
              <div className="feature-icon">🎵</div>
              <h3>AI-Powered Analysis</h3>
              <p>Our advanced neural network analyzes your audio and extracts the essential characteristics to create matching synth presets.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Results</h3>
              <p>Get your synthesizer presets in seconds. No waiting, no complex setup - just upload and receive your results.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎛️</div>
              <h3>Vital Compatible</h3>
              <p>All generated presets are compatible with Vital synthesizer, ready to use in your music production workflow.</p>
            </div>
          </div>
          
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
    </div>
  );
};

export default Home; 