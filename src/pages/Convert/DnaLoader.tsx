import React, { useRef, useEffect } from 'react';
import './DnaLoader.css';

const COLORS = [
  '#fff', '#bfaec2', '#a18fc6', '#a259e6', '#6ec1e4',
  '#d6d6e7', '#bfaec2', '#a18fc6', '#a259e6', '#fff'
];

const BEAD_COUNT = 10;
const BEAD_SIZE = 12;
const WIDTH = (BEAD_COUNT - 1) * BEAD_SIZE + BEAD_SIZE;
const HEIGHT = 60;
const AMPLITUDE = 18;
const SPEED = 1.5; // seconds per loop

const DnaLoader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrame: number;
    let start: number | null = null;

    const draw = (phase: number) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      for (let strand = 0; strand < 2; strand++) {
        const phaseOffset = strand === 0 ? 0 : Math.PI;
        for (let i = 0; i < BEAD_COUNT; i++) {
          const beadPhase = phase * 2 * Math.PI + (i / BEAD_COUNT) * 2 * Math.PI + phaseOffset;
          const x = i * BEAD_SIZE + BEAD_SIZE / 2;
          const y = HEIGHT / 2 + Math.sin(beadPhase) * AMPLITUDE;
          ctx.beginPath();
          ctx.arc(x, y, BEAD_SIZE / 2, 0, 2 * Math.PI);
          ctx.fillStyle = COLORS[i % COLORS.length];
          ctx.fill();
        }
      }
    };

    const animate = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = (ts - start) / 1000;
      const phase = (elapsed / SPEED) % 1;
      draw(phase);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="dna-loader" style={{ width: WIDTH, height: HEIGHT }}>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
    </div>
  );
};

export default DnaLoader; 