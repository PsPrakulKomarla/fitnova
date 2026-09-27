import { BodySystemPathway } from '../src/types/index.js';

export function generateBodyPathways(
  proteinG: number,
  fiberG: number,
  sugarsG: number,
  sodiumMg: number,
  saturatedFatG: number,
  foodName: string
): BodySystemPathway[] {
  const pathways: BodySystemPathway[] = [];

  // 1. Muscular System (Protein & Amino Acids)
  if (proteinG >= 10) {
    pathways.push({
      system: 'muscular',
      nutrient: `Bioavailable Protein (${proteinG}g)`,
      physiologicalRole: 'Substrate for Myofibrillar Protein Synthesis (MPS)',
      mechanism: 'Enzymatically broken down into free essential amino acids (notably leucine), which activate the intracellular mechanistic target of rapamycin complex 1 (mTORC1) cascade, driving muscle protein remodeling and recovery.',
      evidenceStrength: 'High',
      citation: 'Morton RW et al., Br J Sports Med 2018 (Meta-analysis of 49 RCTs); Wolfe RR, J Int Soc Sports Nutr 2017'
    });
  }

  // 2. Digestive System (Fiber & Fermentation)
  if (fiberG >= 3) {
    pathways.push({
      system: 'digestive',
      nutrient: `Dietary Soluble & Insoluble Fiber (${fiberG}g)`,
      physiologicalRole: 'Colonic Microbiome Substrate & Gastric Motility Regulator',
      mechanism: 'Resists upper intestinal enzymatic breakdown. Colonic commensal microbiota ferment prebiotic fractions into Short-Chain Fatty Acids (SCFAs: butyrate, propionate, acetate), reinforcing gut mucosal integrity and modulating enteroendocrine GLP-1 secretion.',
      evidenceStrength: 'High',
      citation: 'Reynolds A et al., The Lancet 2019 (Systematic Review & Meta-analysis); Koh A et al., Cell 2016'
    });
  }

  // 3. Metabolic System (Glycemic and Energy Homeostasis)
  if (sugarsG >= 15) {
    pathways.push({
      system: 'metabolic',
      nutrient: `Rapid Simple Carbohydrates / Free Sugars (${sugarsG}g)`,
      physiologicalRole: 'Postprandial Glycemic Excursion & Hepatic Glycogen Repletion',
      mechanism: 'Rapidly absorbed as monosaccharides (glucose, fructose) via SGLT1 and GLUT5 enterocyte transporters, stimulating acute pancreatic beta-cell insulin secretion and hepatic glycogen synthase activation.',
      evidenceStrength: 'High',
      citation: 'World Health Organization (WHO) Guideline: Sugars intake for adults and children 2015; Stanhope KL, Crit Rev Clin Lab Sci 2016'
    });
  } else {
    pathways.push({
      system: 'metabolic',
      nutrient: `Controlled Glycemic Carbohydrate Profile (${sugarsG}g sugars)`,
      physiologicalRole: 'Stable Metabolic Fuel & Insulin Homeostasis',
      mechanism: 'Gradual systemic glucose entry supports sustained mitochondrial beta-oxidation and steady cellular ATP generation without precipitous insulin surges.',
      evidenceStrength: 'High',
      citation: 'Jenkins DJ et al., Am J Clin Nutr 2002; Ludwig DS, JAMA 2002'
    });
  }

  // 4. Cardiovascular System (Electrolyte & Lipid Dynamics)
  if (sodiumMg >= 400 || saturatedFatG >= 5) {
    pathways.push({
      system: 'cardiovascular',
      nutrient: `Electrolyte & Lipid Fractions (${sodiumMg}mg Sodium, ${saturatedFatG}g Sat. Fat)`,
      physiologicalRole: 'Extracellular Fluid Osmolarity & Endothelial Homeostasis',
      mechanism: 'Sodium transiently shifts extracellular fluid volume, regulated via renal renin-angiotensin-aldosterone axis. Saturated fatty acids interact with hepatic LDL-receptor expression (SREBP pathway), modulating circulating apolipoprotein B particles.',
      evidenceStrength: 'Moderate',
      citation: 'He FJ et al., Cochrane Database Syst Rev 2013; Mensink RP, WHO Systematic Review 2016'
    });
  } else {
    pathways.push({
      system: 'cardiovascular',
      nutrient: `Low-Sodium / Heart-Favorable Profile (${sodiumMg}mg Sodium)`,
      physiologicalRole: 'Vascular Tone & Endothelial Nitric Oxide Support',
      mechanism: 'Promotes favorable sodium-to-potassium balance, preserving vascular endothelial elasticity and microvascular perfusion without osmotic vascular tension.',
      evidenceStrength: 'High',
      citation: 'Sacks FM et al., DASH-Sodium Collaborative Research Group, N Engl J Med 2001'
    });
  }

  return pathways;
}
