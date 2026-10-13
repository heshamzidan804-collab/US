export default function LogoIcon() {
  return (
    <svg className="logo-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="heartGrad" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2f6bff" />
          <stop offset="1" stopColor="#ff3d9a" />
        </linearGradient>
      </defs>
      <path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        fill="url(#heartGrad)"
      />
      <path
        d="M12 10.5c-1-1.4-1.9-2.2-3-2.2a2.2 2.2 0 1 0 0 4.4c1.1 0 2-.8 3-2.2s1.9-2.2 3-2.2a2.2 2.2 0 1 1 0 4.4c-1.1 0-2-.8-3-2.2z"
        stroke="#fff"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
