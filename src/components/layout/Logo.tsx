const Logo = ({ className = "h-10 sm:h-12" }: { className?: string }) => (
  <svg
    viewBox="0 0 320 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Leaf/wing shape top */}
    <path
      d="M8 8C8 8 28 4 48 16C58 22 62 30 62 30L38 30C24 30 14 22 8 8Z"
      fill="currentColor"
    />
    {/* Square bottom-left */}
    <rect x="8" y="34" width="26" height="26" rx="3" fill="currentColor" />
    {/* Curved shape right */}
    <path
      d="M38 34H58C58 34 66 34 66 46C66 58 58 60 52 60H38V34Z"
      fill="currentColor"
    />
    {/* Orange dot */}
    <circle cx="40" cy="54" r="7" fill="#F97316" />
    {/* RAC text */}
    <text
      x="80"
      y="42"
      fontFamily="Poppins, Inter, sans-serif"
      fontWeight="800"
      fontSize="38"
      fill="currentColor"
      letterSpacing="-1"
    >
      RAC
    </text>
    {/* LOGISTICS text */}
    <text
      x="80"
      y="68"
      fontFamily="Poppins, Inter, sans-serif"
      fontWeight="700"
      fontSize="22"
      fill="currentColor"
      letterSpacing="3"
    >
      LOGISTICS
    </text>
  </svg>
);

export default Logo;
