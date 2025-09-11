
import { SVGProps } from 'react';

export function IconTargetArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
        <g transform="rotate(-45 12 12)">
            {/* Círculo externo vermelho */}
            <circle cx="12" cy="12" r="10" fill="red"></circle>
            {/* Círculo médio branco */}
            <circle cx="12" cy="12" r="7" fill="white"></circle>
            {/* Círculo interno vermelho */}
            <circle cx="12" cy="12" r="4" fill="red"></circle>

            {/* Haste da flecha */}
            <path stroke="black" strokeWidth="2" d="M2,12 H22" />

            {/* Penas da flecha (vermelhas) */}
            <path fill="red" d="M19 8 l 4 4 l -4 4z" />
            <path fill="red" d="M17 9 l 4 4 l -4 4z" />

            {/* Ponta da flecha (Círculo preto no centro) */}
            <circle cx="12" cy="12" r="1.5" fill="black"></circle>
        </g>
    </svg>
  );
}
