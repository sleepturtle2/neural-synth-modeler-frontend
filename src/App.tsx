import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Convert from './pages/Convert/Convert';
import NotFound from './pages/NotFound/NotFound';
import ConnectionError from './components/ConnectionError/ConnectionError';
import { api, HealthResponse } from './services/api';
import './App.css';

function App() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [healthDetails, setHealthDetails] = useState<HealthResponse['details']>();
  const [isChecking, setIsChecking] = useState(true);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const health = await api.checkHealth();
      setIsHealthy(health.ready);
      setHealthDetails(health.details);
    } catch (error) {
      console.error('Health check failed:', error);
      setIsHealthy(false);
      setHealthDetails({
        mysql: 'Connection failed',
        mongo: 'Connection failed',
        bentoml: 'Connection failed'
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Show loading state while checking health
  if (isChecking) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking backend connection...</p>
      </div>
    );
  }

  // Show error page if backend is not healthy
  if (!isHealthy) {
    return <ConnectionError healthDetails={healthDetails} onRetry={checkHealth} />;
  }

  // Show normal app if backend is healthy
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/convert" element={<Convert />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
