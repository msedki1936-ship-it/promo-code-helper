import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function useSwipeNavigation(
  onLeft: () => void, 
  onRight: () => void,
  threshold: number = 60
): SwipeHandlers {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (startX.current === null || startY.current === null) return;
    
    // Determine swipe direction on first move
    if (isHorizontalSwipe.current === null) {
      const dx = Math.abs(e.touches[0].clientX - startX.current);
      const dy = Math.abs(e.touches[0].clientY - startY.current);
      
      // If horizontal movement is greater, it's a horizontal swipe
      if (dx > 10 || dy > 10) {
        isHorizontalSwipe.current = dx > dy;
      }
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (startX.current === null) return;
    
    // Only trigger swipe if it was determined to be horizontal
    if (isHorizontalSwipe.current === true) {
      const dx = e.changedTouches[0].clientX - startX.current;
      if (Math.abs(dx) > threshold) {
        if (dx < 0) {
          onLeft(); // Swipe left = next
        } else {
          onRight(); // Swipe right = previous
        }
      }
    }
    
    startX.current = null;
    startY.current = null;
    isHorizontalSwipe.current = null;
  }, [onLeft, onRight, threshold]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
