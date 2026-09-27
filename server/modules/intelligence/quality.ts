import { DataQualityGrade, VerificationState } from './sources.js';

export interface DataQualityReport {
  grade: DataQualityGrade;
  numericalScore: number; // 0 to 100
  dimensions: {
    sourceReliability: number; // 0 - 25
    recencyFreshness: number;  // 0 - 20
    verificationStatus: number;// 0 - 25
    fieldCompleteness: number; // 0 - 15
    extractionConfidence: number; // 0 - 15
  };
  explanation: string;
  recommendations: string[];
}

export function computeDataQuality(params: {
  verificationState: VerificationState;
  hasConflicts: boolean;
  missingFieldsCount: number;
  totalFieldsCount: number;
  extractionConfidence: number; // 0.0 to 1.0
  isFromOfficialSource: boolean;
}): DataQualityReport {
  // 1. Source Reliability (max 25)
  let sourceReliability = params.isFromOfficialSource ? 25 : 18;
  if (params.verificationState === 'ESTIMATED') sourceReliability = 12;

  // 2. Recency (max 20)
  const recencyFreshness = 18; // Freshly analyzed / current version

  // 3. Verification Status (max 25)
  let verificationPoints = 15;
  if (params.verificationState === 'VERIFIED') verificationPoints = 25;
  else if (params.verificationState === 'OBSERVED') verificationPoints = 20;
  else if (params.verificationState === 'CONFLICT') verificationPoints = 8;
  else if (params.verificationState === 'UNVERIFIED') verificationPoints = 10;

  // 4. Completeness (max 15)
  const completenessRatio = Math.max(0, 1 - (params.missingFieldsCount / Math.max(1, params.totalFieldsCount)));
  const fieldCompleteness = Math.round(completenessRatio * 15);

  // 5. Extraction Confidence (max 15)
  const extractionScore = Math.round(params.extractionConfidence * 15);

  const totalScore = Math.min(100, sourceReliability + recencyFreshness + verificationPoints + fieldCompleteness + extractionScore);

  let grade: DataQualityGrade = 'LOW_CONFIDENCE';
  if (totalScore >= 80 && !params.hasConflicts && params.missingFieldsCount <= 1) {
    grade = 'HIGH_CONFIDENCE';
  } else if (totalScore >= 60 && !params.hasConflicts) {
    grade = 'MEDIUM_CONFIDENCE';
  } else if (params.missingFieldsCount > 5 || params.verificationState === 'UNKNOWN') {
    grade = 'INSUFFICIENT_DATA';
  } else {
    grade = 'LOW_CONFIDENCE';
  }

  const recommendations: string[] = [];
  if (params.missingFieldsCount > 0) {
    recommendations.push(`Upload missing packaging panels to verify ${params.missingFieldsCount} unobserved nutrition fields.`);
  }
  if (params.hasConflicts) {
    recommendations.push('Review detected multi-source conflict records before relying on macro targets.');
  }

  return {
    grade,
    numericalScore: totalScore,
    dimensions: {
      sourceReliability,
      recencyFreshness,
      verificationStatus: verificationPoints,
      fieldCompleteness,
      extractionConfidence: extractionScore
    },
    explanation:
      grade === 'HIGH_CONFIDENCE'
        ? 'High data fidelity backed by verified label OCR and consistent reference composition.'
        : grade === 'MEDIUM_CONFIDENCE'
        ? 'Adequate observation from packaging; some minor optional micronutrient values unobserved.'
        : grade === 'INSUFFICIENT_DATA'
        ? 'Essential macro fields are missing. Values cannot be verified without additional photos.'
        : 'Conflicting or low-confidence optical readings detected.',
    recommendations
  };
}
