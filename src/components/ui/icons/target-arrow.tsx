
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
      {/* Outer circle (red) */}
      <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="#ef4444" strokeWidth="2" />
      {/* Middle circle (white, actually transparent to show background) */}
      <circle cx="12" cy="12" r="6" fill="white" stroke="white" strokeWidth="2" />
       {/* Inner circle (red bullseye) */}
      <circle cx="12" cy="12" r="2" fill="#ef4444" stroke="#ef4444" strokeWidth="2" />
      
      {/* Crosshairs */}
      <line x1="12" y1="22" x2="12" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="6" x2="12" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
