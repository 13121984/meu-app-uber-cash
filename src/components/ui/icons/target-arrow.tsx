
import { SVGProps } from 'react';

export function IconTargetArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="1em" 
      height="1em" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      {/* Outer Circle */}
      <circle cx="12" cy="12" r="10" />
      {/* Middle Circle */}
      <circle cx="12" cy="12" r="6" />
      {/* Inner Circle (Bullseye) */}
      <circle cx="12" cy="12" r="2" />
      
      {/* Arrow */}
      <path d="M12 18v-2" />
      <path d="m15 11-3-3-3 3" />
      <path d="M12 8V2" />
    </svg>
  );
}
