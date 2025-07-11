import React from 'react';
import './BlockySquareSpinner.css';

const positions = [
  { top: 0, left: 0 },    // top-left
  { top: 0, left: 1 },    // top-mid
  { top: 0, left: 2 },    // top-right
  { top: 1, left: 2 },    // right-mid
  { top: 2, left: 2 },    // bottom-right
  { top: 2, left: 1 },    // bottom-mid
  { top: 2, left: 0 },    // bottom-left
  { top: 1, left: 0 },    // left-mid
];

const BlockySquareSpinner: React.FC = () => (
  <div className="blocky-square-spinner">
    {positions.map((pos, i) => (
      <div
        key={i}
        className="blocky-square-spinner-block"
        style={{
          gridRow: pos.top + 1,
          gridColumn: pos.left + 1,
          animationDelay: `${i * 0.1}s`
        }}
      />
    ))}
  </div>
);

export default BlockySquareSpinner; 