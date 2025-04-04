export interface CartesianCoordinate {
  x: number;
  y: number;
}

export interface PolarCoordinate {
  distance: number;  // percentage of field radius (0-100)
  angle: number;    // degrees (0-360)
}

export type FieldingSide = 'off' | 'leg' | 'neutral';
export type PositionType = 'mandatory' | 'primary' | 'variation';

export interface FieldingPosition {
  id: string;
  name: string;
  cartesian?: CartesianCoordinate;
  polar: PolarCoordinate;
  type: PositionType;
  side: FieldingSide;
  description: string;
  common_situations: string[];
}

export interface DistanceCategory {
  name: string;
  min: number;
  max: number;
}

export interface AngleRegion {
  name: string;
  min: number;
  max: number;
}

// Constants for categorizing positions
export const DISTANCE_CATEGORIES: Record<string, DistanceCategory> = {
  VERY_CLOSE: { name: 'Very Close', min: 0, max: 30 },
  CLOSE: { name: 'Close', min: 31, max: 50 },
  MIDDLE: { name: 'Middle', min: 51, max: 70 },
  DEEP: { name: 'Deep', min: 71, max: 100 }
} as const;

export const FIELD_REGIONS: Record<string, AngleRegion> = {
  STRAIGHT_DOWN: { name: 'Straight Down the Pitch', min: 345, max: 15 },
  LEG_SIDE: { name: 'On (Leg) Side', min: 16, max: 179 },
  OFF_SIDE: { name: 'Off Side', min: 180, max: 344 }
} as const; 