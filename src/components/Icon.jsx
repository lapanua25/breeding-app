import React from 'react';

const Icon = ({ name, size = 24, color = "currentColor", className = "" }) => {
  // Simple SVG icon renderer without lucide-react dependency
  const icons = {
    'home': <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
    'settings': <circle cx="12" cy="12" r="3"/>,
    'plus': <path d="M12 5v14M5 12h14"/>,
    'search': <circle cx="11" cy="11" r="8"/>,
    'chevron-down': <path d="M6 9l6 6 6-6"/>,
    'image': <rect x="3" y="3" width="18" height="18" rx="2"/>,
    'feather': <path d="M22 3l-7.5 7.5M2 21l20-20"/>,
  };

  const iconPath = icons[name] || icons['search'];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {iconPath}
    </svg>
  );
};

export default Icon;
