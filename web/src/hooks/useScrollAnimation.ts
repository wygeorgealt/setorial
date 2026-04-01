import { useEffect, useRef, useState } from 'react';
import { useSpring, config } from '@react-spring/web';

interface ScrollAnimationOptions {
  threshold?: number;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
  distance?: number;
}

export function useScrollAnimation({
  threshold = 0.1,
  delay = 0,
  direction = 'up',
  distance = 50,
}: ScrollAnimationOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optional: stop observing once visible
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        threshold,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const getTransform = () => {
    if (direction === 'none') return 'translate3d(0, 0, 0)';
    if (direction === 'up') return `translate3d(0, ${distance}px, 0)`;
    if (direction === 'left') return `translate3d(${distance}px, 0, 0)`;
    if (direction === 'right') return `translate3d(-${distance}px, 0, 0)`;
    return 'translate3d(0, 0, 0)';
  };

  const springs = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate3d(0, 0, 0)' : getTransform(),
    config: config.gentle,
    delay,
  });

  return { ref, springs, isVisible };
}
