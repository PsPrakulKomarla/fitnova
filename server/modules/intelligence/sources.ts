/**
 * Phase 4 Data Intelligence: Source Hierarchy & Verification States
 */

export type DataSourceType =
  | 'PRODUCT_LABEL'
  | 'MANUFACTURER_DATA'
  | 'FSSAI'
  | 'ICMR_NIN_IFCT'
  | 'USDA_FDC'
  | 'OPEN_FOOD_FACTS'
  | 'SCIENTIFIC_LITERATURE'
  | 'USER_PROVIDED'
  | 'AI_INFERENCE'
  | 'OTHER_TRUSTED_REFERENCE';

export type VerificationState =
  | 'VERIFIED'
  | 'OBSERVED'
  | 'REFERENCE'
  | 'ESTIMATED'
  | 'UNVERIFIED'
  | 'CONFLICT'
  | 'UNKNOWN';

export type ConflictResolutionStatus =
  | 'UNRESOLVED'
  | 'RESOLVED_BY_PRIMARY_SOURCE'
  | 'RESOLVED_BY_VERIFICATION'
  | 'SUPERSEDED'
  | 'IGNORED_WITH_REASON';

export type StalenessStatus = 'FRESH' | 'AGING' | 'STALE' | 'UNKNOWN';

export type DataQualityGrade = 'HIGH_CONFIDENCE' | 'MEDIUM_CONFIDENCE' | 'LOW_CONFIDENCE' | 'INSUFFICIENT_DATA';

/**
 * Strict Authority Hierarchy:
 * 1. PRODUCT_LABEL / MANUFACTURER_DATA (Primary observation for packaged items)
 * 2. FSSAI (Official regulatory standard for Indian foods)
 * 3. ICMR_NIN_IFCT (Official reference composition for Indian whole foods)
 * 4. USDA_FDC (International composition reference)
 * 5. SCIENTIFIC_LITERATURE (Peer-reviewed evidence)
 * 6. OPEN_FOOD_FACTS (Crowd-sourced reference cross-check)
 * 7. USER_PROVIDED
 * 8. AI_INFERENCE (Estimates only; never authoritative over facts)
 */
export const SOURCE_HIERARCHY_RANK: Record<DataSourceType, number> = {
  PRODUCT_LABEL: 100,
  MANUFACTURER_DATA: 95,
  FSSAI: 90,
  ICMR_NIN_IFCT: 85,
  USDA_FDC: 80,
  SCIENTIFIC_LITERATURE: 75,
  OPEN_FOOD_FACTS: 60,
  OTHER_TRUSTED_REFERENCE: 50,
  USER_PROVIDED: 40,
  AI_INFERENCE: 20
};

export function getSourcePriority(type: DataSourceType): number {
  return SOURCE_HIERARCHY_RANK[type] || 0;
}
