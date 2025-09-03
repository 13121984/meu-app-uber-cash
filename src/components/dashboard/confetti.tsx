
"use client"

import React, { useEffect, useState, memo } from 'react';

const confettiColors = ['#FFC700', '#FF8C00', '#4CAF50', '#2196F3', '#FFFFFF', '#FF5722'];

const ConfettiPiece = memo(({ style }: { style: React.CSSProperties }) => (
  <div
    className="absolute w-2 h-4 rounded-sm"
    style={{ ...style, animation: `confetti-fall ${2 + Math.random() * 2}s linear forwards` }}
  />
));
ConfettiPiece.displayName = 'ConfettiPiece';

export function Confetti() {
  const [pieces, setPieces] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 150 }).map((_, i) => {
      const style: React.CSSProperties = {
        left: `${Math.random() * 100}vw`,
        top: `${-20 + Math.random() * -80}px`,
        backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        transform: `rotate(${Math.random() * 360}deg)`,
        opacity: 0,
        animationDelay: `${Math.random() * 1.5}s`,
      };
      return <ConfettiPiece key={i} style={style} />;
    });
    setPieces(newPieces);
  }, []);

  return <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">{pieces}</div>;
}
