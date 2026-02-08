import { useState, useEffect } from 'react';

export function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isLand = window.innerWidth > window.innerHeight;
      const isMobile = window.innerWidth < 1024;
      // For iPhone 15 Pro: viewport is 393x852 portrait, ~852x393 landscape
      // We consider mobile landscape when height is less than 500
      
      setIsLandscape(isLand);
      setIsMobileLandscape(isLand && isMobile && window.innerHeight < 600);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return { isLandscape, isMobileLandscape };
}
