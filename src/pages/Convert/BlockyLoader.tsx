import React from 'react';
import './BlockyLoader.css';

const BlockyLoader: React.FC = () => (
  <div className="blocky-loader">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="blocky-loader-block" style={{ animationDelay: `${i * 0.1}s` }} />
    ))}
  </div>
);

export default BlockyLoader; 