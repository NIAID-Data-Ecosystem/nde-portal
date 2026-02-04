import { useCallback, useEffect, useRef, useState } from 'react';
import BaseBrush from '@visx/brush/lib/BaseBrush';

const BRUSH_STATES = ['brush', 'left', 'right'];

interface UseBrushKeyboardNavigationConfig {
  // Required refs
  chartRef: React.RefObject<HTMLDivElement>;
  brushRef: React.RefObject<BaseBrush | null>;

  // Scale and dimensions
  xScale: any;
  width: number;
  height: number;

  // Focus state
  isFocused: boolean;

  // Update strategy: 'debounced' or 'immediate'
  updateStrategy: 'debounced' | 'immediate';

  // For debounced strategy: callback and delay
  onUpdateDebounced?: (params: any) => void;
  debounceDelay?: number;

  // For immediate strategy: update function
  onUpdateImmediate?: (newStartX: number, newEndX: number) => void;

  // Optional: custom step calculation
  getStep?: () => number;

  // Optional: custom bounds calculation
  getBounds?: () => { xMax: number; yMax: number };

  // Optional: block onChange during keyboard nav (for date-brush pattern)
  blockOnChange?: boolean;

  // Optional: additional data for debounced updates
  additionalData?: any;
}

interface KeyboardNavigationReturn {
  activeState: number | null;
  activeHandle: string | null;
  isKeyboardNavigating: boolean;
}

export const useBrushKeyboardNavigation = ({
  chartRef,
  brushRef,
  xScale,
  width,
  height,
  isFocused,
  updateStrategy,
  onUpdateDebounced,
  debounceDelay = 500,
  onUpdateImmediate,
  getStep,
  getBounds,
  blockOnChange = false,
  additionalData,
}: UseBrushKeyboardNavigationConfig): KeyboardNavigationReturn => {
  const [activeState, setActiveState] = useState<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isKeyboardNavigating = useRef(false);

  // Calculate step based on scale or custom function
  const calculateStep = useCallback(() => {
    if (getStep) return getStep();
    return xScale?.bandwidth() || 1;
  }, [xScale, getStep]);

  // Calculate bounds
  const calculateBounds = useCallback(() => {
    if (getBounds) return getBounds();
    return { xMax: width, yMax: height };
  }, [width, height, getBounds]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!brushRef.current) return;

      const { key, shiftKey } = event;
      const step = calculateStep();
      const { xMax, yMax } = calculateBounds();

      const startX = brushRef.current.state?.start?.x ?? 0;
      const endX = brushRef.current.state?.end?.x ?? 0;

      let newStartX = startX;
      let newEndX = endX;

      // Handle Tab navigation
      if (shiftKey && key === 'Tab') {
        if (isFocused && (activeState === null || activeState === 0)) {
          return;
        }
        const currentIndex = activeState ?? 0;
        const nextIndex =
          (currentIndex - 1 + BRUSH_STATES.length) % BRUSH_STATES.length;
        setActiveState(nextIndex);
        event.preventDefault();
        return;
      } else if (key === 'Tab') {
        if (activeState === BRUSH_STATES.length - 1) {
          setActiveState(null);
          return;
        }
        const currentIndex = activeState ?? 0;
        const nextIndex = (currentIndex + 1) % BRUSH_STATES.length;
        setActiveState(nextIndex);
        event.preventDefault();
        return;
      }

      // Handle arrow key navigation
      if (isFocused) {
        // Move entire brush
        if (activeState === null || activeState === 0) {
          if (key === 'ArrowLeft') {
            newStartX = Math.max(0, startX - step);
            newEndX = Math.max(step, endX - step);
          } else if (key === 'ArrowRight') {
            newStartX = Math.min(endX, startX + step);
            newEndX = Math.min(xMax, endX + step);
          } else {
            return;
          }
        }
        // Move left handle
        else if (activeState === 1) {
          if (key === 'ArrowLeft') {
            newStartX = Math.max(0, startX - step);
          } else if (key === 'ArrowRight') {
            newStartX = Math.min(endX, startX + step);
          } else {
            return;
          }
        }
        // Move right handle
        else if (activeState === 2) {
          if (key === 'ArrowLeft') {
            newEndX = Math.max(startX + step, endX - step);
          } else if (key === 'ArrowRight') {
            newEndX = Math.min(xMax, endX + step);
          } else {
            return;
          }
        }

        event.preventDefault();

        // Mark as keyboard navigating if blockOnChange is enabled
        if (blockOnChange) {
          isKeyboardNavigating.current = true;
        }

        // Execute update based on strategy
        if (updateStrategy === 'immediate') {
          // Cancel previous animation frame
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }

          // Use requestAnimationFrame for immediate updates
          animationFrameRef.current = requestAnimationFrame(() => {
            if (!brushRef.current) return;
            brushRef.current.reset?.();

            const brushY0 = 0;
            const brushY1 = yMax;

            const newState = {
              bounds: { x0: 0, x1: xMax, y0: brushY0, y1: brushY1 },
              start: { x: newStartX, y: brushY0 },
              end: { x: newEndX, y: brushY1 },
              isBrushing: false,
              dragHandle: null,
              activeHandle: null,
              extent: { x0: newStartX, x1: newEndX, y0: brushY0, y1: brushY1 },
            };

            brushRef.current.updateBrush?.(newState);

            if (onUpdateImmediate) {
              onUpdateImmediate(newStartX, newEndX);
            }
          });
        } else if (updateStrategy === 'debounced') {
          // Clear previous debounce timeout
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }

          // Update brush immediately (visual feedback)
          const brushY0 = 0;
          const brushY1 = yMax;

          const newState = {
            bounds: { x0: 0, x1: xMax, y0: brushY0, y1: brushY1 },
            start: { x: newStartX, y: brushY0 },
            end: { x: newEndX, y: brushY1 },
            isBrushing: false,
            dragHandle: null,
            activeHandle: null,
            extent: { x0: newStartX, x1: newEndX, y0: brushY0, y1: brushY1 },
          };

          brushRef.current.updateBrush?.(newState);

          // Call immediate update if provided
          if (onUpdateImmediate) {
            onUpdateImmediate(newStartX, newEndX);
          }

          // Debounce the final callback
          debounceTimeoutRef.current = setTimeout(() => {
            if (onUpdateDebounced) {
              onUpdateDebounced({ newStartX, newEndX, ...additionalData });
            }
            if (blockOnChange) {
              isKeyboardNavigating.current = false;
            }
          }, debounceDelay);
        }
      }
    },
    [
      brushRef,
      calculateStep,
      calculateBounds,
      isFocused,
      activeState,
      updateStrategy,
      onUpdateDebounced,
      onUpdateImmediate,
      debounceDelay,
      blockOnChange,
      additionalData,
    ],
  );

  // Reset active state when focus is lost
  useEffect(() => {
    if (!isFocused) {
      setActiveState(null);

      // If debounced strategy and keyboard navigating, trigger update immediately on blur
      if (
        updateStrategy === 'debounced' &&
        blockOnChange &&
        isKeyboardNavigating.current
      ) {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        if (onUpdateDebounced) {
          const startX = brushRef.current?.state?.start?.x ?? 0;
          const endX = brushRef.current?.state?.end?.x ?? 0;
          onUpdateDebounced({
            newStartX: startX,
            newEndX: endX,
            ...additionalData,
          });
        }
        isKeyboardNavigating.current = false;
      }
    }
  }, [
    isFocused,
    updateStrategy,
    blockOnChange,
    onUpdateDebounced,
    additionalData,
    brushRef,
  ]);

  // Add keyboard event listeners
  useEffect(() => {
    const node = chartRef.current;
    if (!node) return;
    node.addEventListener('keydown', handleKeyDown);
    return () => {
      node.removeEventListener('keydown', handleKeyDown);
    };
  }, [chartRef, handleKeyDown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Calculate active handle for visual feedback
  const activeHandle =
    !isFocused || activeState === null || activeState === 0
      ? null
      : BRUSH_STATES[activeState];

  return {
    activeState,
    activeHandle,
    isKeyboardNavigating: isKeyboardNavigating.current,
  };
};
