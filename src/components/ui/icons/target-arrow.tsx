
import { SVGProps } from 'react';

export function IconTargetArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="1em" 
      height="1em" 
      viewBox="0 0 24 24" 
      {...props}
      fill="none" // Garantir que não haja preenchimento padrão
      stroke="currentColor" // Usar a cor do texto por padrão
    >
        {/* Círculo externo vermelho */}
        <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="none" />
        
        {/* Círculo do meio vermelho */}
        <circle cx="12" cy="12" r="6" stroke="#ef4444" strokeWidth="2" fill="none"/>
        
        {/* Círculo interno (alvo) vermelho */}
        <circle cx="12" cy="12" r="2" fill="#ef4444" stroke="#ef4444" strokeWidth="1"/>

        {/* Flecha preta */}
        <path d="M12 14L12 22" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        
        {/* Penas da flecha (vermelhas) */}
        <path d="M15 19L12 22L9 19" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
