
import React from 'react';
import { cn } from '@/lib/utils';

interface MotionProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  duration?: number;
  animation?: 'fade-in' | 'scale-in' | 'slide-in' | 'float';
  children: React.ReactNode;
}

export const Motion: React.FC<MotionProps> = ({
  delay = 0,
  duration = 0.3,
  animation = 'fade-in',
  className,
  children,
  ...props
}) => {
  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-in':
        return 'animate-fade-in';
      case 'scale-in':
        return 'animate-scale-in';
      case 'slide-in':
        return 'animate-slide-in-right';
      case 'float':
        return 'animate-float';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <div
      className={cn(getAnimationClass(), className)}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
