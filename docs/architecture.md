# Adaptiv System Architecture (Phase 3)

## 1. Overview & Architectural Philosophy

Adaptiv is built as a **modular monolith** with clean domain separation, strict boundary isolation, and replaceable integrations. 

```text
                         ┌───────────────┐
                         │     USER      │
                         └───────┬───────┘
                                 │
                                 ▼
                    ┌─────────────────────┐
                    │      FRONTEND       │
                    │ React + TypeScript  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     API / v1        │
                    │ Express / Node.js   │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼──────────────────┐
             │                 │                  │
             ▼                 ▼                  ▼
        ┌─────────┐       ┌─────────┐       ┌─────────┐
        │ Profile │       │  Goals  │       │  Auth   │
        └────┬────┘       └────┬────┘       └────┬────┘
             │                 │                  │
             └─────────────────┼──────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   DOMAIN SERVICES   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
         Food Domain      Fitness Domain     Progress
         (Phase 3 Active)   (Phase 5)        (Phase 8)
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     AI SERVICE      │
                    │     ABSTRACTION     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     AGENT LAYER     │
                    └──────────┬──────────┘
                               │
                  ┌────────────┼────────────┐
                  ▼            ▼            ▼
                 n8n         Email       External APIs

                               │
                               ▼
                    ┌─────────────────────┐
                    │   POSTGRESQL / DB   │
                    └─────────────────────┘
```

---

## 2. Phase 3 Food Data Pipeline Architecture

```text
USER CAMERA / UPLOAD (Multiple Images Supported)
        │
        ▼
IMAGE VALIDATION (MIME Check, 10MB Limit, Corruption)
        │
        ▼
SHA-256 HASH GENERATION & DEDUPLICATION (Immutable Storage)
        │
        ▼
FOOD VISION ABSTRACTION (IFoodVisionProvider -> Gemini / Mock Adapter)
        │
        ▼
STRUCTURED OCR EXTRACTION (Nutrition, Ingredients, Barcode, Null for Unobserved)
        │
        ▼
MULTI-IMAGE RECONCILIATION & CONFLICT DETECTOR
        │
        ▼
PRODUCT CATALOG & GS1 BARCODE MATCHING ENGINE
        │
        ▼
VERIFICATION STATE & PROVENANCE ASSIGNMENT
        │
        ▼
STRUCTURED FOOD RESULT (Clean Hand-off for Phase 4 A-E Grading)
```

---

## 3. Four Types of Truth Model

1. **Product Truth**: What the package label literally states. Unobserved values remain strictly `null`, never fabricated as `0`.
2. **Calculation Truth**: Deterministic algorithms (Nutri-Score 2023, Mifflin-St Jeor BMR, Activity TDEE).
3. **Scientific Truth**: Verified ingredient taxonomy, additive E-number regulatory status (FDA/EFSA), and clinical evidence.
4. **Personalization Truth**: Evaluated against individual user biometrics, allergens, and active goal targets.
