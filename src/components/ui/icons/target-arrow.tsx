
import { SVGProps } from 'react';

export function IconTargetArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="1em" 
      height="1em" 
      viewBox="0 0 24 24" 
      {...props}
    >
        {/* Círculo externo vermelho */}
        <circle cx="12" cy="12" r="10" fill="#ef4444"/>
        
        {/* Círculo do meio branco */}
        <circle cx="12" cy="12" r="7" fill="white"/>
        
        {/* Círculo interno vermelho */}
        <circle cx="12" cy="12" r="4" fill="#ef4444"/>
        
        {/* Alvo central (ponta da flecha) */}
        <circle cx="12" cy="12" r="1.5" fill="black"/>
    </svg>
  );
}
