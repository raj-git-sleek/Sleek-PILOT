import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 20"
      fill="currentColor"
      {...props}
    >
      <text
        x="50"
        y="15"
        fontFamily="Verdana"
        fontSize="18"
        textAnchor="middle"
        fill="currentColor"
      >
        Sleek Memory
      </text>
    </svg>
  ),
};
