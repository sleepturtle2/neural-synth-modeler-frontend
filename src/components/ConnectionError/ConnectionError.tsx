import React from 'react';
import './ConnectionError.css';

interface ConnectionErrorProps {
  healthDetails?: {
    [service: string]: string | undefined;
  };
  onRetry: () => void;
}

const ConnectionError: React.FC<ConnectionErrorProps> = ({ healthDetails, onRetry }) => {
  // Only show services that are not 'ok'
  const faultyServices = healthDetails
    ? Object.entries(healthDetails).filter(([, status]) => status && status.toLowerCase() !== 'ok')
    : [];

  return (
    <div className="connection-error dark-bg">
      <div className="error-container dotted-border">
        <div className="error-icon">⚠️</div>
        <h1 className="error-title pixel-font">Cannot Connect to Backend</h1>
        <p className="error-description">
          The application cannot connect to the backend services. Please check that all services are running.
        </p>
        {faultyServices.length > 0 && (
          <div className="service-statuses">
            <h3 className="pixel-font">Service Status:</h3>
            {faultyServices.map(([service, status]) => (
              <div key={service} className="service-status error">
                <span className="service-name">{service.toUpperCase()}:</span>
                <span className="service-status-text">{status}</span>
              </div>
            ))}
          </div>
        )}
        <div className="error-actions">
          <button onClick={onRetry} className="retry-button pixel-font">
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionError; 