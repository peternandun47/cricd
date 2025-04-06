import type { CartesianCoordinate, PolarCoordinate, FieldingPosition, Range } from '../types/FieldingPosition';
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
  
  return { 
    distance: { min: distance, max: distance, preferred: distance },
    angle: { min: angle, max: angle, preferred: angle }
  };
}

/**
 * Convert polar coordinates to cartesian coordinates
 * @param polar Polar coordinates with angle in degrees (0° at North/top, clockwise) and distance in yards
 * @param centerX The x-coordinate of the center point
 * @param centerY The y-coordinate of the center point
 * @returns Cartesian coordinates relative to the center point
 */
export function polarToCartesian(polar: PolarCoordinate, centerX: number, centerY: number): CartesianCoordinate {
  // Use preferred values for conversion, fallback to min if preferred is undefined
  const angle = polar.angle.preferred ?? polar.angle.min;
  const distance = polar.distance.preferred ?? polar.distance.min;
  
  // Convert angle to radians
  const radians = (angle * Math.PI) / 180;
  
  // Convert distance to pixels
  const distancePixels = distance * FIELD_DIMENSIONS.PIXELS_PER_YARD;
  
  // Calculate x and y coordinates (0° at top, clockwise)
  const x = centerX + distancePixels * Math.sin(radians);
  const y = centerY - distancePixels * Math.cos(radians);  // Subtract because canvas Y grows downward
  
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
 * Check if a position is within its valid range
 */
export function isPositionInRange(position: FieldingPosition, polar: PolarCoordinate): boolean {
  // Get preferred values with fallback to min
  const currentDistance = polar.distance.preferred ?? polar.distance.min;
  const currentAngle = polar.angle.preferred ?? polar.angle.min;
  
  // Check if distance is within range
  const distanceInRange = currentDistance >= position.polar.distance.min && 
                         currentDistance <= position.polar.distance.max;
  
  // Check if angle is within range
  let angleInRange = false;
  if (position.polar.angle.min <= position.polar.angle.max) {
    angleInRange = currentAngle >= position.polar.angle.min && 
                  currentAngle <= position.polar.angle.max;
  } else {
    // Handle case where range crosses 0/360 boundary
    angleInRange = currentAngle >= position.polar.angle.min || 
                  currentAngle <= position.polar.angle.max;
  }
  
  return distanceInRange && angleInRange;
}

/**
 * Find the closest standard fielding position to given coordinates
 */
export function findClosestPosition(polar: PolarCoordinate): FieldingPosition | null {
  let closestPosition: FieldingPosition | null = null;
  let minDistance = Number.MAX_VALUE;

  for (const position of FIELDING_POSITIONS) {
    // Calculate angle difference (handling 0/360 boundary)
    const angleDiff = Math.min(
      Math.abs((position.polar.angle.preferred ?? position.polar.angle.min) - (polar.angle.preferred ?? polar.angle.min)),
      Math.abs((position.polar.angle.preferred ?? position.polar.angle.min) - (polar.angle.preferred ?? polar.angle.min) + 360),
      Math.abs((position.polar.angle.preferred ?? position.polar.angle.min) - (polar.angle.preferred ?? polar.angle.min) - 360)
    );
    
    // Calculate distance difference
    const distanceDiff = Math.abs(
      (position.polar.distance.preferred ?? position.polar.distance.min) - 
      (polar.distance.preferred ?? polar.distance.min)
    );
    
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
    const preferredDistance = position.polar.distance.preferred ?? position.polar.distance.min;
    const preferredAngle = position.polar.angle.preferred ?? position.polar.angle.min;
    
    const inCategory = preferredDistance >= category.min && 
                      preferredDistance <= category.max;
    
    let inRegion;
    if (region.min <= region.max) {
      inRegion = preferredAngle >= region.min && 
                 preferredAngle <= region.max;
    } else {
      inRegion = preferredAngle >= region.min || 
                 preferredAngle <= region.max;
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