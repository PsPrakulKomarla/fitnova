import { DataSourceType, VerificationState } from './sources.js';

export interface FieldProvenance {
  field: string;
  value: unknown;
  unit?: string;
  basis?: 'per_100g' | 'per_serving' | 'per_100ml';
  sourceType: DataSourceType;
  sourceId: string;
  sourceVersion: string;
  sourceUrl?: string;
  retrievedAt: string;
  observedAt?: string;
  verificationStatus: VerificationState;
  confidence: number; // 0.0 to 1.0
  observationId?: string;
  productVersionId?: string;
  notes?: string;
}

export class ProvenanceTracker {
  private records: FieldProvenance[] = [];

  record(prov: FieldProvenance) {
    this.records.push({
      ...prov,
      retrievedAt: prov.retrievedAt || new Date().toISOString()
    });
  }

  getHistoryForField(field: string): FieldProvenance[] {
    return this.records.filter((r) => r.field === field);
  }

  getLatestForField(field: string): FieldProvenance | undefined {
    const list = this.getHistoryForField(field);
    return list[list.length - 1];
  }

  getAll(): FieldProvenance[] {
    return [...this.records];
  }
}
