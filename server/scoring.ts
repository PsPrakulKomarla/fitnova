import { NutriGrade, NutriScoreBreakdown } from '../src/types/index.js';

export interface NutriInput {
  calories: number; // kcal per 100g
  sugarsG: number; // g per 100g
  saturatedFatG: number; // g per 100g
  sodiumMg: number; // mg per 100g
  fiberG: number; // g per 100g
  proteinG: number; // g per 100g
  fruitVegPercent: number; // 0 to 100%
  isBeverage?: boolean;
}

/**
 * Deterministic implementation of the official Revised Nutri-Score (v2023 Update)
 * for General Solid Foods.
 * 
 * Sources:
 * - Scientific Committee of the Nutri-Score: Update of the Nutri-Score algorithm for general foods (2023)
 * - Santé Publique France
 */
export function calculateNutriScore(input: NutriInput): NutriScoreBreakdown {
  // Energy in kJ (1 kcal = 4.184 kJ)
  const energyKj = Math.round(input.calories * 4.184);

  // 1. Negative points (N)
  // Energy points (0 - 10)
  let energyPoints = 0;
  if (energyKj > 3350) energyPoints = 10;
  else if (energyKj > 3015) energyPoints = 9;
  else if (energyKj > 2680) energyPoints = 8;
  else if (energyKj > 2345) energyPoints = 7;
  else if (energyKj > 2010) energyPoints = 6;
  else if (energyKj > 1675) energyPoints = 5;
  else if (energyKj > 1340) energyPoints = 4;
  else if (energyKj > 1005) energyPoints = 3;
  else if (energyKj > 670) energyPoints = 2;
  else if (energyKj > 335) energyPoints = 1;

  // Sugars points (0 - 15 in 2023 revised algorithm)
  let sugarsPoints = 0;
  const s = input.sugarsG;
  if (s > 51) sugarsPoints = 15;
  else if (s > 48) sugarsPoints = 14;
  else if (s > 44) sugarsPoints = 13;
  else if (s > 41) sugarsPoints = 12;
  else if (s > 37) sugarsPoints = 11;
  else if (s > 34) sugarsPoints = 10;
  else if (s > 31) sugarsPoints = 9;
  else if (s > 27) sugarsPoints = 8;
  else if (s > 24) sugarsPoints = 7;
  else if (s > 20) sugarsPoints = 6;
  else if (s > 17) sugarsPoints = 5;
  else if (s > 14) sugarsPoints = 4;
  else if (s > 10) sugarsPoints = 3;
  else if (s > 6.8) sugarsPoints = 2;
  else if (s > 3.4) sugarsPoints = 1;

  // Saturated fatty acids points (0 - 10)
  let satFatPoints = 0;
  const sf = input.saturatedFatG;
  if (sf > 10) satFatPoints = 10;
  else if (sf > 9) satFatPoints = 9;
  else if (sf > 8) satFatPoints = 8;
  else if (sf > 7) satFatPoints = 7;
  else if (sf > 6) satFatPoints = 6;
  else if (sf > 5) satFatPoints = 5;
  else if (sf > 4) satFatPoints = 4;
  else if (sf > 3) satFatPoints = 3;
  else if (sf > 2) satFatPoints = 2;
  else if (sf > 1) satFatPoints = 1;

  // Sodium points (0 - 20)
  let sodiumPoints = 0;
  const na = input.sodiumMg;
  if (na > 1800) sodiumPoints = 20;
  else if (na > 1620) sodiumPoints = 18;
  else if (na > 1440) sodiumPoints = 16;
  else if (na > 1260) sodiumPoints = 14;
  else if (na > 1080) sodiumPoints = 12;
  else if (na > 900) sodiumPoints = 10;
  else if (na > 810) sodiumPoints = 9;
  else if (na > 720) sodiumPoints = 8;
  else if (na > 630) sodiumPoints = 7;
  else if (na > 540) sodiumPoints = 6;
  else if (na > 450) sodiumPoints = 5;
  else if (na > 360) sodiumPoints = 4;
  else if (na > 270) sodiumPoints = 3;
  else if (na > 180) sodiumPoints = 2;
  else if (na > 90) sodiumPoints = 1;

  const totalNegative = energyPoints + sugarsPoints + satFatPoints + sodiumPoints;

  // 2. Positive points (P)
  // Fruit, vegetables, legumes, nuts % (0, 1, 2, 5 points)
  let fruitVegPoints = 0;
  const fv = input.fruitVegPercent;
  if (fv > 80) fruitVegPoints = 5;
  else if (fv > 60) fruitVegPoints = 2;
  else if (fv > 40) fruitVegPoints = 1;

  // Fiber points (0 - 5)
  let fiberPoints = 0;
  const fib = input.fiberG;
  if (fib > 7.4) fiberPoints = 5;
  else if (fib > 6.3) fiberPoints = 4;
  else if (fib > 5.2) fiberPoints = 3;
  else if (fib > 4.1) fiberPoints = 2;
  else if (fib > 3.0) fiberPoints = 1;

  // Protein points (0 - 7 in 2023 update)
  let rawProteinPoints = 0;
  const p = input.proteinG;
  if (p > 16.8) rawProteinPoints = 7;
  else if (p > 14.4) rawProteinPoints = 6;
  else if (p > 12.0) rawProteinPoints = 5;
  else if (p > 9.6) rawProteinPoints = 4;
  else if (p > 7.2) rawProteinPoints = 3;
  else if (p > 4.8) rawProteinPoints = 2;
  else if (p > 2.4) rawProteinPoints = 1;

  // 3. Protein Rule
  // If total negative points >= 11:
  // If fruit/veg points < 5, protein points are NOT counted (prevent masking high sugar/fat with added protein)
  let proteinExcluded = false;
  let effectiveProteinPoints = rawProteinPoints;
  if (totalNegative >= 11 && fruitVegPoints < 5) {
    proteinExcluded = true;
    effectiveProteinPoints = 0;
  }

  const totalPositive = fruitVegPoints + fiberPoints + effectiveProteinPoints;
  const finalScore = totalNegative - totalPositive;

  // 4. Grade Assignment for Solid Foods (2023 Revised thresholds)
  let grade: NutriGrade = 'A';
  if (finalScore <= -1) grade = 'A';
  else if (finalScore <= 2) grade = 'B';
  else if (finalScore <= 10) grade = 'C';
  else if (finalScore <= 18) grade = 'D';
  else grade = 'E';

  const limitations: string[] = [
    'Nutri-Score is evaluated on a standardized per-100g basis, not individual portion sizes.',
    'Evaluates overall nutritional quality; does not penalize non-nutritive sweeteners or bio-active micronutrient additives.',
    'Calculated using the official Santé Publique France Revised 2023 algorithm for solid general foods.'
  ];

  if (proteinExcluded) {
    limitations.push('Protein points were excluded from calculation because negative points reached 11+ and fruit/veg content was below 80% (standard anti-masking rule).');
  }

  return {
    score: finalScore,
    grade,
    methodology: 'Nutri-Score 2023 Revised Algorithm (Solid Foods)',
    negativePoints: {
      energyKj,
      energyPoints,
      sugarsG: input.sugarsG,
      sugarsPoints,
      saturatedFatG: input.saturatedFatG,
      saturatedFatPoints: satFatPoints,
      sodiumMg: input.sodiumMg,
      sodiumPoints,
      totalNegative
    },
    positivePoints: {
      fruitVegPercent: input.fruitVegPercent,
      fruitVegPoints,
      fiberG: input.fiberG,
      fiberPoints,
      proteinG: input.proteinG,
      proteinPoints: effectiveProteinPoints,
      totalPositive
    },
    proteinExcluded,
    limitations
  };
}
