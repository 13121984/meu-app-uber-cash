"use client"

import React, { useEffect, useState } from 'react';

const confettiColors = ['#FF8C00', '#CC6600', '#FFA500', '#FFD700', '#FFFFFF'];

const ConfettiPiece = ({ id, style }: { id: number, style: React.CSSProperties }) => (
  <div
    key={id}
    className="absolute w-2 h-4 rounded-sm animate-confetti-rain"
    style={style}
  />
);

export function Confetti() {
  const [pieces, setPieces] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 100 }).map((_, i) => {
      const style: React.CSSProperties = {
        left: `${Math.random() * 100}vw`,
        backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        animationDelay: `${Math.random() * 2}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      };
      return <ConfettiPiece key={i} id={i} style={style} />;
    });
    setPieces(newPieces);
  }, []);

  return <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">{pieces}</div>;
}
