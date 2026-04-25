const HeaderLogo = ({ className = "h-10 w-auto sm:h-11 md:h-[50px]" }: { className?: string }) => (
  <svg
    viewBox="0 0 760 220"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="RAC Logistics"
    preserveAspectRatio="xMinYMid meet"
  >
    <g fill="#07145C">
      <path d="M22 26h104c62 0 110 16 141 56l13 18H114c-42 0-72-9-91-26C11 64 4 48 0 26h22Z" />
      <path d="M10 111h106v110c-39 0-70-11-91-31C7 170 0 144 0 111h10Z" />
      <rect x="126" y="111" width="112" height="64" rx="2" />
    </g>
    <circle cx="144" cy="188" r="29" fill="#DF5101" />
    <text
      x="286"
      y="122"
      fill="#07145C"
      fontFamily="Space Grotesk, Inter, Arial, sans-serif"
      fontSize="126"
      fontWeight="900"
      letterSpacing="-5"
    >
      RAC
    </text>
    <text
      x="290"
      y="194"
      fill="#07145C"
      fontFamily="Space Grotesk, Inter, Arial, sans-serif"
      fontSize="72"
      fontWeight="800"
      letterSpacing="2"
    >
      LOGISTICS
    </text>
  </svg>
);

export default HeaderLogo;