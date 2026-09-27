import { FoodItemData, UserProfile, DailyProgressData, EvidenceLevel } from '../../../src/types/index.js';
import { database } from '../../core/database.js';
import { db } from '../../db.js';
import {
  AllergyWarning,
  ExplainableRecommendation,
  FoodToBodySystemPathway,
  MedicalConstraintWarning,
  MealImprovementSuggestion,
  PersonalizedIntelligenceResult
} from './recommendations.models.js';

export class RecommendationService {
  /**
   * Run full Phase 5 Personalized Intelligence Loop:
   * USER PROFILE -> PERSONAL GOAL -> FOOD IDENTIFICATION -> NUTRITION + INGREDIENT ANALYSIS ->
   * COMPARE WITH TARGETS -> IDENTIFY GAPS -> RECOMMEND NEXT ACTION -> EXPLAIN WHY
   */
  public evaluate(params: {
    userId: string;
    foodItem: FoodItemData;
    dailyProgress?: DailyProgressData;
  }): PersonalizedIntelligenceResult {
    const { userId, foodItem } = params;

    // 1. Fetch user profile and active plan
    const profile: UserProfile = database.profiles.get(userId) || db.getUserProfile(userId) || {
      id: userId,
      name: 'User',
      email: 'user@emberground.dev',
      age: 28,
      gender: 'male',
      heightCm: 180,
      weightKg: 78,
      activityLevel: 'moderate',
      goal: 'muscle_gain',
      dietaryPreference: 'standard',
      allergies: [],
      foodPreferences: [],
      trainingExperience: 'intermediate',
      availableTrainingDays: 4,
      equipment: [],
      healthConstraints: [],
      safetyNotes: '',
      createdAt: new Date().toISOString()
    };

    const plan = database.plans.get(userId) || db.getPlan(userId) || {
      id: `plan-${userId}`,
      userId,
      version: 1,
      bmr: 1770,
      tdee: 2744,
      dailyTargets: {
        calories: 2500,
        proteinG: 156,
        carbsG: 280,
        fatG: 70,
        fiberG: 35,
        waterMl: 3000
      },
      workoutSchedule: [],
      rationale: 'Active plan',
      status: 'active' as const,
      createdAt: new Date().toISOString()
    };

    const today = new Date().toISOString().split('T')[0];
    const progress: DailyProgressData = params.dailyProgress || db.getDailyProgress(userId, today);

    // 2. Allergy & Intolerance Cross-Referencing
    const allergyWarnings = this.checkAllergens(foodItem, profile.allergies);

    // 3. Clinical & Medical Constraints Check
    const medicalWarnings = this.checkMedicalConstraints(foodItem, profile);

    // 4. Multi-metric Nutrition Gap Computation
    const targets = plan.dailyTargets;
    const currentProtein = progress.consumedProtein || 0;
    const foodProtein = foodItem.proteinG || 0;
    const newProteinTotal = currentProtein + foodProtein;
    const remainingProtein = Math.max(0, targets.proteinG - newProteinTotal);

    const currentCalories = progress.consumedCalories || 0;
    const foodCalories = foodItem.calories || 0;
    const newCaloriesTotal = currentCalories + foodCalories;
    const remainingCalories = targets.calories - newCaloriesTotal;

    const remainingFiber = Math.max(0, (targets.fiberG || 35) - (foodItem.fiberG || 0));
    const currentSodiumMg = (foodItem.sodiumMg || 0);
    const dailySodiumLimitMg = profile.healthConstraints.some(c => c.toLowerCase().includes('hypertension')) ? 1800 : 2300;
    const sodiumAllowanceRemainingMg = Math.max(0, dailySodiumLimitMg - currentSodiumMg);

    // Determine Gap Severity
    let severity: PersonalizedIntelligenceResult['gapAnalysis']['severity'] = 'on_track';
    if (allergyWarnings.some(w => w.severity === 'FATAL' || w.severity === 'WARNING')) {
      severity = 'allergen_alert';
    } else if (medicalWarnings.length > 0) {
      severity = 'medical_boundary';
    } else if (remainingProtein > 45 && remainingCalories < 400) {
      severity = 'high_gap'; // Low calorie budget left but large protein deficit
    } else if (remainingProtein > 30) {
      severity = 'moderate_gap';
    } else if (remainingCalories < -200) {
      severity = 'exceeded';
    } else {
      severity = 'on_track';
    }

    // Dynamic Summary
    let summary = '';
    if (severity === 'allergen_alert') {
      const detected = allergyWarnings.map(w => w.allergenDetected).join(', ');
      summary = `SAFETY ALERT: Potential allergen conflict detected (${detected}). Review ingredient list before consumption.`;
    } else if (severity === 'medical_boundary') {
      summary = `CLINICAL CAUTION: Food exceeds personal medical boundary for ${medicalWarnings.map(m => m.condition).join(', ')}.`;
    } else if (remainingProtein <= 5 && Math.abs(remainingCalories) <= 150) {
      summary = `Outstanding macro alignment! "${foodItem.name}" lands you at ${newProteinTotal}g of ${targets.proteinG}g protein target right within your caloric target.`;
    } else if (remainingProtein > 0) {
      summary = `With "${foodItem.name}" logged, your daily protein stands at ${newProteinTotal}g / ${targets.proteinG}g (${remainingProtein}g needed). You have ${remainingCalories > 0 ? remainingCalories : 0} kcal remaining.`;
    } else {
      summary = `Protein target of ${targets.proteinG}g secured! Caloric balance: ${remainingCalories} kcal.`;
    }

    // 5. Generate Explainable Recommendations with "WHY" Rationale & Evidence Grading
    const explainableRecommendations = this.generateExplainableRecommendations(
      profile,
      remainingProtein,
      remainingCalories,
      foodItem
    );

    // 6. Generate Meal Improvement Suggestions
    const mealImprovements = this.generateMealImprovements(foodItem, profile);

    // 7. Generate Food -> Nutrient -> Body System Physiological Pathways
    const bodyPathways = this.generateBodySystemPathways(foodItem);

    return {
      userId,
      foodName: foodItem.name,
      confidence: foodItem.confidence,
      allergyWarnings,
      medicalWarnings,
      nutriGrade: foodItem.nutriScore?.grade || 'C',
      gapAnalysis: {
        targetProtein: targets.proteinG,
        currentProtein,
        foodProtein,
        newProteinTotal,
        remainingProtein,
        targetCalories: targets.calories,
        currentCalories,
        foodCalories,
        newCaloriesTotal,
        remainingCalories,
        remainingFiber,
        currentSodiumMg,
        sodiumAllowanceRemainingMg,
        severity,
        summary
      },
      explainableRecommendations,
      mealImprovements,
      bodyPathways,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Comprehensive Allergen Matching with synonyms and derivatives
   */
  public checkAllergens(food: FoodItemData, userAllergies: string[]): AllergyWarning[] {
    const warnings: AllergyWarning[] = [];
    if (!userAllergies || userAllergies.length === 0) return warnings;

    const rawLower = (food.rawLabelIngredients || '').toLowerCase() + ' ' + (food.name || '').toLowerCase();
    const ingredientNames = (food.ingredients || []).map(i => (i.canonicalName + ' ' + i.originalText).toLowerCase());
    const fullText = `${rawLower} ${ingredientNames.join(' ')}`;

    const ALLERGEN_MAP: Record<string, string[]> = {
      dairy: ['milk', 'whey', 'casein', 'caseinate', 'lactose', 'cheese', 'butter', 'cream', 'yogurt', 'curd', 'paneer', 'ghee'],
      milk: ['milk', 'whey', 'casein', 'caseinate', 'lactose', 'cheese', 'butter', 'cream', 'yogurt', 'curd', 'paneer', 'ghee'],
      lactose: ['lactose', 'milk', 'whey', 'cream'],
      peanuts: ['peanut', 'peanuts', 'groundnut', 'arachis oil'],
      peanut: ['peanut', 'peanuts', 'groundnut', 'arachis oil'],
      tree_nuts: ['almond', 'cashew', 'walnut', 'pistachio', 'hazelnut', 'pecan', 'macadamia', 'brazil nut'],
      nuts: ['almond', 'cashew', 'walnut', 'pistachio', 'hazelnut', 'pecan', 'macadamia', 'brazil nut', 'peanut'],
      gluten: ['wheat', 'gluten', 'barley', 'rye', 'malt', 'spelt', 'semolina', 'atta', 'maida'],
      wheat: ['wheat', 'gluten', 'semolina', 'atta', 'maida', 'spelt', 'durum'],
      soy: ['soy', 'soya', 'soybean', 'edamame', 'tofu', 'soy lecithin', 'tempeh'],
      egg: ['egg', 'eggs', 'albumin', 'egg white', 'egg yolk', 'ovalbumin'],
      eggs: ['egg', 'eggs', 'albumin', 'egg white', 'egg yolk', 'ovalbumin'],
      fish: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'anchovy', 'sardine'],
      shellfish: ['shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'crustacean'],
      sesame: ['sesame', 'tahini', 'til']
    };

    for (const allergy of userAllergies) {
      const normalizedKey = allergy.toLowerCase().trim().replace(/[\s-]/g, '_');
      const keywords = ALLERGEN_MAP[normalizedKey] || [allergy.toLowerCase().trim()];

      const matchFound = keywords.some(k => fullText.includes(k));
      if (matchFound) {
        warnings.push({
          hasAllergen: true,
          allergenDetected: allergy,
          userAllergyMatched: allergy,
          severity: 'FATAL',
          clinicalNote: `Food contains ingredients derived from or matching "${allergy}". Strictly avoid if sensitized.`
        });
      }
    }

    return warnings;
  }

  /**
   * Medical & Clinical Boundary Verification
   */
  public checkMedicalConstraints(food: FoodItemData, profile: UserProfile): MedicalConstraintWarning[] {
    const warnings: MedicalConstraintWarning[] = [];
    const constraints = profile.healthConstraints || [];

    for (const constraint of constraints) {
      const lower = constraint.toLowerCase();

      // Hypertension check: single serving sodium > 400mg or food sodium > 600mg
      if (lower.includes('hypertension') || lower.includes('blood pressure')) {
        if (food.sodiumMg > 400) {
          warnings.push({
            condition: 'Hypertension',
            triggeredParameter: 'Sodium (mg)',
            thresholdValue: '< 400 mg / serving',
            observedValue: `${food.sodiumMg} mg`,
            clinicalAdvice: 'High sodium content causes acute endothelial fluid retention. Consider splitting portion or pairing with high-potassium greens.'
          });
        }
      }

      // Prediabetes / Type 2 Diabetes check: simple sugars > 12g per serving
      if (lower.includes('diabetes') || lower.includes('insulin resistance') || lower.includes('glycemic')) {
        if (food.sugarsG > 12) {
          warnings.push({
            condition: 'Blood Glucose Regulation',
            triggeredParameter: 'Free Sugars (g)',
            thresholdValue: '< 12 g / serving',
            observedValue: `${food.sugarsG} g`,
            clinicalAdvice: 'Rapidly absorbable simple carbohydrates may induce a sharp postprandial glycemic spike. Pair with soluble fiber or protein to attenuate insulin demand.'
          });
        }
      }

      // Renal / Kidney checks: excessive acute protein in a single sitting
      if (lower.includes('renal') || lower.includes('kidney')) {
        if (food.proteinG > 40) {
          warnings.push({
            condition: 'Renal Function Precaution',
            triggeredParameter: 'Single Sitting Protein (g)',
            thresholdValue: '< 40 g / sitting',
            observedValue: `${food.proteinG} g`,
            clinicalAdvice: 'High acute urea load requires filtration by kidneys. Moderate single-sitting protein bolus in accordance with nephrologist guidelines.'
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Generate Explainable, Evidence-Graded Recommendations
   */
  public generateExplainableRecommendations(
    profile: UserProfile,
    remainingProteinG: number,
    remainingCal: number,
    _scannedFood: FoodItemData
  ): ExplainableRecommendation[] {
    const isVegan = profile.dietaryPreference === 'vegan';
    const isVeg = profile.dietaryPreference === 'vegetarian' || isVegan;
    const isKeto = profile.dietaryPreference === 'keto';
    const hasDairyAllergy = profile.allergies.some(a => /dairy|milk|lactose/i.test(a));
    const hasNutAllergy = profile.allergies.some(a => /nut|peanut/i.test(a));
    const hasSoyAllergy = profile.allergies.some(a => /soy/i.test(a));
    const hasEggAllergy = profile.allergies.some(a => /egg/i.test(a));

    const recs: ExplainableRecommendation[] = [];

    // Recommendation 1: High protein gap closure (if protein needed >= 20g)
    if (remainingProteinG >= 20) {
      if (!isVeg && !hasDairyAllergy) {
        recs.push({
          id: 'rec-greek-yogurt-chia',
          type: 'food_first',
          title: '0% Fat Greek Yogurt with Chia Seeds (200g)',
          description: 'Concentrated micellar casein and whey bowl delivering dense essential amino acids with low energetic footprint.',
          macroBenefit: { calories: 140, proteinG: 22, carbsG: 6, fatG: 2, fiberG: 3, sodiumMg: 60 },
          whyRationale: 'Delivers 2.6g leucine to surpass the muscle protein synthesis threshold (mTORC1 activation) without consuming remaining caloric budget.',
          evidenceLevel: 'High',
          scientificCitation: 'Morton et al., Br J Sports Med 2018 (Systematic Review & Meta-Analysis)',
          timingRecommendation: 'Consume as afternoon snack or within 90 minutes post-training',
          dietaryFit: ['vegetarian', 'standard']
        });
      }

      if (!isVeg) {
        recs.push({
          id: 'rec-herb-chicken-breast',
          type: 'food_first',
          title: 'Lemon Herb Grilled Chicken Breast (140g)',
          description: 'Ultra-lean whole food protein offering exceptional DIAAS amino acid bioavailability.',
          macroBenefit: { calories: 185, proteinG: 38, carbsG: 0, fatG: 3.5, fiberG: 0, sodiumMg: 120 },
          whyRationale: 'High DIAAS (>1.15) maximizes nitrogen retention and supports lean tissue preservation during active daily expenditure.',
          evidenceLevel: 'High',
          scientificCitation: 'Phillips et al., Front Nutr 2016; FAO DIAAS Report 2013',
          timingRecommendation: 'Ideal centerpiece for upcoming dinner meal',
          dietaryFit: ['standard', 'keto', 'paleo']
        });
      }

      if (isVeg && !hasSoyAllergy) {
        recs.push({
          id: 'rec-steamed-edamame-tofu',
          type: 'food_first',
          title: 'Pan-Seared Organic Firm Tofu & Edamame (180g)',
          description: 'Naturally complete plant protein rich in bioavailable isoflavones and gut-friendly prebiotic fiber.',
          macroBenefit: { calories: 210, proteinG: 25, carbsG: 9, fatG: 8, fiberG: 6, sodiumMg: 45 },
          whyRationale: 'Soy protein isolate exhibits a PDCAAS of 1.0, stimulating myofibrillar protein synthesis equivalent to dairy in isonitrogenous doses.',
          evidenceLevel: 'High',
          scientificCitation: 'Messina et al., Nutrients 2021; Lynch et al., Sports Med 2018',
          timingRecommendation: 'Pair with leafy greens or brown rice for dinner',
          dietaryFit: ['vegan', 'vegetarian', 'standard']
        });
      }

      if (isVeg && !isVegan && !hasDairyAllergy) {
        recs.push({
          id: 'rec-icmr-paneer-bhurji',
          type: 'pantry_swap',
          title: 'Low-Fat Spiced Paneer Bhurji (120g)',
          description: 'Indian food composition standard (IFCT) verified protein rich in calcium and bioavailable amino acids.',
          macroBenefit: { calories: 195, proteinG: 22, carbsG: 4, fatG: 10, fiberG: 1.5, sodiumMg: 95 },
          whyRationale: 'Slow-digesting casein fraction maintains sustained hyperaminoacidemia over 5-7 hours to prevent nocturnal muscle catabolism.',
          evidenceLevel: 'Regulatory',
          scientificCitation: 'ICMR-National Institute of Nutrition (IFCT 2017); Trommelen & van Loon, Sports Med 2016',
          timingRecommendation: 'Consume with evening meal or 1 hour prior to sleep',
          dietaryFit: ['vegetarian', 'standard', 'keto']
        });
      }
    } else if (remainingProteinG > 0) {
      // Moderate gap closure
      if (!hasEggAllergy && !isVegan) {
        recs.push({
          id: 'rec-boiled-pasture-eggs',
          type: 'food_first',
          title: '2 Soft-Boiled Pasture-Raised Whole Eggs',
          description: 'Nutrient-dense protein paired with intact yolk lipids, choline, and lutein.',
          macroBenefit: { calories: 140, proteinG: 13, carbsG: 1, fatG: 9.5, fiberG: 0, sodiumMg: 130 },
          whyRationale: 'Whole eggs stimulate post-exercise myofibrillar protein synthesis 42% greater than egg white protein alone due to yolk lipid matrix synergism.',
          evidenceLevel: 'High',
          scientificCitation: 'van Vliet et al., Am J Clin Nutr 2017 (Randomized Controlled Trial)',
          timingRecommendation: 'Quick midday bite or post-workout accompaniment',
          dietaryFit: ['vegetarian', 'standard', 'keto']
        });
      }

      if (!hasNutAllergy) {
        recs.push({
          id: 'rec-roasted-pumpkin-seeds',
          type: 'snack_action',
          title: 'Dry-Roasted Pepitas (Pumpkin Seeds, 30g)',
          description: 'Mineral-dense plant crunch providing magnesium, zinc, and arginine.',
          macroBenefit: { calories: 160, proteinG: 9, carbsG: 4, fatG: 13, fiberG: 2.5, sodiumMg: 10 },
          whyRationale: 'Magnesium acts as an essential cofactor for ATP resynthesis and preserves normal neuromuscular transmission.',
          evidenceLevel: 'Moderate',
          scientificCitation: 'EFSA Scientific Opinion on Magnesium Health Claims 2010',
          timingRecommendation: 'Sprinkle over current meal or consume as afternoon snack',
          dietaryFit: ['vegan', 'vegetarian', 'standard', 'keto']
        });
      }
    } else {
      // Target met: Hydration, fiber & micronutrient recovery
      recs.push({
        id: 'rec-hydration-electrolytes',
        type: 'hydration_action',
        title: 'Electrolyte Hydration Infusion (450ml)',
        description: 'Fresh water infused with lemon slice and a pinch of unrefined mineral salt.',
        macroBenefit: { calories: 5, proteinG: 0, carbsG: 1, fatG: 0, sodiumMg: 110 },
        whyRationale: 'Euhydration optimizes cellular glycogen retention, renal metabolic clearance, and cardiovascular stroke volume.',
        evidenceLevel: 'Regulatory',
        scientificCitation: 'Sawka et al., Med Sci Sports Exerc (ACSM Position Stand on Hydration)',
        timingRecommendation: 'Sip steadily over the next 2 hours',
        dietaryFit: ['vegan', 'vegetarian', 'standard', 'keto']
      });
    }

    // Filter strictly by user dietary preference
    return recs.filter(r => {
      if (isVegan && !r.dietaryFit.includes('vegan')) return false;
      if (isVeg && !r.dietaryFit.includes('vegetarian') && !r.dietaryFit.includes('vegan')) return false;
      if (isKeto && !r.dietaryFit.includes('keto')) return false;
      return true;
    });
  }

  /**
   * Actionable Meal Improvement Suggestions (Food pairings, swaps, mitigations)
   */
  public generateMealImprovements(food: FoodItemData, _profile: UserProfile): MealImprovementSuggestion[] {
    const suggestions: MealImprovementSuggestion[] = [];

    // 1. High Sodium Mitigation: Pair with high-potassium foods
    if (food.sodiumMg > 350) {
      suggestions.push({
        category: 'sodium_mitigation',
        title: 'Counterbalance Sodium with Potassium-Rich Whole Greens',
        suggestionText: `This food delivers ${food.sodiumMg}mg sodium. Add 50g fresh baby spinach or half a potassium-rich avocado to restore the cellular sodium-potassium ratio.`,
        targetNutrient: 'Potassium (K+)',
        physiologicalMechanism: 'Potassium stimulates the basolateral Na+/K+ ATPase pump in vascular smooth muscle and promotes natriuresis via renal aldosterone regulation.',
        foodAdditionsOrSwaps: ['Fresh Baby Spinach', 'Sliced Avocado', 'Coconut Water', 'Steamed Broccoli'],
        evidenceLevel: 'High'
      });
    }

    // 2. High Glycemic Load: Add soluble fiber or healthy fat buffer
    if (food.sugarsG > 14 && food.fiberG < 3) {
      suggestions.push({
        category: 'glycemic_blunting',
        title: 'Blunt Postprandial Glucose Surge with Viscous Soluble Fiber',
        suggestionText: `High free sugars (${food.sugarsG}g) with low fiber (${food.fiberG}g) may induce quick glycemic absorption. Add 1 tbsp chia seeds or ground flaxseed.`,
        targetNutrient: 'Soluble Viscous Fiber',
        physiologicalMechanism: 'Soluble fiber forms an intraluminal gel matrix that delays gastric emptying and slows glucose diffusion across intestinal brush-border enterocytes.',
        foodAdditionsOrSwaps: ['1 Tbsp Chia Seeds', 'Ground Flaxseed', 'Roasted Walnuts', 'Psyllium Husk'],
        evidenceLevel: 'High'
      });
    }

    // 3. Plant Iron Bioavailability Enhancement: Pair non-heme iron with Ascorbic Acid (Vitamin C)
    const lowerName = food.name.toLowerCase();
    if (lowerName.includes('dal') || lowerName.includes('lentil') || lowerName.includes('spinach') || lowerName.includes('beans')) {
      suggestions.push({
        category: 'iron_bioavailability',
        title: 'Enhance Non-Heme Iron Absorption with Ascorbic Acid',
        suggestionText: 'Plant legumes contain ferric iron (Fe3+) bound by phytates. Squeeze fresh lemon juice over the dish before eating.',
        targetNutrient: 'Ascorbic Acid (Vitamin C)',
        physiologicalMechanism: 'Ascorbic acid reduces ferric iron (Fe3+) to soluble ferrous iron (Fe2+) and forms stable chelates that bypass phytate precipitation, increasing absorption 3- to 4-fold.',
        foodAdditionsOrSwaps: ['Fresh Lemon Juice Squeeze', 'Diced Bell Peppers', 'Fresh Tomato Salsa'],
        evidenceLevel: 'High'
      });
    }

    // 4. Low Protein Snack: Add dense amino booster
    if (food.proteinG < 8 && food.calories > 180) {
      suggestions.push({
        category: 'protein_optimization',
        title: 'Boost Satiety & MPS with a High-Density Protein Add-On',
        suggestionText: `Currently provides only ${food.proteinG}g protein for ${food.calories} kcal. Add 30g hemp hearts or 2 egg whites to boost protein density.`,
        targetNutrient: 'Essential Amino Acids',
        physiologicalMechanism: 'Elevates blood amino acid concentration to induce satiety through peptide YY (PYY) secretion and glucagon-like peptide-1 (GLP-1) release.',
        foodAdditionsOrSwaps: ['Hemp Hearts (25g)', 'Pasteurized Liquid Egg Whites (100ml)', 'Unflavored Whey / Pea Protein Isolate'],
        evidenceLevel: 'Moderate'
      });
    }

    return suggestions;
  }

  /**
   * Food -> Nutrient -> Body System Physiological Pathways
   */
  public generateBodySystemPathways(food: FoodItemData): FoodToBodySystemPathway[] {
    const pathways: FoodToBodySystemPathway[] = [];
    const provenance = food.confidence;

    // Muscular & Skeletal
    if (food.proteinG >= 10) {
      pathways.push({
        system: 'muscular',
        systemName: 'Muscular & Skeletal System',
        nutrient: `${food.proteinG}g Bioavailable Protein`,
        biologicalRole: 'Myofibrillar Protein Synthesis & Tissue Remodeling',
        cellularMechanism: 'Intracellular leucine activates Sestrin2, releasing GATOR2 to phosphorylate mTORC1 and downstream p70S6K ribosomal kinase.',
        evidenceStrength: 'High',
        citation: 'Morton et al., Br J Sports Med 2018; Wolfson et al., Science 2016',
        provenanceStatus: provenance
      });
    }

    // Cardiovascular
    if (food.sodiumMg > 300) {
      pathways.push({
        system: 'cardiovascular',
        systemName: 'Cardiovascular & Endothelial System',
        nutrient: `${food.sodiumMg}mg Sodium`,
        biologicalRole: 'Extracellular Fluid Osmolality & Arterial Pressure',
        cellularMechanism: 'Elevated extracellular Na+ alters baroreceptor afferents and temporarily modulates nitric oxide-mediated endothelial vasodilation.',
        evidenceStrength: 'Regulatory',
        citation: 'WHO Sodium Guidelines 2023; ICMR-NIN 2020 RDA Standards',
        provenanceStatus: provenance
      });
    } else {
      pathways.push({
        system: 'cardiovascular',
        systemName: 'Cardiovascular & Endothelial System',
        nutrient: 'Low Saturated Fat & Sodium Profile',
        biologicalRole: 'Vascular Compliance & Lipid Homeostasis',
        cellularMechanism: 'Preserves low-density lipoprotein (LDL) receptor expression and prevents vascular pro-inflammatory cytokine expression.',
        evidenceStrength: 'High',
        citation: 'Mozaffarian et al., Circulation 2016',
        provenanceStatus: provenance
      });
    }

    // Digestive & Microbiome
    if (food.fiberG > 2) {
      pathways.push({
        system: 'digestive_microbiome',
        systemName: 'Gastrointestinal & Microbiome Axis',
        nutrient: `${food.fiberG}g Dietary Fiber & Complex Carbohydrates`,
        biologicalRole: 'Microbial Fermentation & Colonic Epithelial Integrity',
        cellularMechanism: 'Anaerobic colonic commensals (e.g. Faecalibacterium prausnitzii) ferment glycans into Short-Chain Fatty Acids (Butyrate, Acetate, Propionate) that fuel colonocytes.',
        evidenceStrength: 'High',
        citation: 'Sonnenburg & Backhed, Nature 2016; Koh et al., Cell 2016',
        provenanceStatus: provenance
      });
    }

    // Metabolic & Endocrine
    pathways.push({
      system: 'metabolic_endocrine',
      systemName: 'Metabolic & Endocrine System',
      nutrient: `${food.calories} kcal / ${food.carbsG}g Carbs`,
      biologicalRole: 'Glycemic Transit & Mitochondrial Energy Transfer',
      cellularMechanism: 'Hexose transport via GLUT2/GLUT4 triggers cellular oxidative phosphorylation, converting ADP to ATP through Complex I-IV electron transport.',
      evidenceStrength: 'High',
      citation: 'Saltiel & Kahn, Nature 2001; Petersen & Shulman, Physiol Rev 2018',
      provenanceStatus: provenance
    });

    return pathways;
  }
}

export const recommendationService = new RecommendationService();
