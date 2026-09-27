# Domain Model & Entity Boundaries

## 1. Domain Ownership Separation

To prevent "God Objects", each domain owns its entities independently:

```text
User / Auth
  └── owns credentials, sessions, and primary user identifier

Profile
  └── owns current physiological characteristics (age, height, weight, activity, allergies, constraints)

Goals / Plans
  └── owns energy targets (BMR, TDEE, Calories, Macros) and training split definitions

Food & Products (Phase 3)
  └── owns food catalog, product versions, raw observations, ingredients, and nutrition tables

Progress (Phase 8)
  └── owns historical time-series measurements (weight history, workout volume, daily macro adherence)
```

---

## 2. Product Versioning & Provenance Model

Products reformulate over time. Packaging designs change. Therefore, a product is split between its permanent catalog identity and versioned observations:

```text
Product (Permanent Identity)
  ├── id: string
  ├── barcode: string (e.g. GS1 standard)
  ├── brand: string
  └── name: string
        │
        ├── ProductVersion (Versioned Specification)
        │     ├── versionNumber: number
        │     ├── nutrition: NutritionData (per 100g and per serving)
        │     ├── ingredients: IngredientItem[]
        │     └── verificationState: VERIFIED | OBSERVED | CONFLICT | UNVERIFIED
        │
        └── ProductObservation (Instance of User Scan)
              ├── imageId: string
              ├── scanJobId: string
              ├── rawOcrText: string
              ├── provenance: ProvenanceRecord[]
              └── confidence: number
```

---

## 3. Provenance Structure

Every extracted fact carries an immutable audit trail:
- `field`: string (e.g. `'nutrition.proteinG'`)
- `source`: `'label_ocr' | 'barcode_database' | 'user_upload' | 'vision_estimate'`
- `imageId`: string
- `confidence`: number (0.0 to 1.0)
- `observedValue`: unknown
- `timestamp`: ISO-8601 string
