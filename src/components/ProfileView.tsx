import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Activity,
  AlertTriangle,
  Save,
  CheckCircle2,
  Info,
  Scale,
  Sparkles
} from 'lucide-react';
import { ActivityLevel, DietaryPreference, GoalType, UserProfile } from '../types/index.js';

interface ProfileViewProps {
  profile: UserProfile | null;
  onUpdateProfile: (updated: UserProfile) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdateProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(
    profile || {
      id: 'user-alex-1',
      name: 'Alex Carter',
      email: 'alex.carter@emberground.dev',
      age: 28,
      gender: 'male',
      heightCm: 180,
      weightKg: 78,
      activityLevel: 'moderate',
      goal: 'muscle_gain',
      dietaryPreference: 'standard',
      allergies: ['Peanuts'],
      foodPreferences: ['High protein', 'Salmon', 'Greek Yogurt'],
      trainingExperience: 'intermediate',
      availableTrainingDays: 4,
      equipment: ['Barbell', 'Dumbbells', 'Cable machine'],
      healthConstraints: ['Mild left patellar tendinitis (avoid deep jumping plyometrics)'],
      safetyNotes: 'Non-clinical fitness guidance. Consult an orthopedist or certified physical therapist for persistent knee symptoms.',
      createdAt: ''
    }
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Real-time deterministic BMR formula
  const baseBmr = 10 * formData.weightKg + 6.25 * formData.heightCm - 5 * formData.age;
  const bmr = formData.gender === 'male' ? Math.round(baseBmr + 5) : Math.round(baseBmr - 161);
  const multiplier = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    athlete: 1.9
  }[formData.activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateProfile(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Safety & Clinical Disclaimer Banner */}
      <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 text-xs text-amber-200/90 leading-relaxed">
            <h3 className="text-sm font-bold text-amber-300">
              Health Information & Safety Constitution
            </h3>
            <p>
              Adaptiv is an autonomous engineering agent designed for lifestyle habit calibration and macronutrient accounting. <strong>The system does not diagnose medical disease, prescribe medical treatments, or replace qualified healthcare providers.</strong>
            </p>
            <p className="text-[11px] text-amber-300/70">
              For acute injuries, chronic metabolic disorders, clinical allergies, or eating disorders, always escalate to licensed physicians, registered dietitians, or certified physical therapists.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              Personal Context & Biometrics
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic foundations for energy expenditure and macronutrient requirements.
            </p>
          </div>
          <div className="text-right text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            BMR: {bmr} kcal • TDEE: {tdee} kcal
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 25 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Height (cm)</label>
            <input
              type="number"
              value={formData.heightCm}
              onChange={(e) => setFormData({ ...formData, heightCm: parseInt(e.target.value) || 175 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Weight (kg)</label>
            <input
              type="number"
              value={formData.weightKg}
              onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 75 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Goal</label>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value as GoalType })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 capitalize"
            >
              <option value="muscle_gain">Muscle Gain (Surplus + 2.0g/kg Protein)</option>
              <option value="fat_loss">Fat Loss (Deficit + 2.2g/kg Sparing Protein)</option>
              <option value="recomposition">Body Recomposition</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Activity Level</label>
            <select
              value={formData.activityLevel}
              onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 capitalize"
            >
              <option value="sedentary">Sedentary (Desk Job, 1.2x)</option>
              <option value="light">Lightly Active (1.375x)</option>
              <option value="moderate">Moderately Active (3-5 workouts/wk, 1.55x)</option>
              <option value="very_active">Very Active (Hard exercise 6-7 days/wk, 1.725x)</option>
              <option value="athlete">Athlete (Intense training 2x/day, 1.9x)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dietary Preference</label>
            <select
              value={formData.dietaryPreference}
              onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value as DietaryPreference })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 capitalize"
            >
              <option value="standard">Standard Omnivore</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan (Plant-First)</option>
              <option value="keto">Ketogenic</option>
              <option value="paleo">Paleo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Allergies & Intolerances (Comma-separated)
            </label>
            <input
              type="text"
              value={formData.allergies.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allergies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                })
              }
              placeholder="e.g. Peanuts, Shellfish, Dairy"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Physical Constraints & Injury Notes
          </label>
          <input
            type="text"
            value={formData.healthConstraints.join(', ')}
            onChange={(e) =>
              setFormData({
                ...formData,
                healthConstraints: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
              })
            }
            placeholder="e.g. Mild left patellar tendinitis (avoid deep plyometrics)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Saved & Recalibrated!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-slate-950" />
                <span>{saving ? 'Saving...' : 'Save Profile & Update Targets'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
