import { Exercise } from './fitness.models.js';

export const EXERCISE_DATABASE: Exercise[] = [
  {
    exerciseId: 'ex-bench-press',
    name: 'Barbell Flat Bench Press',
    muscleGroups: ['Chest (Pectoralis Major)', 'Front Deltoids', 'Triceps Brachii'],
    equipment: ['Barbell', 'Flat Bench', 'Weight Plates'],
    movementPattern: 'horizontal_push',
    difficulty: 'intermediate',
    instructions: [
      'Lie supine on the bench with eyes under the bar and feet planted firmly on the floor.',
      'Grip the bar slightly wider than shoulder-width with wrists stacked above elbows.',
      'Unrack, retract and depress the scapulae, and lower the bar under control to the mid-sternum.',
      'Press upward in a slight J-curve path to full lockout without shrugging shoulders.'
    ],
    safetyNotes: 'Maintain shoulder retraction. Avoid excessive elbow flare (>75 degrees) to prevent anterior shoulder impingement.',
    substitutions: ['ex-dumbbell-press', 'ex-push-up'],
    contraindications: ['shoulder_impingement', 'rotator_cuff_tear']
  },
  {
    exerciseId: 'ex-dumbbell-press',
    name: 'Dumbbell Flat Bench Press',
    muscleGroups: ['Chest (Pectoralis Major)', 'Front Deltoids', 'Triceps'],
    equipment: ['Dumbbells', 'Flat Bench'],
    movementPattern: 'horizontal_push',
    difficulty: 'beginner',
    instructions: [
      'Sit on bench with dumbbells resting on thighs. Kick back smoothly into position.',
      'Position dumbbells at chest level with a 45-degree elbow angle.',
      'Press dumbbells upward until arms are extended, converging slightly at the top.',
      'Lower under control feeling a deep stretch across the pectorals.'
    ],
    safetyNotes: 'Allows natural wrist and glenohumeral rotation. Safer alternative for lifters with minor shoulder discomfort.',
    substitutions: ['ex-bench-press', 'ex-push-up'],
    contraindications: ['acute_pectoral_strain']
  },
  {
    exerciseId: 'ex-squat',
    name: 'Barbell Back Squat',
    muscleGroups: ['Quadriceps', 'Gluteus Maximus', 'Adductors', 'Erector Spinae'],
    equipment: ['Barbell', 'Squat Rack', 'Weight Plates'],
    movementPattern: 'squat',
    difficulty: 'intermediate',
    instructions: [
      'Step under bar resting it across the upper trapezius (high bar) or rear delts (low bar).',
      'Unrack, take two steps back, establish shoulder-width stance with toes slightly flared.',
      'Brace core with Valsalva maneuver, break simultaneously at hips and knees.',
      'Descend until crease of hip is below top of patella (parallel or below).',
      'Drive through mid-foot to stand up, extending hips and knees concurrently.'
    ],
    safetyNotes: 'Maintain neutral spine throughout. Ensure knees track in line with toes.',
    substitutions: ['ex-leg-press', 'ex-goblet-squat'],
    contraindications: ['patellar_tendinitis', 'severe_lumbar_stenosis']
  },
  {
    exerciseId: 'ex-leg-press',
    name: '45-Degree Incline Leg Press',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    equipment: ['Leg Press Machine'],
    movementPattern: 'squat',
    difficulty: 'beginner',
    instructions: [
      'Sit back in seat ensuring lower back and sacrum remain flush with backpad.',
      'Place feet shoulder-width in middle of footplate.',
      'Release safety handles, lower sledge until knees reach 90 degrees.',
      'Press through full foot back up without violently hyperextending knees.'
    ],
    safetyNotes: 'Never let pelvis peel off the backrest (butt wink), which compresses lumbar discs.',
    substitutions: ['ex-squat', 'ex-goblet-squat'],
    contraindications: ['acute_lumbar_herniation']
  },
  {
    exerciseId: 'ex-romanian-deadlift',
    name: 'Barbell Romanian Deadlift (RDL)',
    muscleGroups: ['Hamstrings', 'Gluteus Maximus', 'Erector Spinae', 'Latissimus Dorsi'],
    equipment: ['Barbell', 'Weight Plates'],
    movementPattern: 'hinge',
    difficulty: 'intermediate',
    instructions: [
      'Stand upright holding barbell with overhand grip at hip height.',
      'Unlock knees slightly (keep angle fixed throughout the movement).',
      'Push hips backward towards the wall behind you, hinging at the acetabulum.',
      'Lower bar closely along shins until maximal hamstring stretch is achieved (mid-shin).',
      'Contract glutes and hamstrings to drive hips forward back to starting position.'
    ],
    safetyNotes: 'Keep lats packed and bar in constant contact with legs to minimize lumbar shear stress.',
    substitutions: ['ex-seated-leg-curl', 'ex-dumbbell-rdl'],
    contraindications: ['acute_disc_herniation', 'acute_hamstring_tear']
  },
  {
    exerciseId: 'ex-pull-up',
    name: 'Overhand Pull-Up',
    muscleGroups: ['Latissimus Dorsi', 'Teres Major', 'Biceps Brachii', 'Lower Trapezius'],
    equipment: ['Pull-Up Bar'],
    movementPattern: 'vertical_pull',
    difficulty: 'intermediate',
    instructions: [
      'Grip overhead bar with hands slightly wider than shoulder-width, palms facing away.',
      'Initiate from a dead hang by depressing scapulae (scapular pull).',
      'Pull elbows down towards ribcage until clavicle or chin clears the bar.',
      'Lower under complete eccentric control over 2-3 seconds.'
    ],
    safetyNotes: 'Avoid excessive swinging or kipping to maintain targeted lat recruitment.',
    substitutions: ['ex-lat-pulldown', 'ex-inverted-row'],
    contraindications: ['severe_bicep_tendinitis']
  },
  {
    exerciseId: 'ex-overhead-press',
    name: 'Standing Barbell Overhead Press (OHP)',
    muscleGroups: ['Anterior & Lateral Deltoids', 'Triceps', 'Upper Chest', 'Core'],
    equipment: ['Barbell', 'Squat Rack'],
    movementPattern: 'vertical_push',
    difficulty: 'intermediate',
    instructions: [
      'Grip barbell just outside shoulders with vertical forearms at collarbone height.',
      'Squeeze glutes and brace core tightly to establish a rigid kinetic chain.',
      'Press bar vertically in front of face, pulling head slightly back as bar passes.',
      'Lock out overhead with bar directly aligned over mid-foot and cervical spine.'
    ],
    safetyNotes: 'Do not hyperextend lumbar spine to cheat the weight. If shoulder mobility is limited, use seated dumbbell press.',
    substitutions: ['ex-seated-db-press', 'ex-landmine-press'],
    contraindications: ['subacromial_impingement', 'lumbar_spondylolisthesis']
  },
  {
    exerciseId: 'ex-barbell-row',
    name: 'Bent-Over Barbell Row',
    muscleGroups: ['Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius', 'Posterior Deltoids', 'Biceps'],
    equipment: ['Barbell', 'Weight Plates'],
    movementPattern: 'horizontal_pull',
    difficulty: 'intermediate',
    instructions: [
      'Hinge at hips with torso angled at approximately 45 degrees to floor.',
      'Hold barbell with shoulder-width overhand grip.',
      'Pull bar towards lower ribcage/belly button by driving elbows backward.',
      'Squeeze shoulder blades together at peak contraction and lower under control.'
    ],
    safetyNotes: 'Maintain rigid spinal neutral. Do not heave or jerk torso upward.',
    substitutions: ['ex-chest-supported-row', 'ex-cable-seated-row'],
    contraindications: ['lower_back_strain']
  }
];

export function findExerciseById(id: string): Exercise | undefined {
  return EXERCISE_DATABASE.find(e => e.exerciseId === id);
}

export function getSubstitutionsForExercise(exerciseId: string, userConstraints: string[] = []): Exercise[] {
  const current = findExerciseById(exerciseId);
  if (!current) return [];

  const normalizedConstraints = userConstraints.map(c => c.toLowerCase().trim().replace(/[\s-]/g, '_'));

  return current.substitutions
    .map(subId => findExerciseById(subId))
    .filter((ex): ex is Exercise => {
      if (!ex) return false;
      // Filter out substitutions that also violate user constraints
      const hasContraindication = ex.contraindications.some(c => 
        normalizedConstraints.some(uc => uc.includes(c) || c.includes(uc))
      );
      return !hasContraindication;
    });
}
