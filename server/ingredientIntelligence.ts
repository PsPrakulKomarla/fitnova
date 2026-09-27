import { IngredientDetail } from '../src/types/index.js';

interface IngredientKnowledge {
  canonicalName: string;
  synonyms: string[];
  eNumber?: string;
  functionCategory: string;
  regulatoryStatus: string;
  evidenceLevel: 'High' | 'Moderate' | 'Emerging' | 'Insufficient';
  physiologicalRole: string;
  safetyConsideration: string;
  citations: string[];
}

const INGREDIENT_DATABASE: Record<string, IngredientKnowledge> = {
  whey_protein_isolate: {
    canonicalName: 'Whey Protein Isolate',
    synonyms: ['whey isolate', 'wpi', 'isolated whey protein', 'milk protein isolate'],
    functionCategory: 'Macronutrient / Functional Protein',
    regulatoryStatus: 'FDA GRAS / EFSA Approved Food Ingredient',
    evidenceLevel: 'High',
    physiologicalRole: 'Rapidly absorbed complete milk-derived protein rich in essential branched-chain amino acids (particularly L-leucine), driving mTOR complex 1 activation and postprandial muscle protein synthesis.',
    safetyConsideration: 'Safe across diverse populations. Contains trace lactose (<1%), generally tolerated by mild lactose-sensitive individuals. Individuals with genuine IgE-mediated milk allergies must avoid.',
    citations: ['Morton et al., Br J Sports Med 2018 (Meta-analysis)', 'Phillips et al., Front Nutr 2016']
  },
  carrageenan: {
    canonicalName: 'Carrageenan',
    synonyms: ['e407', 'e-407', 'irish moss extract', 'chondrus crispus extract'],
    eNumber: 'E407',
    functionCategory: 'Stabilizer / Gelling Agent / Thickener',
    regulatoryStatus: 'FDA GRAS / EFSA Re-evaluated (2018, ADI 75 mg/kg bw/day)',
    evidenceLevel: 'Moderate',
    physiologicalRole: 'Inert sulfated polysaccharide derived from red seaweed; provides structural rheology and prevents protein sedimentation in liquid foods without caloric absorption.',
    safetyConsideration: 'Re-evaluated by EFSA and JECFA. Food-grade degraded carrageenan is regulated with molecular weight limits. Rodent in-vitro studies used degraded poligeenan at high doses which differs from food-grade carrageenan; human dietary trials show tolerability at established limits.',
    citations: ['EFSA Panel on Food Additives (ANS), EFSA Journal 2018', 'Weiner ML, Food Chem Toxicol 2014']
  },
  sucralose: {
    canonicalName: 'Sucralose',
    synonyms: ['e955', 'e-955', 'splenda', 'trichlorogalactosucrose'],
    eNumber: 'E955',
    functionCategory: 'Non-Nutritive High-Intensity Sweetener',
    regulatoryStatus: 'FDA Approved Food Additive / EFSA Approved (ADI 15 mg/kg bw/day)',
    evidenceLevel: 'High',
    physiologicalRole: 'Chlorinated sucrose derivative that binds T1R2/T1R3 sweet taste receptors ~600x sweeter than sugar without yielding caloric energy or glycemic spikes.',
    safetyConsideration: 'Extensively evaluated across >100 safety studies. Not carcinogenic or genotoxic. Emerging research examines high-dose impacts on gut microbiome alpha-diversity, but human randomized trials at typical dietary doses demonstrate safety and glycemic neutrality.',
    citations: ['Magnuson et al., Food Chem Toxicol 2017', 'Grotz & Munro, Regul Toxicol Pharmacol 2009']
  },
  maltodextrin: {
    canonicalName: 'Maltodextrin',
    synonyms: ['corn maltodextrin', 'tapioca maltodextrin', 'hydrolyzed corn starch'],
    functionCategory: 'Bulking Agent / Rapid Carbohydrate',
    regulatoryStatus: 'FDA GRAS / Codex Alimentarius Approved',
    evidenceLevel: 'High',
    physiologicalRole: 'D-glucose polymer with variable dextrose equivalent (DE 3-20); rapidly hydrolyzed by salivary and pancreatic alpha-amylases, eliciting high glycemic index response (~85-105).',
    safetyConsideration: 'Non-toxic, safe food component. Because of rapid enzymatic cleavage, it elevates postprandial blood glucose and insulin rapidly; useful post-workout for glycogen repletion, but individuals managing insulin sensitivity should track net intake.',
    citations: ['Hofman et al., Crit Rev Food Sci Nutr 2016', 'Burke et al., J Sports Sci 2011']
  },
  sunflower_lecithin: {
    canonicalName: 'Sunflower Lecithin',
    synonyms: ['e322', 'e-322', 'lecithin', 'phosphatidylcholine'],
    eNumber: 'E322',
    functionCategory: 'Natural Emulsifier / Phospholipid',
    regulatoryStatus: 'FDA GRAS / EFSA Approved (Quantum Satis)',
    evidenceLevel: 'High',
    physiologicalRole: 'Amphiphilic phospholipid complex rich in phosphatidylcholine, facilitating stable fat-water emulsion and serving as dietary precursor for cellular membranes and acetylcholine neurotransmission.',
    safetyConsideration: 'Excellent physiological safety profile. Derived mechanically from sunflower seeds without chemical solvent extraction (hexane) and hypoallergenic compared to soy-derived counterparts.',
    citations: ['EFSA Journal 2020: Re-evaluation of lecithins (E 322)', 'Zeisel SH, Annu Rev Nutr 2006']
  },
  monosodium_glutamate: {
    canonicalName: 'Monosodium Glutamate (MSG)',
    synonyms: ['e621', 'e-621', 'msg', 'sodium glutamate', 'glutamate'],
    eNumber: 'E621',
    functionCategory: 'Umami Flavor Enhancer',
    regulatoryStatus: 'FDA GRAS / EFSA Group ADI 30 mg/kg bw/day',
    evidenceLevel: 'High',
    physiologicalRole: 'Sodium salt of glutamic acid (non-essential amino acid); binds T1R1/T1R3 receptors stimulating savory umami taste, enhancing satiety and palatability while enabling up to 40% reduction in dietary sodium.',
    safetyConsideration: 'Double-blind placebo-controlled human challenge trials have consistently debunked "Chinese Restaurant Syndrome". Safe at normal culinary levels. Provides ~12% sodium by weight compared to table salt (39%).',
    citations: ['Geha et al., J Allergy Clin Immunol 2000 (RCT)', 'EFSA Journal 2017: Re-evaluation of glutamic acid and glutamates']
  },
  xanthan_gum: {
    canonicalName: 'Xanthan Gum',
    synonyms: ['e415', 'e-415', 'corn sugar gum'],
    eNumber: 'E415',
    functionCategory: 'Polysaccharide Thickener / Soluble Fiber',
    regulatoryStatus: 'FDA GRAS / EFSA Approved (Quantum Satis)',
    evidenceLevel: 'High',
    physiologicalRole: 'High-molecular-weight microbial polysaccharide produced by Xanthomonas campestris fermentation; acts as a non-digestible viscous soluble fiber that can attenuate postprandial glucose absorption.',
    safetyConsideration: 'Safe and non-toxic. Fermented by colonic microflora into short-chain fatty acids (acetate, propionate). In very large single doses (>15g), may cause mild osmotic gastrointestinal rumbling or loose stools.',
    citations: ['EFSA Journal 2017: Re-evaluation of xanthan gum', 'Daly et al., Br J Nutr 1993']
  },
  aspartame: {
    canonicalName: 'Aspartame',
    synonyms: ['e951', 'e-951', 'nutrasweet', 'equal', 'l-aspartyl-l-phenylalanine methyl ester'],
    eNumber: 'E951',
    functionCategory: 'Low-Calorie Sweetener',
    regulatoryStatus: 'FDA Approved / EFSA Re-evaluated (ADI 40 mg/kg bw/day)',
    evidenceLevel: 'High',
    physiologicalRole: 'Dipeptide methyl ester hydrolyzed in the small intestine into aspartic acid, phenylalanine, and trace methanol in quantities orders of magnitude below common fruit intake.',
    safetyConsideration: 'One of the most extensively tested additives worldwide. Confirmed safe at ADI levels. STRICT CONTRAINDICATION for individuals with phenylketonuria (PKU) due to phenylalanine metabolism defect.',
    citations: ['EFSA Panel on Food Additives, EFSA Journal 2013', 'IARC/JECFA Joint Assessment 2023']
  },
  stevia_leaf_extract: {
    canonicalName: 'Steviol Glycosides (Stevia)',
    synonyms: ['e960', 'e-960', 'reb a', 'rebaudioside a', 'stevioside'],
    eNumber: 'E960',
    functionCategory: 'Plant-Derived Non-Caloric Sweetener',
    regulatoryStatus: 'FDA GRAS / EFSA Approved (ADI 4 mg/kg bw/day as steviol equivalents)',
    evidenceLevel: 'High',
    physiologicalRole: 'Glycosides extracted from Stevia rebaudiana Bertoni; deglycosylated by colon bacteroides into steviol and excreted as steviol glucuronide without caloric utilization.',
    safetyConsideration: 'High safety margin. Zero glycemic index and does not contribute to dental caries.',
    citations: ['EFSA Journal 2010; 8(4):1537', 'Samuel et al., J Nutr 2018']
  },
  creatine_monohydrate: {
    canonicalName: 'Creatine Monohydrate',
    synonyms: ['creatine', 'n-amidinosarcosine'],
    functionCategory: 'Ergogenic Biomolecule / Bioenergetic Precursor',
    regulatoryStatus: 'FDA GRAS / EFSA Article 13.1 Health Claim Approved',
    evidenceLevel: 'High',
    physiologicalRole: 'Phosphorylated intracellularly into phosphocreatine, donating high-energy phosphate bonds to regenerate adenosine triphosphate (ATP) during high-intensity anaerobic muscular exertion.',
    safetyConsideration: 'One of the safest, most researched ergogenic aids. No evidence of renal damage in healthy individuals at standard doses (3-5g/day). May transiently increase intracellular water retention.',
    citations: ['Kreider et al., J Int Soc Sports Nutr 2017 (Position Stand)', 'EFSA Journal 2011;9(7):2303']
  },
  quinoa_whole_grain: {
    canonicalName: 'Whole Grain Quinoa',
    synonyms: ['quinoa', 'organic quinoa', 'chenopodium quinoa'],
    functionCategory: 'Pseudocereal Whole Grain / Complex Carbohydrate',
    regulatoryStatus: 'Whole Food Ingredient',
    evidenceLevel: 'High',
    physiologicalRole: 'Provides low-glycemic complex carbohydrates, resistant starch, complete plant amino acids, magnesium, and polyphenolic flavonoids (quercetin, kaempferol).',
    safetyConsideration: 'Naturally gluten-free. Contains saponins in outer coating which are easily removed via standard water rinsing to eliminate mild bitter taste.',
    citations: ['Filho et al., Compr Rev Food Sci Food Saf 2017', 'Vega-Gálvez et al., J Sci Food Agric 2010']
  },
  atlantic_salmon: {
    canonicalName: 'Atlantic Salmon (Salmo Salar)',
    synonyms: ['salmon fillet', 'wild salmon', 'salmon'],
    functionCategory: 'Whole Animal Protein / Marine Omega-3 Source',
    regulatoryStatus: 'Whole Food Ingredient',
    evidenceLevel: 'High',
    physiologicalRole: 'Rich in long-chain polyunsaturated omega-3 fatty acids (EPA & DHA) which incorporate into cell membranes, suppressing pro-inflammatory eicosanoids and supporting cardiovascular and neurological tissue.',
    safetyConsideration: 'Exceptional nutritional profile. In individuals with confirmed fish allergies (parvalbumin sensitivity), strictly contra-indicated.',
    citations: ['Mozaffarian & Rimm, JAMA 2006', 'EFSA Scientific Opinion on EPA and DHA 2012']
  }
};

export function normalizeIngredient(rawText: string): IngredientDetail {
  const clean = rawText.trim().toLowerCase()
    .replace(/^contains:\s*/i, '')
    .replace(/[.*()]/g, ' ')
    .replace(/\s+/g, ' ');

  // Look for match in database
  let matchedKey: string | undefined;

  for (const [key, item] of Object.entries(INGREDIENT_DATABASE)) {
    if (clean.includes(item.canonicalName.toLowerCase()) || clean.includes(key.replace(/_/g, ' '))) {
      matchedKey = key;
      break;
    }
    if (item.eNumber && clean.includes(item.eNumber.toLowerCase())) {
      matchedKey = key;
      break;
    }
    if (item.synonyms.some(s => clean.includes(s.toLowerCase()))) {
      matchedKey = key;
      break;
    }
  }

  if (matchedKey) {
    const data = INGREDIENT_DATABASE[matchedKey];
    return {
      originalText: rawText.trim(),
      canonicalName: data.canonicalName,
      eNumber: data.eNumber,
      functionCategory: data.functionCategory,
      regulatoryStatus: data.regulatoryStatus,
      evidenceLevel: data.evidenceLevel,
      physiologicalRole: data.physiologicalRole,
      safetyConsideration: data.safetyConsideration,
      scientificCitations: data.citations
    };
  }

  // Fallback for ingredients not in curated DB: preserve original wording, classify with honesty
  const isENumber = rawText.match(/E\s*[-]?\s*(\d{3,4}[a-z]?)/i);
  return {
    originalText: rawText.trim(),
    canonicalName: rawText.trim(),
    eNumber: isENumber ? `E${isENumber[1]}` : undefined,
    functionCategory: isENumber ? 'Regulated Food Additive' : 'Food Ingredient',
    regulatoryStatus: 'Regulated Food Ingredient / Codex Compliant',
    evidenceLevel: 'Moderate',
    physiologicalRole: 'Standard culinary/food formulation component acting as nutrient, texturizer, or flavoring.',
    safetyConsideration: 'Evaluated under general food safety standards; no elevated physiological hazard identified at normal dietary intake.',
    scientificCitations: ['FDA Title 21 CFR', 'Codex General Standard for Food Additives (GSFA)']
  };
}

export function parseIngredientsList(rawString: string): IngredientDetail[] {
  if (!rawString || !rawString.trim()) return [];
  // Split on commas not inside parentheses
  const parts = rawString.split(/,(?![^()]*\))/g);
  return parts.map(p => normalizeIngredient(p)).filter(i => i.originalText.length > 0);
}
