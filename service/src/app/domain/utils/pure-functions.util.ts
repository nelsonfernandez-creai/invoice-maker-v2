// ============================================================================
// PURE FUNCTIONS - TYPE GUARDS
// ============================================================================

/**
 * Checks if an item exists
 * Pure function: null/undefined check
 */
export const itemExists = <T>(item: T | null | undefined): item is T => item !== null && item !== undefined;

// ============================================================================
// PURE FUNCTIONS - TIMESTAMP UTILITIES
// ============================================================================

/**
 * Gets current ISO timestamp
 * Note: Not pure due to Date dependency, but isolated for testability
 */
export const getCurrentTimestamp = (): string => new Date().toISOString();
