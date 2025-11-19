import React from 'react';

interface FXUnlockedLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const FXUnlockedLogo: React.FC<FXUnlockedLogoProps> = ({ 
  className = '', 
  size = 'md',
}) => {
  const heights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16',
  };

  return (
    <div className={className}>
      <img 
        src="/fx-unlocked-logo.png" 
        alt="FX Unlocked" 
        className={`${heights[size]} w-auto object-contain`}
      />
    </div>
  );
};

export default FXUnlockedLogo;
