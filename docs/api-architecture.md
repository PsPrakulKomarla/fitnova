# API Architecture & Versioning Specification

All new endpoints are strictly organized under `/api/v1/`.

## 1. Endpoints

### Authentication
- `POST /api/v1/auth/login`: Authenticate or initialize session.
- `GET  /api/v1/auth/me`: Retrieve current authenticated user identity.

### Profile
- `GET  /api/v1/profile`: Retrieve personal context and health constraints.
- `PUT  /api/v1/profile`: Update biometrics and dietary preferences. Emits `USER_PROFILE_UPDATED`.

### Goals & Energy Plans
- `GET  /api/v1/goals`: Retrieve active plan, Mifflin-St Jeor BMR, TDEE, and target macros.
- `PUT  /api/v1/goals`: Recalibrate targets or change active goal. Emits `GOAL_CHANGED`.
- `GET  /api/v1/goals/versions`: Retrieve audit log of plan versions.

### Food Domain (Phase 3)
- `POST /api/v1/food/scans`: Upload 1 or multiple food packaging images. Initiates asynchronous scan job.
- `GET  /api/v1/food/scans/:id`: Fetch scan job lifecycle state (`UPLOADED`, `PROCESSING`, `EXTRACTED`, `MATCHED`, `REQUIRES_VERIFICATION`, `COMPLETED`).
- `GET  /api/v1/food/products/:id`: Retrieve verified catalog product record.

---

## 2. Standardized Error Handling

All error responses strictly adhere to the schema:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Image size (12.4 MB) exceeds 10MB limit.",
    "details": null
  }
}
```
Standard status codes:
- `400`: Bad Request (`BAD_REQUEST`)
- `401`: Unauthenticated (`UNAUTHENTICATED`)
- `403`: Forbidden (`FORBIDDEN`)
- `404`: Not Found (`NOT_FOUND`)
- `422`: Unprocessable / Validation Error (`VALIDATION_ERROR`)
- `500`: Internal Server Error (`INTERNAL_SERVER_ERROR`)
