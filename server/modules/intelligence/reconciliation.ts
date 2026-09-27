import { ConflictResolutionStatus, DataSourceType, getSourcePriority } from './sources.js';
import { FieldProvenance } from './provenance.js';

export interface DataConflict {
  id: string;
  field: string;
  sourceA: {
    type: DataSourceType;
    id: string;
    version: string;
    value: unknown;
  };
  sourceB: {
    type: DataSourceType;
    id: string;
    version: string;
    value: unknown;
  };
  relativeDifferencePercent?: number;
  detectedAt: string;
  resolutionStatus: ConflictResolutionStatus;
  resolutionReason: string;
  preferredValue?: unknown;
}

export class ReconciliationEngine {
  /**
   * Evaluates candidate facts from multiple data sources for a single field.
   * If numerical values diverge by more than threshold (default 5%), flags an explicit conflict.
   */
  evaluateField(field: string, observations: FieldProvenance[]): {
    chosenValue: unknown;
    hasConflict: boolean;
    conflictRecord?: DataConflict;
  } {
    if (observations.length === 0) {
      return { chosenValue: null, hasConflict: false };
    }

    if (observations.length === 1) {
      return { chosenValue: observations[0].value, hasConflict: false };
    }

    // Sort by source hierarchy rank (highest priority first)
    const sorted = [...observations].sort(
      (a, b) => getSourcePriority(b.sourceType) - getSourcePriority(a.sourceType)
    );

    const primary = sorted[0];
    const secondary = sorted[1];

    // Check if numerical values differ significantly
    if (typeof primary.value === 'number' && typeof secondary.value === 'number') {
      const diff = Math.abs(primary.value - secondary.value);
      const avg = (primary.value + secondary.value) / 2;
      const pct = avg > 0 ? (diff / avg) * 100 : 0;

      if (pct > 5.0) {
        // Significant divergence! Conflict detected.
        // We do NOT let an AI silently overwrite; we record the exact conflict.
        const conflict: DataConflict = {
          id: `conf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          field,
          sourceA: {
            type: primary.sourceType,
            id: primary.sourceId,
            version: primary.sourceVersion,
            value: primary.value
          },
          sourceB: {
            type: secondary.sourceType,
            id: secondary.sourceId,
            version: secondary.sourceVersion,
            value: secondary.value
          },
          relativeDifferencePercent: Math.round(pct * 10) / 10,
          detectedAt: new Date().toISOString(),
          resolutionStatus:
            primary.sourceType === 'PRODUCT_LABEL'
              ? 'RESOLVED_BY_PRIMARY_SOURCE'
              : 'UNRESOLVED',
          resolutionReason:
            primary.sourceType === 'PRODUCT_LABEL'
              ? `Product package label (${primary.value}) prioritized over external reference (${secondary.value}, ${secondary.sourceType}). Difference of ${pct.toFixed(1)}% flagged for audit.`
              : `Discrepancy of ${pct.toFixed(1)}% between ${primary.sourceType} (${primary.value}) and ${secondary.sourceType} (${secondary.value}). Unresolved without lab assay.`,
          preferredValue: primary.value
        };

        return {
          chosenValue: primary.value,
          hasConflict: true,
          conflictRecord: conflict
        };
      }
    }

    // No significant conflict
    return { chosenValue: primary.value, hasConflict: false };
  }
}

export const reconciliationEngine = new ReconciliationEngine();
