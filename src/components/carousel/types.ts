import React from 'react';

export interface CarouselProps {
  gap?: number;
  colorPalette?: string;
  children: React.ReactNode[];
  isLoading?: boolean;
}

export interface CarouselControlsProps {
  activeItem: number;
  maxActiveItem: number;
  constraint: number;
  totalDots: number;
  colorPalette: string;
  gap: number;
  handleDecrementClick: () => void;
  handleIncrementClick: () => void;
  handleDotClick: (index: number) => void;
  handleFocus: () => void;
  childrenLength: number;
  showProgressBar: boolean;
  progressPercentage: number;
  isLoading?: boolean;
}

export interface TrackProps {
  setTrackIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  trackIsActive: boolean;
  setActiveItem: React.Dispatch<React.SetStateAction<number>>;
  activeItem: number;
  constraint: number;
  multiplier?: number;
  positions: number[];
  children: React.ReactNode[];
  maxActiveItem: number;
}

export interface ItemProps {
  setTrackIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveItem: React.Dispatch<React.SetStateAction<number>>;
  trackIsActive: boolean;
  constraint: number;
  itemWidth: number;
  positions: number[];
  children: React.ReactNode;
  index: number;
  gap: number;
}

export interface DragEndInfo {
  point: { x: number; y: number };
  delta: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
}
