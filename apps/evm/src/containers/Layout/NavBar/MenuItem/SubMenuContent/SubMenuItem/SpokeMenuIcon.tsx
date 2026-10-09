import { useId } from 'react';

/**
 * Venus Spoke menu icon, from Venus UI Kit (Figma 3534:118460): 40px dark radial tile,
 * radius 8, nine dots joined by soft streaks. Dots carry a ring index so New/E can ripple them
 * out from the centre on hover (Original stays still). Ids are per instance.
 */
export const SpokeMenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => {
  const id = useId();
  const tile = `spoke-tile-${id}`;
  const streak = `spoke-streak-${id}`;
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="40" height="40" rx="8" fill={`url(#${tile})`} />
      <rect
        x="30.6973"
        y="17.1516"
        width="5.44274"
        height="11.9193"
        transform="rotate(90 30.6973 17.1516)"
        fill={`url(#${streak}-0)`}
      />
      <rect
        x="9.16406"
        y="22.5898"
        width="5.42977"
        height="13.1214"
        transform="rotate(-90 9.16406 22.5898)"
        fill={`url(#${streak}-1)`}
      />
      <rect
        x="22.5254"
        y="30.7666"
        width="5.44274"
        height="11.9193"
        transform="rotate(-180 22.5254 30.7666)"
        fill={`url(#${streak}-2)`}
      />
      <rect x="17.0879" y="9.2334" width="5.42977" height="13.1214" fill={`url(#${streak}-3)`} />
      <circle
        className="venus-spoke-dot"
        data-ring="0"
        cx="20"
        cy="20.1935"
        r="2.72755"
        fill="#D9D9D9"
      />
      <circle
        className="venus-spoke-dot"
        data-ring="1"
        cx="30.6719"
        cy="19.872"
        r="2.72755"
        fill="#D9D9D9"
      />
      <circle
        className="venus-spoke-dot"
        data-ring="1"
        cx="8.9375"
        cy="19.8752"
        r="2.72755"
        fill="#D9D9D9"
      />
      <circle
        className="venus-spoke-dot"
        data-ring="1"
        cx="19.8048"
        cy="30.7412"
        r="2.72755"
        fill="#D9D9D9"
      />
      <circle
        className="venus-spoke-dot"
        data-ring="1"
        cx="19.8009"
        cy="9.00562"
        r="2.72755"
        fill="#D9D9D9"
      />
      <circle
        className="venus-spoke-dot"
        data-ring="2"
        cx="27.5859"
        cy="12.4145"
        r="2.72755"
        fill="#D9D9D9"
      />
      <circle
        className="venus-spoke-dot"
        data-ring="2"
        cx="12.1562"
        cy="12.1571"
        r="2.72755"
        fill="#D9D9D9"
      />
      <circle
        className="venus-spoke-dot"
        data-ring="2"
        cx="27.8418"
        cy="27.8439"
        r="2.72755"
        fill="#D9D9D9"
      />
      <circle
        className="venus-spoke-dot"
        data-ring="2"
        cx="12.4141"
        cy="27.5866"
        r="2.72755"
        fill="#D9D9D9"
      />
      <defs>
        <radialGradient
          id={tile}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(4.09091 2.72727) rotate(47.3859) scale(46.3235)"
        >
          <stop stopColor="#4C555F" />
          <stop offset="0.430533" stopColor="#2D353E" />
          <stop offset="1" stopColor="#0F171F" />
        </radialGradient>
        <linearGradient
          id={`${streak}-0`}
          x1="33.5344"
          y1="17.849"
          x2="33.4277"
          y2="24.3879"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9D9D9" stopOpacity="0.75" />
          <stop offset="1" stopColor="#737373" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${streak}-1`}
          x1="11.9944"
          y1="23.3575"
          x2="11.8648"
          y2="30.5555"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9D9D9" stopOpacity="0.75" />
          <stop offset="1" stopColor="#737373" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${streak}-2`}
          x1="25.3625"
          y1="31.464"
          x2="25.2558"
          y2="38.0028"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9D9D9" stopOpacity="0.75" />
          <stop offset="1" stopColor="#737373" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${streak}-3`}
          x1="19.9183"
          y1="10.0011"
          x2="19.7886"
          y2="17.199"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9D9D9" stopOpacity="0.75" />
          <stop offset="1" stopColor="#737373" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};
