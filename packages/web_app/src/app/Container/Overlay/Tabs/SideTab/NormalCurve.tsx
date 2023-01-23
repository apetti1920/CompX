import React from 'react';

export default function NormalCurve(props: { color: string }): React.ReactElement {
  return (
    <svg viewBox="-1.488 9.18 289.696 578.406" xmlns="http://www.w3.org/2000/svg" overflow="none">
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          x1="432"
          y1="106.5"
          x2="432"
          y2="394.5"
          id="gradient-0"
          spreadMethod="pad"
        >
          <stop offset="0" style={{ stopColor: '#bada55' }} />
          <stop offset="1" style={{ stopColor: props.color }} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          x1="144.365"
          y1="392.804"
          x2="144.365"
          y2="396.195"
          id="gradient-1"
          spreadMethod="pad"
        >
          <stop offset="0" style={{ stopColor: '#bada55' }} />
          <stop offset="1" style={{ stopColor: props.color }} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          x1="719.635"
          y1="392.805"
          x2="719.635"
          y2="396.196"
          id="gradient-2"
          spreadMethod="pad"
        >
          <stop offset="0" style={{ stopColor: '#bada55' }} />
          <stop offset="1" style={{ stopColor: props.color }} />
        </linearGradient>
      </defs>
      <g id="Normal_Distro_Curve" transform="matrix(1, 0, 0, 1, -14.803946, 35.229092)">
        <g id="Layer_4">
          <g id="XMLID_1_">
            <g id="g7" transform="matrix(0, 1, -1, 0, 409.51181, -168.846466)">
              <g id="g9">
                <path
                  stroke="#000000"
                  d="M720,394.5c-27.98,0-51.61-6.96-71.97-18.72c-29.641-17.101-52.36-44.37-71.48-75.12       c-28-45.01-48.31-97.48-71.39-136.52C485.13,130.26,463.02,106.5,432,106.5c-31.1,0-53.24,23.88-73.31,57.89       c-23.04,39.05-43.34,91.45-71.31,136.39c-19.28,30.979-42.21,58.41-72.2,75.45C195,387.72,171.62,394.5,144,394.5"
                  id="path11"
                  style={{ paintOrder: 'fill; fill-rule: nonzero; fill-opacity: 0.52; fill: url(#gradient-0)' }}
                />
                <polygon
                  points="145.932,392.804 144.235,394.5 145.932,396.195 144.493,396.195 142.797,394.5 144.493,392.804      "
                  id="polygon13"
                  style={{ paintOrder: 'fill; fill-rule: nonzero; fill-opacity: 0.52; fill: url(#gradient-1)' }}
                />
                <polygon
                  points="718.068,396.196 719.765,394.5 718.068,392.805 719.508,392.805 721.203,394.5 719.508,396.196      "
                  id="polygon15"
                  style={{ paintOrder: 'fill; fill-rule: nonzero; fill-opacity: 0.52; fill: url(#gradient-2)' }}
                />
              </g>
            </g>
          </g>
        </g>
        <g id="g141" />
        <g id="g155" />
      </g>
    </svg>
  );
}
