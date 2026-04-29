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
    'globe': <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5h3V9h4v3h3l-5 5z"/>,
    'mail': <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M4 6l8 5 8-5"/>,
    'user': <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>,
    'alert-circle': <><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>,
    'edit-2': <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>,
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
