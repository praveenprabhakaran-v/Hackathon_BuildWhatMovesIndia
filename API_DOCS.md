# RTI Online Citizen Portal — Backend API Reference (`API_DOCS.md`)

This documentation outlines the RESTful API routes, request payloads, response structures, statutory validation rules, and error handling implemented in the **RTI Online Citizen Portal**.

---

## 1. General API Conventions & Architecture

- **Base Path**: `/api`
- **Content-Type**: `application/json; charset=utf-8`
- **Statutory Framework**: Right to Information Act, 2005 & RTI Rules, 2012
- **Statutory Application Fee**:
  - General Citizens: ₹10 per Section 6(1) application
  - BPL (Below Poverty Line) Card Holders: **₹0** (Statutory Fee Waiver)
  - Section 19(1) First Appeals: **₹0** (No filing fee under RTI Rules)

### Standard HTTP Status Codes
| Status Code | Description |
|---|---|
| `200 OK` | Successful query or state retrieval |
| `201 Created` | Application, draft, or First Appeal successfully registered |
| `400 Bad Request` | Malformed JSON or invalid parameter syntax |
| `401 Unauthorized` | Missing or expired citizen session / OTP authentication |
| `404 Not Found` | Registration Number or Public Authority ID does not exist |
| `409 Conflict` | Illegal statutory state transition (e.g. attempting to pay for an already disposed RTI) |
| `422 Unprocessable Entity` | Zod schema validation failure (includes field-level error mapping) |
| `500 Internal Server Error` | Unexpected server failure |

### Standard Validation Error Shape (422 Unprocessable Entity)
```json
{
  "error": "Please fix the highlighted fields before submitting.",
  "fieldErrors": {
    "applicant.fullName": "Full Name is required and must be at least 2 characters.",
    "applicant.pincode": "Pincode must be exactly 6 digits.",
    "applicant.mobile": "Mobile number must be a valid 10-digit Indian number."
  }
}
```

---

## 2. Public Authorities API

### `GET /api/authorities`
Search public authorities, central ministries, departments, CPIOs, and FAAs.

#### Query Parameters:
| Param | Type | Required | Description |
|---|---|---|---|
| `query` | `string` | No | Search keyword matching authority name, code, or ministry (e.g. `Revenue`, `CBIC`) |
| `ministry` | `string` | No | Filter by parent ministry name |

#### Sample Response (`200 OK`):
```json
[
  {
    "id": "cbic",
    "code": "CBICD",
    "name": "Central Board of Indirect Taxes and Customs",
    "ministry": "Ministry of Finance",
    "category": "CENTRAL_MINISTRY",
    "isActive": true,
    "cpioName": "Shri R. K. Sharma",
    "cpioDesignation": "Director & CPIO",
    "faaName": "Dr. Neeta Verma",
    "faaDesignation": "Joint Secretary & FAA"
  },
  {
    "id": "dot",
    "code": "DOTEL",
    "name": "Department of Telecommunications",
    "ministry": "Ministry of Communications",
    "category": "CENTRAL_MINISTRY",
    "isActive": true,
    "cpioName": "Shri Amit Kumar",
    "cpioDesignation": "Under Secretary & CPIO",
    "faaName": "Smt. Sunita Rao",
    "faaDesignation": "DDG & FAA"
  }
]
```

---

### `GET /api/authorities/:id`
Retrieve detailed metadata and nodal officers for a specific authority.

#### Path Parameters:
- `id` (`string`, required): Unique authority code (e.g., `cbic`, `dot`, `dopt`)

#### Sample Response (`200 OK`):
```json
{
  "id": "cbic",
  "code": "CBICD",
  "name": "Central Board of Indirect Taxes and Customs",
  "ministry": "Ministry of Finance",
  "category": "CENTRAL_MINISTRY",
  "isActive": true,
  "cpioName": "Shri R. K. Sharma",
  "cpioDesignation": "Director & CPIO",
  "faaName": "Dr. Neeta Verma",
  "faaDesignation": "Joint Secretary & FAA"
}
```

---

## 3. RTI Applications API (Section 6)

### `POST /api/applications`
Lodge a new RTI application under Section 6(1) or create a payment-ready draft.

#### Request Body (`application/json`):
```json
{
  "authorityId": "cbic",
  "applicant": {
    "fullName": "Aarav Sharma",
    "gender": "MALE",
    "email": "aarav.sharma@example.com",
    "mobile": "9876543210",
    "country": "India",
    "state": "Delhi",
    "city": "New Delhi",
    "addressLine1": "Plot 42, Barakhamba Road",
    "pincode": "110001"
  },
  "bpl": {
    "isBpl": false
  },
  "request": {
    "text": "Certified copies of tender allocation orders for procurement reference CBIC-2025-0819.",
    "wordCount": 11
  }
}
```

#### Sample Response for Non-BPL (`201 Created` — Draft Created for Payment):
```json
{
  "draftId": "d_9x8f2a1b",
  "status": "PAYMENT_PENDING",
  "feeAmount": 10,
  "isBplExempt": false,
  "message": "Draft created successfully. Proceed to payment."
}
```

#### Sample Response for BPL Applicant (`201 Created` — Direct Submission):
```json
{
  "registrationNumber": "CBICD/R/E/26/00912",
  "status": "SUBMITTED",
  "feeAmount": 0,
  "isBplExempt": true,
  "filedOn": "2026-08-22T19:44:00.000Z"
}
```

---

### `GET /api/applications/:regNo`
Track application status, statutory countdown clock, CPIO decisions, and full audit timeline.

#### Path Parameters:
- `regNo` (`string`, required): RTI Registration Number (e.g., `DORF/R/E/26/00482`)

#### Sample Response (`200 OK`):
```json
{
  "registrationNumber": "DORF/R/E/26/00482",
  "status": "RESPONSE_AVAILABLE",
  "authority": {
    "code": "DORF",
    "name": "Department of Revenue",
    "ministry": "Ministry of Finance"
  },
  "applicant": {
    "fullName": "Aarav Sharma",
    "email": "aarav.sharma@example.com"
  },
  "filedOn": "2026-08-01T10:00:00.000Z",
  "timeline": [
    {
      "state": "SUBMITTED",
      "title": "Application Lodged",
      "at": "2026-08-01T10:00:00.000Z"
    },
    {
      "state": "UNDER_PROCESS",
      "title": "Under Active Scrutiny by CPIO",
      "at": "2026-08-05T14:30:00.000Z"
    },
    {
      "state": "RESPONSE_AVAILABLE",
      "title": "CPIO Decision & Official Reply Uploaded",
      "at": "2026-08-18T16:00:00.000Z"
    }
  ],
  "responseDocument": {
    "fileId": "resp-dorf-00482",
    "fileName": "DORF_RTI_Reply_00482.pdf",
    "disposedDate": "2026-08-18T16:00:00.000Z",
    "closingRemarks": "Point-wise information provided as per official records."
  }
}
```

---

### `POST /api/applications/:regNo/pay-additional`
Pay photostat / reproduction fee demanded by CPIO under Section 7(3).

#### Path Parameters:
- `regNo` (`string`, required): Application registration number with status `ADDITIONAL_FEE_REQUIRED`

#### Request Body (`application/json`):
```json
{
  "simulate": "SUCCESS"
}
```

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "status": "UNDER_PROCESS",
  "message": "Additional fee paid successfully. Application processing resumed."
}
```

---

## 4. Payment Gateway & Reconciliation API

### `POST /api/payments/mock`
Simulate Bharatkosh / UPI / RuPay payment gateway execution.

#### Request Body (`application/json`):
```json
{
  "draftId": "d_9x8f2a1b",
  "method": "UPI",
  "simulate": "SUCCESS"
}
```

#### Sample Response (`200 OK`):
```json
{
  "status": "PAYMENT_SUCCESS",
  "registrationNumber": "CBICD/R/E/26/00912",
  "transactionRef": "TXN2026082218492019",
  "filedOn": "2026-08-22T19:44:00.000Z",
  "amount": 10
}
```

---

### `POST /api/payments/reconcile`
Verify bank transaction status for pending, interrupted, or double-debited payments.

#### Request Body (`application/json`):
```json
{
  "registrationOrTransactionRef": "DORF/R/E/26/00482"
}
```

#### Sample Response (`200 OK`):
```json
{
  "reconciled": true,
  "status": "SUCCESS",
  "registrationNumber": "DORF/R/E/26/00482",
  "transactionRef": "TXN20260801849201",
  "amount": 10,
  "message": "Payment verified with NTRP / Bharatkosh gateway."
}
```

---

## 5. First Appeals API (Section 19)

### `POST /api/appeals`
Lodge a First Appeal under Section 19(1) of the RTI Act before the First Appellate Authority. **Statutory fee is strictly ₹0**.

#### Request Body (`application/json`):
```json
{
  "originalRegistrationNumber": "MORTH/R/E/26/00341",
  "groundOfAppeal": "NO_RESPONSE_WITHIN_TIME",
  "prayerAndRelief": "Direction to CPIO to provide certified highway alignment survey maps without charging further cost.",
  "additionalFacts": "30 days elapsed without statutory response under Section 7(1)."
}
```

#### Sample Response (`201 Created`):
```json
{
  "appealNumber": "MORTH/A/E/26/00142",
  "originalRegistrationNumber": "MORTH/R/E/26/00341",
  "status": "UNDER_HEARING",
  "faaOfficer": "Dr. Neeta Verma, Joint Secretary & FAA",
  "filedOn": "2026-08-22T19:45:00.000Z",
  "turnaroundDays": 30
}
```

---

### `GET /api/appeals/:appealNo`
Track First Appeal status, FAA bench details, and decision orders.

#### Path Parameters:
- `appealNo` (`string`, required): First Appeal Number (e.g., `MORTH/A/E/26/00142`)

#### Sample Response (`200 OK`):
```json
{
  "appealNumber": "MORTH/A/E/26/00142",
  "originalRegistrationNumber": "MORTH/R/E/26/00341",
  "status": "UNDER_HEARING",
  "groundOfAppeal": "NO_RESPONSE_WITHIN_TIME",
  "faaName": "Dr. Neeta Verma",
  "faaDesignation": "Joint Secretary & FAA"
}
```

---

## 6. Citizen Authentication & OTP API

### `POST /api/auth/request-otp`
Generate a 6-digit one-time password sent to registered mobile/email.

#### Request Body:
```json
{
  "email": "aarav.sharma@example.com"
}
```

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "message": "OTP sent successfully to aarav.sharma@example.com.",
  "demoOtp": "123456"
}
```

---

### `POST /api/auth/verify-otp`
Verify 6-digit OTP and establish session.

#### Request Body:
```json
{
  "email": "aarav.sharma@example.com",
  "otp": "123456"
}
```

#### Sample Response (`200 OK`):
```json
{
  "token": "sess_rti_9a8b7c6d5e4f",
  "user": {
    "email": "aarav.sharma@example.com",
    "name": "Aarav Sharma"
  },
  "expiresIn": 1800
}
```

---

### `GET /api/history`
Retrieve all RTI applications and First Appeals linked to the citizen's account.

#### Sample Response (`200 OK`):
```json
{
  "applications": [
    {
      "registrationNumber": "DORF/R/E/26/00482",
      "status": "RESPONSE_AVAILABLE",
      "authorityName": "Department of Revenue",
      "feePaid": 10
    }
  ],
  "appeals": [
    {
      "appealNumber": "MORTH/A/E/26/00142",
      "originalRegistrationNumber": "MORTH/R/E/26/00341",
      "status": "UNDER_HEARING"
    }
  ]
}
```

---

## 7. Knowledge Base & FAQs API

### `GET /api/faq`
Search statutory FAQs across fee, exemption, and appeal categories.

#### Sample Response (`200 OK`):
```json
[
  {
    "id": "faq-fee-1",
    "question": "What is the statutory application fee for filing an RTI request?",
    "answer": "As per Rule 3 of RTI Rules 2012, a fee of ₹10 (Rupees Ten only) is required. BPL card holders are fully exempt.",
    "category": "payment"
  }
]
```

---

## 8. Test Suite Registry & Health Check

### `GET /api/demo/registry`
Returns the evaluation matrix covering all 7 core statutory scenarios (A through G):

| Scenario | Name | Registration No | Status |
|---|---|---|---|
| **A** | Normal Processing & Reply Available | `DORF/R/E/26/00482` | `RESPONSE_AVAILABLE` |
| **B** | Additional Fee Demanded (₹120) | `MOHFW/R/E/26/00192` | `ADDITIONAL_FEE_REQUIRED` |
| **C** | Transferred under Section 6(3) | `DOTEL/R/E/26/00812` | `TRANSFERRED` |
| **D** | Multiple CPIO Division | `RAILW/R/E/26/01205` | `MULTIPLE_CPIO` |
| **E** | Supporting Document Required | `CBICD/R/E/26/00764` | `SUPPORTING_DOCUMENT_REQUIRED` |
| **F** | Returned / Exempt under Sec 8(1)(a) | `MINHA/R/E/26/12093` | `RETURNED` |
| **G** | First Appeal Lodged (₹0 Fee) | `MORTH/R/E/26/00341` | `UNDER_HEARING` |

---

### `GET /api/health`
Health check endpoint reporting server status and uptime.

#### Sample Response (`200 OK`):
```json
{
  "status": "UP",
  "version": "1.0.0",
  "service": "RTI Online Citizen Portal Mock Backend",
  "timestamp": "2026-08-22T19:45:00.000Z"
}
```
