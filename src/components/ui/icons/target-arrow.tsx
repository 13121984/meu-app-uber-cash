
import { SVGProps } from 'react';

export function IconTargetArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <path d="M12 12c-2 0-2 2-2 2s0-2-2-2s2 0 2-2s0 2 2 2s-2 0-2 2"></path>
        <path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0zM12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18z"></path>
        <path d="m15 12l5-5m-5 0h5v5"></path>
      </g>
    </svg>
  );
}
