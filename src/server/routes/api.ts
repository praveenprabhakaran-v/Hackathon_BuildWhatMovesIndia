/**
 * Express REST API Routes for RTI Online Citizen Portal
 * Implements full backend specification with Zod validation, state machine integrity,
 * mock payments, dummy auth, and demo registries.
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {
  CreateApplicationSchema,
  MockPaymentSchema,
  CreateAppealSchema,
  RequestOtpSchema,
  VerifyOtpSchema,
  LoginSchema,
  ReconcilePaymentSchema,
} from '../../lib/validation/schemas';
import { formatZodErrors } from '../../lib/validation';
import * as authoritiesService from '../services/authorities';
import * as applicationsService from '../services/applications';
import * as appealsService from '../services/appeals';
import * as paymentsService from '../services/payments';
import * as historyService from '../services/history';
import * as authService from '../services/auth';
import * as faqService from '../services/faq';
import * as aiChatService from '../services/ai/chat';
import { store } from '../store';
import { StateTransitionError } from '../state-machine/application-status';

export const apiRouter = Router();

// Multer in-memory storage for PDF file uploads (1 MB max)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 }, // 1 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are allowed.'));
    }
  },
});

// Middleware for token auth extraction
function extractAuthUser(req: Request): authService.AuthSession | null {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.rti_session) {
    token = req.cookies.rti_session;
  }

  if (!token) return null;
  return authService.verifySessionToken(token);
}

/* ========================================================================= */
/* 1. AUTHORITIES                                                            */
/* ========================================================================= */

// GET /api/authorities
apiRouter.get('/authorities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.query as string) || '';
    const ministry = (req.query.ministry as string) || '';
    const data = await authoritiesService.searchAuthorities(query, ministry);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/authorities/:id
apiRouter.get('/authorities/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = await authoritiesService.getAuthorityById(req.params.id);
    if (!auth) {
      return res.status(404).json({ error: 'Public Authority not found.' });
    }
    res.status(200).json(auth);
  } catch (err) {
    next(err);
  }
});

/* ========================================================================= */
/* 2. RTI APPLICATIONS                                                       */
/* ========================================================================= */

// POST /api/applications (File new RTI)
apiRouter.post('/applications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = CreateApplicationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        error: 'Please fix the highlighted fields before submitting.',
        fieldErrors: formatZodErrors(validation.error),
      });
    }

    const result = await applicationsService.createApplicationDraft(validation.data);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.name === 'StateTransitionError') {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
});

// GET /api/applications/:regNo (Status and timeline)
apiRouter.get('/applications/:regNo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const app = await applicationsService.getApplicationByRegNo(req.params.regNo);
    if (!app) {
      return res.status(404).json({ error: 'No application found for that registration number.' });
    }
    res.status(200).json(app);
  } catch (err) {
    next(err);
  }
});

// POST /api/applications/:regNo/pay-additional
apiRouter.post('/applications/:regNo/pay-additional', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const simulate = (req.body.simulate as any) || 'SUCCESS';
    const result = await applicationsService.payAdditionalFee(req.params.regNo, simulate);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.name === 'StateTransitionError') {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
});

// POST /api/applications/:regNo/upload-document
apiRouter.post(
  '/applications/:regNo/upload-document',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(422).json({
          error: 'Please select a valid PDF file under 1 MB.',
          fieldErrors: { file: 'PDF document is required.' },
        });
      }

      const result = await applicationsService.uploadSupportingDocument(req.params.regNo, req.file);
      res.status(200).json(result);
    } catch (err: any) {
      if (err.message && err.message.includes('PDF')) {
        return res.status(422).json({
          error: 'Invalid file format. Only PDF documents under 1 MB are accepted.',
          fieldErrors: { file: 'Only PDF documents under 1 MB are accepted.' },
        });
      }
      next(err);
    }
  }
);

/* ========================================================================= */
/* 3. MOCK PAYMENTS & RECONCILIATION                                         */
/* ========================================================================= */

// POST /api/payments/mock
apiRouter.post('/payments/mock', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = MockPaymentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        error: 'Invalid payment parameters.',
        fieldErrors: formatZodErrors(validation.error),
      });
    }

    const result = await paymentsService.processMockPayment(validation.data);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.name === 'StateTransitionError') {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
});

// POST /api/payments/reconcile
apiRouter.post('/payments/reconcile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = ReconcilePaymentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        error: 'Please enter a valid Registration Number or Transaction Reference.',
        fieldErrors: formatZodErrors(validation.error),
      });
    }

    const result = await paymentsService.reconcilePayment(validation.data.registrationOrTransactionRef);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

/* ========================================================================= */
/* 4. FIRST APPEALS (Always ₹0 fee)                                          */
/* ========================================================================= */

// POST /api/appeals
apiRouter.post('/appeals', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = CreateAppealSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        error: 'Please fix the highlighted fields before submitting your First Appeal.',
        fieldErrors: formatZodErrors(validation.error),
      });
    }

    const result = await appealsService.createFirstAppeal(validation.data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/appeals/:appealNo
apiRouter.get('/appeals/:appealNo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appeal = await appealsService.getAppealByNumber(req.params.appealNo);
    if (!appeal) {
      return res.status(404).json({ error: 'No appeal found for that registration number.' });
    }
    res.status(200).json(appeal);
  } catch (err) {
    next(err);
  }
});

/* ========================================================================= */
/* 5. DUMMY AUTHENTICATION & OTP RECOVERY                                    */
/* ========================================================================= */

// POST /api/auth/request-otp
apiRouter.post('/auth/request-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = RequestOtpSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        error: 'Please enter a valid email or mobile number.',
        fieldErrors: formatZodErrors(validation.error),
      });
    }

    const id = validation.data.email || validation.data.mobile || validation.data.identifier || '';
    const result = await authService.requestOtp(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verify-otp
apiRouter.post('/auth/verify-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = VerifyOtpSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        error: 'Please enter the 6-digit OTP code.',
        fieldErrors: formatZodErrors(validation.error),
      });
    }

    const id = validation.data.email || validation.data.mobile || validation.data.identifier || '';
    const result = await authService.verifyOtp(id, validation.data.otp);

    // Set HTTP-only session cookie
    res.cookie('rti_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 60 * 1000, // 30 mins
      sameSite: 'lax',
    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid OTP.' });
  }
});

// POST /api/auth/login (Convenience Mock Login)
apiRouter.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        error: 'Please provide both email and password.',
        fieldErrors: formatZodErrors(validation.error),
      });
    }

    const result = await authService.loginWithCredentials(validation.data.email, validation.data.password);

    res.cookie('rti_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      sameSite: 'lax',
    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Incorrect email or password.' });
  }
});

/* ========================================================================= */
/* 6. CITIZEN HISTORY                                                        */
/* ========================================================================= */

// GET /api/history
apiRouter.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = extractAuthUser(req);
    const emailQuery = (req.query.email as string) || session?.email || 'demo.citizen@example.com';
    const history = await historyService.getCitizenHistory(emailQuery);
    res.status(200).json(history);
  } catch (err) {
    next(err);
  }
});

/* ========================================================================= */
/* 7. FAQ & KNOWLEDGE BASE                                                   */
/* ========================================================================= */

// GET /api/faq
apiRouter.get('/faq', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = (req.query.category as string) || '';
    const query = (req.query.query as string) || '';
    const data = await faqService.getFaqs(category, query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

/* ========================================================================= */
/* 8. AI ASSISTANT, RAG & ACCESSIBILITY                                      */
/* ========================================================================= */

// POST /api/assistant/chat (Multilingual Chat & Function Calling)
const VALID_CHAT_LANGUAGES = ['en', 'hi', 'ta', 'mr', 'bn', 'te'] as const;

apiRouter.post('/assistant/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, language, isLanguageLocked, conversationId } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.', fieldErrors: { message: 'Required non-empty string' } });
    }

    const requestedLang = (language || 'en').toString().toLowerCase().trim();
    if (!VALID_CHAT_LANGUAGES.includes(requestedLang as any)) {
      return res.status(400).json({
        error: `Invalid language code "${language}". Expected one of: ${VALID_CHAT_LANGUAGES.join(', ')}.`,
        fieldErrors: { language: `Must be one of ${VALID_CHAT_LANGUAGES.join(', ')}` },
      });
    }

    const response = await aiChatService.processCitizenChat({
      message,
      language: requestedLang as (typeof VALID_CHAT_LANGUAGES)[number],
      isLanguageLocked: Boolean(isLanguageLocked),
      conversationId,
    });

    res.status(200).json(response);
  } catch (err: any) {
    console.error('[/api/assistant/chat] Server error:', err);
    res.status(500).json({
      error: err?.message || 'Failed to process chat request.',
    });
  }
});

// POST /api/assistant/simplify (Grade-6 Plain Language Simplifier)
apiRouter.post('/assistant/simplify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { passage, language } = req.body;
    if (!passage || typeof passage !== 'string') {
      return res.status(400).json({ error: 'Passage text is required.' });
    }

    const result = await aiChatService.simplifyPassage(passage, language || 'en');
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/assistant/describe (Gemini Vision Multimodal Document Descriptor)
apiRouter.post('/assistant/describe', upload.single('document'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    let base64Data = '';
    let mimeType = 'application/pdf';

    if (req.file) {
      base64Data = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    } else if (req.body.fileBase64) {
      base64Data = req.body.fileBase64;
      mimeType = req.body.mimeType || 'application/pdf';
    } else {
      return res.status(400).json({ error: 'Please attach a document or provide base64 data to describe.' });
    }

    const result = await aiChatService.describeDocument(base64Data, mimeType, req.body.language || 'en');
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

/* ========================================================================= */
/* 9. DEMO REGISTRY & HEALTH                                                 */
/* ========================================================================= */

// GET /api/demo/registry (Returns all 7 test cases for judges & evaluators)
apiRouter.get('/demo/registry', (_req: Request, res: Response) => {
  res.status(200).json({
    scenarios: [
      { code: 'A', name: 'Normal Processing & Reply Available', regNo: 'DORF/R/E/26/00482', status: 'RESPONSE_AVAILABLE' },
      { code: 'B', name: 'Additional Fee Demanded (₹120)', regNo: 'MOHFW/R/E/26/00192', status: 'ADDITIONAL_FEE_REQUIRED' },
      { code: 'C', name: 'Transferred under Section 6(3)', regNo: 'DOTEL/R/E/26/00812', status: 'TRANSFERRED' },
      { code: 'D', name: 'Multiple CPIO Division (3 cases)', regNo: 'RAILW/R/E/26/01205', status: 'MULTIPLE_CPIO' },
      { code: 'E', name: 'Supporting Document Required', regNo: 'CBICD/R/E/26/00764', status: 'SUPPORTING_DOCUMENT_REQUIRED' },
      { code: 'F', name: 'Returned / Exempt under Sec 8(1)(a)', regNo: 'MINHA/R/E/26/12093', status: 'RETURNED' },
      { code: 'G', name: 'First Appeal Lodged (₹0 fee)', regNo: 'MORTH/R/E/26/00341', appealNo: 'MORTH/A/E/26/00142', status: 'UNDER_HEARING' },
    ],
    demoAccounts: [
      { email: 'demo.citizen@example.com', password: 'Demo@1234', role: 'Citizen' },
      { email: 'demo.citizen2@example.com', password: 'Demo@1234', role: 'Citizen' },
      { email: 'judge.evaluator@nic.in', password: 'evaluator@2026', role: 'Judge / Evaluator' },
    ],
    demoOtp: '123456',
  });
});

// GET /api/health
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    version: '1.0.0',
    service: 'RTI Online Citizen Portal Mock Backend',
    timestamp: new Date().toISOString(),
  });
});

// Generic Error Handling Middleware (Returns standard ApiError shape §9.8)
apiRouter.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API Error:', err);

  if (err instanceof StateTransitionError) {
    return res.status(409).json({ error: err.message });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred. Please try again.';

  res.status(statusCode).json({
    error: message,
    fieldErrors: err.fieldErrors || undefined,
  });
});
