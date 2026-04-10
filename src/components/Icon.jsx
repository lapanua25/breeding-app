import React from 'react';
import * as Icons from 'lucide-react';

const Icon = ({ name, size = 24, color = "currentColor", className = "" }) => {
  // Lucide icons are PascalCase, so we convert kebab-case if needed
  // e.g. "arrow-left" -> "ArrowLeft"
  const pascalName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  const LucideIcon = Icons[pascalName] || Icons.HelpCircle;

  return <LucideIcon size={size} color={color} className={className} />;
};

export default Icon;
