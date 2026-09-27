import { ExposureHorizon } from '../src/types/index.js';

export function calculateExposureScenarios(
  servingName: string,
  proteinG: number,
  sugarsG: number,
  sodiumMg: number,
  saturatedFatG: number
): ExposureHorizon[] {
  // Horizons: Today (1 serving), 30 Days (30), 1 Year (365), 5 Years (1825), 10 Years (3650)
  const formatKg = (grams: number) => {
    if (grams < 1000) return `${Math.round(grams)}g`;
    return `${(grams / 1000).toFixed(1)} kg`;
  };

  return [
    {
      horizon: 'Today',
      intakeAmount: '1 single serving (current entry)',
      mathematicalAccumulation: `Intake from this item: ${proteinG}g protein, ${sugarsG}g sugars, ${sodiumMg}mg sodium, ${saturatedFatG}g saturated fat.`,
      evidenceContext: 'Acute postprandial response: amino acid peak occurs within 90-180 minutes; glycemic peak within 45 minutes.',
      uncertaintyNotes: 'Measured from single logged portion. Actual absorption rate depends on co-ingested meal matrix.'
    },
    {
      horizon: '30 Days',
      intakeAmount: 'Daily recurring pattern (30 servings)',
      mathematicalAccumulation: `Cumulative intake: ${formatKg(proteinG * 30)} protein, ${formatKg(sugarsG * 30)} sugars, ${((sodiumMg * 30) / 1000).toFixed(1)}g sodium.`,
      evidenceContext: 'Sub-acute physiological adaptation: consistent daily protein supports skeletal muscle amino acid kinetics; sodium flux is buffered by renal autoregulation.',
      uncertaintyNotes: 'Assumes habitual consumption 7 days/week without dietary rotation.'
    },
    {
      horizon: '1 Year',
      intakeAmount: '365 recurring daily servings',
      mathematicalAccumulation: `Cumulative intake: ${formatKg(proteinG * 365)} protein, ${formatKg(sugarsG * 365)} sugars, ${formatKg((sodiumMg * 365) / 1000)} sodium.`,
      evidenceContext: 'Epidemiological cohort observation: diets maintaining sustained protein intake of >1.6g/kg combined with resistance stimulus demonstrate sustained lean mass preservation (Morton et al., 2018). Moderate free sugars (<10% total energy) show no adverse metabolic markers in randomized interventions.',
      uncertaintyNotes: 'Mathematical extrapolation. In reality, human dietary patterns exhibit seasonal and weekly variation.'
    },
    {
      horizon: '5 Years',
      intakeAmount: '1,825 recurring daily servings',
      mathematicalAccumulation: `Cumulative intake: ${formatKg(proteinG * 1825)} protein, ${formatKg(sugarsG * 1825)} sugars, ${formatKg((sodiumMg * 1825) / 1000)} sodium.`,
      evidenceContext: 'Long-term nutritional epidemiology: cumulative dietary quality (such as Mediterranean or DASH dietary scores) correlates with cardiovascular and metabolic resilience. Population data emphasizes total dietary pattern over any isolated single food product.',
      uncertaintyNotes: 'High uncertainty: does not account for age-related metabolic shifts, lifestyle alterations, or compensatory dietary adjustments.'
    },
    {
      horizon: '10 Years',
      intakeAmount: '3,650 recurring daily servings',
      mathematicalAccumulation: `Cumulative intake: ${formatKg(proteinG * 3650)} protein, ${formatKg(sugarsG * 3650)} sugars, ${formatKg((sodiumMg * 3650) / 1000)} sodium.`,
      evidenceContext: 'Multi-decade prospective studies (e.g. Nurses Health Study, EPIC cohort) demonstrate that chronic habitual intake patterns influence risk biomarkers. Evidence is strictly probabilistic at the population level and cannot predict individual clinical outcomes.',
      uncertaintyNotes: 'Theoretical scenario model. Deterministic math models exposure volume, NOT medical prognosis.'
    }
  ];
}
