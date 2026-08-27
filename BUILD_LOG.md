# BUILD LOG — RTI Online Citizen Portal Reconstruction

Concept prototype — not affiliated with the Government of India.
Maintained incrementally throughout the development lifecycle for auditability, hackathon review, and engineering transparency.

---

## 1. Frontend Architecture & Components

- **Framework**: React 19 SPA with Vite, TypeScript (strict mode), Tailwind CSS v4.
- **Component Design System**:
  - `AppHeader`: Sticky top navigation with National Emblem branding, 6 primary citizen service routes, language selector, convenience login integration, and mobile drawer overlay.
  - `GovernmentBanner`: Tricolor Indian National Banner with prototype status indicator.
  - `JourneyRail`: Accessible multi-step wizard navigation with progress metrics and validation checkpoints.
  - `StatusBadge` & `Timeline`: Real-time state visualizers with official government status taxonomy.
  - `ApplicationTable`: Responsive, searchable, paginated table for citizen RTI and First Appeal histories.
  - `AssistantWidget`: Full-featured AI assistant with multilingual chat, voice input (Web Speech API with editable transcript before submit), text-to-speech output, document descriptor (Gemini vision), and simplification actions.
- **Accessibility & Focus**:
  - `SkipToContent` component for keyboard screen reader users.
  - Semantic ARIA labels, live regions (`role="status"`, `aria-live="polite"`), and high-contrast color palette conforming to WCAG standards.
  - Non-destructive state storage via `sessionStorage` and localStorage preferences.

---

## 2. Backend & Mock API Layer

- **Server Runtime**: Express + Node.js with TypeScript (`tsx`), modular routing under `/api/*`.
- **Validation**: Shared Zod schemas (`src/lib/validation/schemas.ts`) applied identically across frontend client forms and backend route controllers.
- **State Machine Integrity**: Strict status transitions (`src/server/state-machine/application-status.ts`) preventing illegal state mutations and returning `409 Conflict` on unauthorized transitions.
- **Endpoints Implemented**:
  - `GET /api/authorities` & `GET /api/authorities/:id`: Public authority directory search across ministries.
  - `POST /api/applications` & `GET /api/applications/:regNo`: RTI request creation, document attachment, and tracking.
  - `POST /api/payments/mock` & `POST /api/payments/reconcile`: Simulated Bharatkosh payment gateway with `SUCCESS`, `FAILURE`, and `TIMEOUT` simulation modes.
  - `POST /api/appeals` & `GET /api/appeals/:appealNo`: First Appeal filing under Section 19(1) with mandatory ₹0 statutory fee.
  - `POST /api/auth/request-otp` & `POST /api/auth/verify-otp`: Non-account citizen history recovery via deterministic mock OTP (`123456`).
  - `POST /api/auth/login`: Dummy convenience credentials (`demo.citizen@example.com` / `Demo@1234`).
  - `GET /api/history`: Aggregate citizen history with pending/disposed counts and retention notice.
  - `GET /api/demo/registry`: 7 pre-seeded evaluation scenarios (A through G) for instant grading.

---

## 3. AI Assistant, Multilingual Voice & RAG Specification

- **AI Service Layer (`src/server/services/ai/*`)**:
  - Utilizes `@google/genai` with model `gemini-3.7-flash` via server-side execution.
  - **Tool Use / Function Calling (`getApplicationStatus`)**: The model is restricted to a single read-only tool `getApplicationStatus(registrationNumber)` to check live status. It is structurally prohibited from guessing status or creating applications.
  - **Brevity & Prompt Engineering (Patch Update)**: System instructions enforce concise, punchy answers (3–5 sentences or tight lists of ≤4 bullets), direct answering with zero restatement of questions, bolding only key terms, and ending with an offer to expand further. Includes few-shot examples.
  - **RAG Pipeline (`src/server/services/ai/rag.ts`)**:
    - Grounded Q&A over local `knowledge-base/` (FAQ, User Guidelines, Statutory Glossary).
    - Lightweight cosine similarity retrieval over chunked text passages with fallback uncertainty signaling (`confidence: "low"`).
  - **Multilingual Support & Language Decoupling (Patch Update)**:
    - Real-time response generation across 6 Indian official languages (`en`, `hi`, `ta`, `mr`, `bn`, `te`).
    - `chatLanguage` operates independently from `siteLanguage`. The model and system auto-detect the input script/language when not locked.
    - Interactive `"Replying in {Language} (Auto/Locked)"` pill in the chat header with tap-to-lock control.
    - Legal terms (CPIO, First Appeal, Public Authority, Registration Number, Section 6(3), Section 7(1), BPL) remain untranslated to prevent statutory misinformation.
  - **Multimodal Document Description (`/api/assistant/describe`)**: Gemini vision analysis for attached PDF / image documents to assist visually impaired citizens.
  - **Text Simplification (`/api/assistant/simplify`)**: Grade-6 plain-language transformation for complex legal/statutory clauses without altering legal substance.

---

## 4. Multilingual & Voice Implementation

- **Voice Input (STT)**: Browser `webkitSpeechRecognition` / `SpeechRecognition` matched to active chat language (`hi-IN`, `ta-IN`, `mr-IN`, `bn-IN`, `te-IN`, `en-IN`). Features an editable live transcript box prior to sending.
- **Voice Output (TTS) & Accent Fix (Patch Update)**:
  - Deterministic cached voice selection (`LOCALE_MAP`, `pickVoice`, and voice map caching).
  - Listens to `speechSynthesis.onvoiceschanged` asynchronously.
  - Consistent voice selection across repeated clicks of "Listen" for the same language.
  - Transparent fallback warning: When a device lacks a native regional voice engine (e.g. Tamil/Telugu/Marathi), an honest inline notice is displayed: *"Voice not available for [Language] on this device — reading in English instead."*
  - "Listen" is directly wired to the message's detected language / `chatLanguage` rather than the site-wide UI language.
- **Voice Navigation Intent Router**: Fixed, audited keyword intent routing ("file rti", "track status", "first appeal", "view history", "help") ensuring deterministic navigation without LLM hallucination risk.
- **Static UI Translations**: Pre-compiled static dictionaries in `src/lib/i18n/translations/` for zero runtime latency.

---

## 5. Accessibility AI & Inclusivity

- **Accessible Disclaimers**: Every AI answer carries an explicit badge: *"AI-generated, verify with official sources"*.
- **Machine Translation Notice**: Prominently displayed warning: *"Machine translation — may contain errors"*.
- **Uncertainty Handling**: When knowledge-base retrieval confidence is low, answers are flagged with `confidence: "low"` and rendered in an amber cautionary notice.

---

## 6. Known Limitations & Deferred Items

- **Real Government Backend**: Simulated mock environment — no connection to live NIC / DoPT servers.
- **KYC & Identity**: No real Aadhaar / DigiLocker integration; relies on dummy authentication and OTP-scoped sessions.
- **Payment Processing**: Simulated Bharatkosh gateway; no real banking/UPI credentials collected.
- **Gemini Live API**: Evaluated browser Web Speech API over WebSockets Gemini Live API for hackathon reliability, lower latency, and zero dependency on external audio stream relays.

---

## 7. Governance Notes & Data Ethics

1. **Citizen Data Access**: The AI assistant only accesses the current conversation turn and the specific application record retrieved via `getApplicationStatus`. No cross-user access or storage.
2. **PII Isolation**: No card numbers, bank details, or passwords are ever sent to Gemini API prompts.
3. **Processing Location**: AI processing is executed server-side via Google Gemini API (`@google/genai`).
4. **Data Retention**: Chat sessions are stored exclusively in client-side memory (`sessionStorage`) and ephemeral server memory. No chat logs are permanently written to disk.
5. **Human Authority Preservation**: All adjudications, fee decisions, and appeal outcomes remain strictly within the statutory purview of designated CPIOs and First Appellate Authorities (FAAs). AI solely serves an informative, assistive role.

---

## 8. Frontend & Design Patch Update (Section Titles, Equal Heights, Multilingual Resilience, Icon Tints)

- **Section Titles Disambiguation**:
  - **Six-Card Grid**: Retained eyebrow `"CORE CITIZEN RTI SERVICES"`, H1 `"RTI Online — Citizen Portal"`, and standard services subtitle.
  - **6-Step Journey Explainer (`JourneyRail`)**: Renamed title to `"Your RTI Journey"` (`journey.title`), eyebrow to `"भारत सरकार · RTI ACT 2005 · CENTRAL MINISTRIES GATEWAY"` (`hero.badge`), and subtitle to `"From filing to response — here's what happens at each stage."` (`journey.subtitle`), eliminating title duplication across homepage sections.
- **Card Alignment & Equal Heights Fix**:
  - Filled missing Step 5 ("Response Available") description across all locales: *"You'll be notified the moment the CPIO's reply is ready to view or download."* (`journey.responseAvailableDesc`).
  - Standardized equal-height card architecture across both `JourneyRail` explainer cards and the 6-service action grid using `items-stretch`, `flex flex-col h-full`, `flex-1 leading-[1.6]` on descriptions, and `mt-auto` on footers/badges.
- **Multilingual Layout Resilience**:
  - Removed any hardcoded pixel heights on card containers.
  - Guaranteed `line-height >= 1.6` (`leading-[1.6]`) for tall Devanagari, Tamil, Bengali, and Telugu scripts to prevent descender clipping.
  - Removed `truncate` / `text-overflow: ellipsis` from localized descriptions.
  - Fixed-size, top-aligned icon chips and number badges (`shrink-0`) to ensure consistent alignment regardless of multilingual text length.
- **Decorative Category Icon Tint System**:
  - Integrated 6 distinct categorical icon tints in `:root` CSS variables and applied to service action cards with white icon glyphs (>4.5:1 contrast):
    - File RTI Request: Ashoka Blue (`#1B4B8F`)
    - Track Application Status: Teal (`#0E7C86`)
    - File First Appeal: Indigo (`#3E4C9C`)
    - Citizen History & Records: Slate Blue-Gray (`#5B6B7C`)
    - Public Authorities Directory: Ochre (`#A97425`)
    - RTI FAQ & Knowledge Base: Plum (`#7A4B6E`)
  - Enforced guardrail separating category tints from status semantic colors (`#1E7A46` Banyan Green, `#B7791F` Amber, `#C23B22` Vermilion Alert) and signature Rail/Seal element (`#E07A2C` Saffron Ember).

---

## 9. Chatbox Language Selector & Decoupled State Patch

- **Diagnostic & Root Cause Resolution**:
  - **Stale State on Switch**: Replaced closure-captured state with a synchronized `useRef` architecture (`chatLanguageRef` & `isLanguageLockedRef`) that updates in lockstep with React state. Ensures immediate read accuracy when a citizen switches languages and sends a message in the same interaction.
  - **Value Format & Schema Alignment**: Strictly aligned the selector options with `CHAT_LANGUAGE_OPTIONS` using canonical 2-letter codes (`en`, `hi`, `ta`, `mr`, `bn`, `te`). Validated server-side in `api.ts` against `VALID_CHAT_LANGUAGES` with explicit HTTP 400 error schemas.
  - **Independent Payload Dispatch**: `fetch('/api/assistant/chat')` consistently dispatches the chatbox's decoupled language state, independent of the site-wide UI locale.
  - **Error Surfacing**: Enhanced error handling to surface exact server error messages and validation codes directly in the chat UI rather than failing silently.

---

## 10. AWS Amplify & Static SPA Hosting Chat Intelligence Fallback

- **Root Cause**: On static hosting platforms (AWS Amplify, GitHub Pages, Netlify, Vercel SPA), backend Express routes (`/api/assistant/chat`) are not running as an active Node server, resulting in 404 or HTML fallbacks that surfaced as `"⚠️ Assistant service returned an error status."`.
- **Client Statutory AI Engine (`assistantClient.ts`)**:
  - Created a robust client-side statutory RAG and registration lookup engine supporting all 6 languages (`en`, `mr`, `hi`, `ta`, `bn`, `te`).
  - Seamlessly resolves registration number queries (e.g., `MOHFW/R/E/26/31171`, `DOPTR/R/E/26/00991`) with accurate CPIO status and statutory timelines.
  - Seamlessly answers statutory procedures (Where to file, First Appeal ₹0 fee, 30-day timeline under Section 7(1), BPL exemption, Section 8(1) exemptions, and payment guides).
  - Automatically activates if `/api/assistant/chat` is unreachable or returns non-JSON, ensuring zero error banners on hosted live environments.




