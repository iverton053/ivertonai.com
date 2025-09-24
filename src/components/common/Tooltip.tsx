import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  className?: string;
  disabled?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'auto',
  delay = 500,
  className = '',
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState<{ top: number; left: number; position: string }>({
    top: 0,
    left: 0,
    position: 'top'
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let finalPosition = position;
    let top = 0;
    let left = 0;

    if (position === 'auto') {
      // Auto-calculate best position based on available space
      const spaceAbove = triggerRect.top;
      const spaceBelow = viewport.height - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewport.width - triggerRect.right;

      if (spaceAbove >= tooltipRect.height + 10) {
        finalPosition = 'top';
      } else if (spaceBelow >= tooltipRect.height + 10) {
        finalPosition = 'bottom';
      } else if (spaceRight >= tooltipRect.width + 10) {
        finalPosition = 'right';
      } else if (spaceLeft >= tooltipRect.width + 10) {
        finalPosition = 'left';
      } else {
        finalPosition = 'top'; // Default fallback
      }
    }

    // Calculate position based on determined placement
    switch (finalPosition) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + 8;
        break;
    }

    // Keep tooltip within viewport bounds
    left = Math.max(8, Math.min(left, viewport.width - tooltipRect.width - 8));
    top = Math.max(8, Math.min(top, viewport.height - tooltipRect.height - 8));

    setCalculatedPosition({ top, left, position: finalPosition });
  };

  const showTooltip = () => {
    if (disabled || !content.trim()) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      
      // Recalculate on window resize or scroll
      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowClasses = () => {
    const base = 'absolute w-2 h-2 transform rotate-45 bg-gray-800 border border-gray-600';
    switch (calculatedPosition.position) {
      case 'top':
        return `${base} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`;
      case 'bottom':
        return `${base} bottom-full left-1/2 -translate-x-1/2 translate-y-1/2`;
      case 'left':
        return `${base} left-full top-1/2 -translate-y-1/2 -translate-x-1/2`;
      case 'right':
        return `${base} right-full top-1/2 -translate-y-1/2 translate-x-1/2`;
      default:
        return base;
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && createPortal(
        <AnimatePresence>
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`fixed z-[9999] px-3 py-2 text-sm font-medium text-white bg-gray-800 border border-gray-600 rounded-lg shadow-lg pointer-events-none max-w-xs break-words ${className}`}
            style={{
              top: calculatedPosition.top,
              left: calculatedPosition.left,
            }}
          >
            {content}
            <div className={getArrowClasses()} />
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Tooltip;