import type { CartesianCoordinate, PolarCoordinate, FieldingPosition } from '../types/FieldingPosition';
import { DISTANCE_CATEGORIES, FIELD_REGIONS } from '../types/FieldingPosition';
import { FIELDING_POSITIONS } from '../constants/fieldingPositions';
import { FIELD_DIMENSIONS } from '../constants/dimensions';

/**
 * Convert cartesian coordinates to polar coordinates
 * @param cartesian The cartesian coordinates relative to center
 * @param centerX The x-coordinate of the center point
 * @param centerY The y-coordinate of the center point
 * @returns Polar coordinates with angle in degrees (0° at North/top, clockwise) and distance in yards
 */
export function cartesianToPolar(cartesian: CartesianCoordinate, centerX: number, centerY: number): PolarCoordinate {
  // Calculate relative to center
  const dx = cartesian.x - centerX;
  const dy = centerY - cartesian.y;  // Negate because canvas Y grows downward
  
  // Calculate angle in radians, then convert to degrees
  let angle = Math.atan2(dx, dy) * (180 / Math.PI);  // 0° at top, clockwise
  if (angle < 0) angle += 360;
  
  // Calculate distance in yards
  const distance = Math.sqrt(dx * dx + dy * dy) / FIELD_DIMENSIONS.PIXELS_PER_YARD;
  
  return { distance, angle };
}

/**
 * Convert polar coordinates to cartesian coordinates
 * @param polar Polar coordinates with angle in degrees (0° at North/top, clockwise) and distance in yards
 * @param centerX The x-coordinate of the center point
 * @param centerY The y-coordinate of the center point
 * @returns Cartesian coordinates relative to the center point
 */
export function polarToCartesian(polar: PolarCoordinate, centerX: number, centerY: number): CartesianCoordinate {
  // Convert angle to radians
  const radians = (polar.angle * Math.PI) / 180;
  
  // Convert distance to pixels
  const distance = polar.distance * FIELD_DIMENSIONS.PIXELS_PER_YARD;
  
  // Calculate x and y coordinates (0° at top, clockwise)
  const x = centerX + distance * Math.sin(radians);
  const y = centerY - distance * Math.cos(radians);  // Subtract because canvas Y grows downward
  
  return { x, y };
}

/**
 * Get the distance category for a given distance
 */
export function getDistanceCategory(distance: number): string {
  for (const [key, category] of Object.entries(DISTANCE_CATEGORIES)) {
    if (distance >= category.min && distance <= category.max) {
      return category.name;
    }
  }
  return 'Unknown';
}

/**
 * Get the field region for a given angle
 */
export function getFieldRegion(angle: number): string {
  for (const [key, region] of Object.entries(FIELD_REGIONS)) {
    if (region.min <= region.max) {
      if (angle >= region.min && angle <= region.max) {
        return region.name;
      }
    } else {
      // Handle case where region crosses 0/360 boundary
      if (angle >= region.min || angle <= region.max) {
        return region.name;
      }
    }
  }
  return 'Unknown';
}

/**
 * Find the closest standard fielding position to given coordinates
 */
export function findClosestPosition(polar: PolarCoordinate): FieldingPosition | null {
  let closestPosition: FieldingPosition | null = null;
  let minDistance = Number.MAX_VALUE;

  for (const position of FIELDING_POSITIONS) {
    const angleDiff = Math.min(
      Math.abs(position.polar.angle - polar.angle),
      Math.abs(position.polar.angle - polar.angle + 360),
      Math.abs(position.polar.angle - polar.angle - 360)
    );
    const distanceDiff = Math.abs(position.polar.distance - polar.distance);
    
    // Weight angle differences more than distance differences
    const totalDiff = (angleDiff * 2) + distanceDiff;
    
    if (totalDiff < minDistance) {
      minDistance = totalDiff;
      closestPosition = position;
    }
  }

  // Only return a position if it's reasonably close
  return minDistance < 45 ? closestPosition : null;
}

/**
 * Get all positions in a specific category and region
 */
export function getPositionsInCategoryAndRegion(
  distanceCategory: string,
  fieldRegion: string
): FieldingPosition[] {
  const category = Object.values(DISTANCE_CATEGORIES).find(c => c.name === distanceCategory);
  const region = Object.values(FIELD_REGIONS).find(r => r.name === fieldRegion);
  
  if (!category || !region) return [];

  return FIELDING_POSITIONS.filter(position => {
    const inCategory = position.polar.distance >= category.min && 
                      position.polar.distance <= category.max;
    
    let inRegion;
    if (region.min <= region.max) {
      inRegion = position.polar.angle >= region.min && 
                 position.polar.angle <= region.max;
    } else {
      inRegion = position.polar.angle >= region.min || 
                 position.polar.angle <= region.max;
    }
    
    return inCategory && inRegion;
  });
}

/**
 * Get standard positions for different field settings
 */
export function getFieldSetting(setting: 'test_attacking' | 'odi_powerplay' | 'death_overs'): FieldingPosition[] {
  switch (setting) {
    case 'test_attacking':
      return FIELDING_POSITIONS.filter(p => 
        p.type === 'mandatory' ||
        p.id.includes('slip') ||
        ['gully', 'point', 'cover', 'mid_off', 'mid_on'].includes(p.id)
      );
    
    case 'odi_powerplay':
      return FIELDING_POSITIONS.filter(p =>
        p.type === 'mandatory' ||
        ['first_slip', 'second_slip', 'point', 'cover', 'mid_off', 'mid_on', 'mid_wicket', 'fine_leg', 'third_man'].includes(p.id)
      );
    
    case 'death_overs':
      return FIELDING_POSITIONS.filter(p =>
        p.type === 'mandatory' ||
        p.id.startsWith('deep_') ||
        ['long_off', 'long_on', 'mid_off', 'mid_on'].includes(p.id)
      );
    
    default:
      return [];
  }
} 