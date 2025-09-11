
import { SVGProps } from 'react';

export function IconTargetArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Círculo externo vermelho */}
      <circle cx="12" cy="12" r="10" fill="red"></circle>
      {/* Círculo interno branco */}
      <circle cx="12" cy="12" r="7" fill="white"></circle>
      {/* Círculo interno vermelho */}
      <circle cx="12" cy="12" r="4" fill="red"></circle>
       {/* Círculo central branco */}
      <circle cx="12" cy="12" r="1" fill="white"></circle>

      {/* Flecha */}
      <path fill="black" d="m21.92 2.62l-5.05 5.05a1 1 0 0 1-1.41-1.41l5.05-5.05a1 1 0 0 1 1.41 1.41z"></path>
      <path fill="black" d="M22.21 2.91a1 1 0 0 1-1.06.32l-2.12-.7a1 1 0 0 1-.32-1.06l.7-2.12a1 1 0 0 1 1.06-.32l2.12.7a1 1 0 0 1 .32 1.06z"></path>
    </svg>
  );
}
