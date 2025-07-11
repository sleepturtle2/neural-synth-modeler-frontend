import React, { useEffect, useRef, useState } from 'react';
import './DnaLoader.css';

const COLORS = [
  '#941946', '#fbacc9', '#a2f0fb', '#164ba3',
  '#941946', '#fbacc9', '#a2f0fb', '#164ba3',
  '#941946', '#fbacc9'
];

const BEAD_COUNT = 10;
const BEAD_SIZE = 12;
const WIDTH = (BEAD_COUNT - 1) * BEAD_SIZE;
const HEIGHT = 60;
const AMPLITUDE = 18; // vertical amplitude of sine wave
const SPEED = 1.5; // seconds per loop

function getBeadPosition(t: number, i: number, count: number, strand: 0 | 1) {
  const phaseOffset = strand === 0 ? 0 : Math.PI;
  const beadPhase = t * 2 * Math.PI + (i / count) * 2 * Math.PI + phaseOffset;
  const x = i * BEAD_SIZE;
  const y = HEIGHT / 2 + Math.sin(beadPhase) * AMPLITUDE;
  return {
    left: x,
    top: y - BEAD_SIZE / 2
  };
}

const DnaLoader: React.FC = () => {
  const [phase, setPhase] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const animate = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = (ts - start) / 1000;
      setPhase((elapsed / SPEED) % 1);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="dna-loader" style={{ width: WIDTH, height: HEIGHT }}>
      {[0, 1].map(strand =>
        Array.from({ length: BEAD_COUNT }).map((_, i) => {
          const pos = getBeadPosition(phase, i, BEAD_COUNT, strand as 0 | 1);
          return (
            <div
              key={`${strand}-${i}`}
              className="dna-bead"
              style={{
                left: pos.left,
                top: pos.top,
                background: COLORS[i % COLORS.length],
                width: BEAD_SIZE,
                height: BEAD_SIZE
              }}
            />
          );
        })
      )}
    </div>
  );
};

export default DnaLoader; 