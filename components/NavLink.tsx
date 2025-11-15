
import React from 'react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({ href, children, className, onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If a custom onClick is provided, use it for navigation
    if (onClick) {
      e.preventDefault();
      onClick();
      return;
    }

    // Otherwise, perform default scroll behavior
    if (href.startsWith('#')) {
      e.preventDefault();
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      } else if (href === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};
