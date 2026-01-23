/**
 * Multi-Dimensional Attribute System - Dimension Registry
 * 
 * Single source of truth for all available dimensions and their rules.
 */

import { DimensionRegistry } from '@/types/attributes';

/**
 * The authoritative dimension registry
 * All validation is driven by this configuration
 */
export const DIMENSION_REGISTRY: DimensionRegistry = {
  timeOfDay: {
    label: 'Time of Day',
    values: ['tarwee2a', '8ada', '3asha'],
    multiSelect: true,
    mutuallyExclusive: false,
  },

  dietType: {
    label: 'Protein / Diet Type',
    values: ['chicken', 'meat', 'fish', 'vegan'],
    multiSelect: false,
    mutuallyExclusive: true,
    conflicts: [
      {
        values: ['vegan'],
        incompatibleWith: ['chicken', 'meat', 'fish'],
      },
    ],
  },

  source: {
    label: 'Food Source',
    values: ['homecooking', 'delivery'],
    multiSelect: true,
    mutuallyExclusive: false,
  },
};

/**
 * Helper function to get all valid dimension names
 */
export function getValidDimensions(): string[] {
  return Object.keys(DIMENSION_REGISTRY);
}

/**
 * Helper function to get all valid values for a dimension
 */
export function getValidValues(dimension: string): string[] | null {
  const def = DIMENSION_REGISTRY[dimension];
  return def ? def.values : null;
}

/**
 * Helper function to check if a dimension exists
 */
export function isDimensionValid(dimension: string): boolean {
  return dimension in DIMENSION_REGISTRY;
}

/**
 * Helper function to get dimension definition
 */
export function getDimensionDefinition(dimension: string) {
  return DIMENSION_REGISTRY[dimension];
}
