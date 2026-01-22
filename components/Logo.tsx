
import React from 'react';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const Logo: React.FC<Props> = ({ className = '', size = 'md', animated = true }) => {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-40 h-40'
  };

  return (
    <div className={`${sizes[size]} ${className} relative flex items-center justify-center`}>
      <svg 
        viewBox="0 0 100 110" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-xl ${animated ? 'animate-float' : ''}`}
      >
        {/* Ombre portée au sol pour l'effet de flottaison */}
        <ellipse cx="50" cy="105" rx="15" ry="3" fill="black" fillOpacity="0.1" />
        
        {/* Forme de la goutte - Couleur Rouge Sang Premium */}
        <path 
          d="M50 5C50 5 85 45 85 75C85 94.33 69.33 110 50 110C30.67 110 15 94.33 15 75C15 45 50 5 50 5Z" 
          fill="#E11D48" 
          className={animated ? 'animate-subtle-pulse' : ''}
        />
        
        {/* Reflet de brillance pour le relief */}
        <path 
          d="M32 75C32 75 32 85 45 92" 
          stroke="white" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeOpacity="0.4"
        />
        
        {/* Symbole Croix Médicale Blanche */}
        <path 
          d="M42 75H58M50 67V83" 
          stroke="white" 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeOpacity="0.9"
        />
      </svg>
    </div>
  );
};

export default Logo;
