
import { SVGProps } from 'react';

export function IconTargetArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <g fill="currentColor">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8z" opacity="0.4"></path>
        <path d="M12 6a6 6 0 1 0 6 6a6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4a4 4 0 0 1-4 4z"></path>
        <path d="M12 10a2 2 0 1 0 2 2a2 2 0 0 0-2-2z"></path>
      </g>
      <path fill="currentColor" d="m21.92 2.62l-5.05 5.05a1 1 0 0 1-1.41-1.41l5.05-5.05a1 1 0 0 1 1.41 1.41z"></path>
      <path fill="currentColor" d="M22.21 2.91a1 1 0 0 1-1.06.32l-2.12-.7a1 1 0 0 1-.32-1.06l.7-2.12a1 1 0 0 1 1.06-.32l2.12.7a1 1 0 0 1 .32 1.06z"></path>
    </svg>
  );
}
