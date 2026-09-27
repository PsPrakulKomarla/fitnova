/**
 * Extension Point: Recommendations & Evidence Domains
 */
export interface IRecommendationDomainService {
  generateRecommendations(userId: string, currentGap: unknown): Promise<unknown[]>;
}

export interface IEvidenceDomainService {
  lookupIngredientEvidence(canonicalName: string): Promise<unknown>;
  validateHealthClaim(claimText: string): Promise<{ valid: boolean; strength: string }>;
}
