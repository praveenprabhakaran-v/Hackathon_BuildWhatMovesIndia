/**
 * AI Assistant Chat & Orchestration Layer
 * Implements OpenAI-powered status tool-calling, RAG grounded responses,
 * multilingual support (en, hi, ta, mr, bn, te), text simplification, and document description.
 */

import OpenAI from 'openai';
import { store } from '../../store';
import { retrieveContext } from './rag';

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'mr' | 'bn' | 'te';

export interface ChatRequest {
  message: string;
  language?: SupportedLanguage;
  isLanguageLocked?: boolean;
  conversationId?: string;
}

export interface ChatResponse {
  reply: string;
  language: SupportedLanguage;
  detectedLanguage: SupportedLanguage;
  sources?: { title: string; excerpt: string }[];
  usedTool?: 'getApplicationStatus';
  confidence: 'high' | 'low';
}

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  ta: 'Tamil (தமிழ்)',
  mr: 'Marathi (मराठी)',
  bn: 'Bengali (বাংলা)',
  te: 'Telugu (తెలుగు)',
};

/**
 * Detect script / language of input text
 */
export function detectInputLanguage(text: string, defaultLang: SupportedLanguage = 'en'): SupportedLanguage {
  if (!text) return defaultLang;

  // Tamil: \u0B80-\u0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  // Telugu: \u0C00-\u0C7F
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  // Bengali: \u0980-\u09FF
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  // Devanagari (Hindi / Marathi): \u0900-\u097F
  if (/[\u0900-\u097F]/.test(text)) {
    if (defaultLang === 'mr' || /\b(आहे|झाले|करणे|माहिती|अर्ज|नाही)\b/.test(text)) return 'mr';
    return 'hi';
  }

  // If text is primarily Latin letters
  return defaultLang;
}

/**
 * OpenAI Tool definition for getApplicationStatus
 */
const getApplicationStatusTool: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'getApplicationStatus',
    description:
      'Look up the current real-time status of an RTI application or First Appeal by its unique registration number (e.g. DOPTR/R/E/26/00991 or DORF/R/E/26/00482). Always call this tool before answering questions regarding application status.',
    parameters: {
      type: 'object',
      properties: {
        registrationNumber: {
          type: 'string',
          description:
            'The exact 18-character RTI or First Appeal Registration Number (e.g. DORF/R/E/26/00482 or MORTH/A/E/26/00142).',
        },
      },
      required: ['registrationNumber'],
    },
  },
};

/**
 * Look up application or appeal in mock store
 */
export function lookupApplicationStatus(registrationNumber: string) {
  const cleanReg = (registrationNumber || '').trim().toUpperCase();
  const app = store.applications.get(cleanReg);
  if (app) {
    return {
      type: 'REQUEST',
      registrationNumber: app.registrationNumber,
      status: app.status,
      authority: app.authority?.name || 'Central Public Authority',
      ministry: app.authority?.ministry || 'Government of India',
      filedOn: app.filedOn,
      actionRequired: app.actionRequired || null,
      transferredTo: app.transferredTo || null,
      childApplications: app.childApplications || [],
      timeline: app.timeline,
      canAppeal: app.canAppeal || false,
    };
  }

  const appeal = store.appeals.get(cleanReg);
  if (appeal) {
    return {
      type: 'FIRST_APPEAL',
      appealRegistrationNumber: appeal.appealRegistrationNumber,
      originalRegistrationNumber: appeal.originalRegistrationNumber,
      status: appeal.status,
      ground: appeal.ground,
      filedOn: appeal.filedOn,
      timeline: appeal.timeline,
    };
  }

  return { error: 'not_found', message: `No RTI Application or First Appeal found for registration number: ${cleanReg}` };
}

/**
 * Main Chat Processing Function using OpenAI API
 */
export async function processCitizenChat(req: ChatRequest): Promise<ChatResponse> {
  const preferredLang: SupportedLanguage = req.language || 'en';
  const rawMessage = (req.message || '').trim();

  // If language is not locked, detect input language directly from citizen's query
  const detectedLanguage: SupportedLanguage = req.isLanguageLocked
    ? preferredLang
    : detectInputLanguage(rawMessage, preferredLang);

  const activeLanguage = detectedLanguage;

  if (!rawMessage) {
    return {
      reply: 'Please ask a question about RTI applications, guidelines, or status.',
      language: activeLanguage,
      detectedLanguage: activeLanguage,
      confidence: 'high',
    };
  }

  // Check if query is an explicit registration number pattern
  const regMatch = rawMessage.match(/[A-Z]{3,8}\/[RA]\/[A-Z]\/\d{2}\/\d{4,6}(?:\/\d+)?/i);

  // Check for OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY;

  // SYSTEM INSTRUCTION with Brevity Rules, Few-shot Examples, and Decoupled Language Handling
  const systemInstruction = `
You are the official RTI Online AI Citizen Assistant, a concept-prototype helper. You are NOT a government official and cannot make legal decisions.

CORE BEHAVIOR & BREVITY RULES:
1. Keep answers short by default: 3–5 sentences, or a tight bullet list of at most 4 items.
2. Do NOT restate the citizen's question back to them, and do not open with throat-clearing sentences like "An RTI application can be filed with..." — lead directly with the answer.
3. Bold only the 2–3 terms that matter most, not every proper noun.
4. If there's genuinely more useful detail available, end with a short, specific offer to expand (e.g. "Want more detail on the offline process?") rather than dumping everything up front.
5. Only give a longer answer if the citizen explicitly asks for detailed explanations or for multi-part status edge cases.

LANGUAGE & STATUTORY TERMS:
1. Detect the language the citizen is typing in (${LANGUAGE_NAMES[activeLanguage]}). Respond natively in ${LANGUAGE_NAMES[activeLanguage]} (${activeLanguage}).
2. Legal & Statutory Terms (CPIO, First Appeal, Public Authority, Registration Number, Nodal Officer, Section 6(3), Section 7(1), Section 8(1), Section 19(1), BPL) MUST NOT be translated or transliterated. Keep them in their standard English/official representation with surrounding context in the target language.
3. Never mix two languages within a single reply.

APPLICATION STATUS (TOOL USE):
1. If the citizen asks about the status of an RTI application or First Appeal:
   - If they provided a registration number, call getApplicationStatus(registrationNumber). Never guess or hallucinate a status.
   - If no registration number is given, ask them directly for their 18-character registration number.
2. End status explanations with: "This is an AI-generated summary — please verify against the official status page."

GROUNDING & UNCERTAINTY:
If you do not have verified statutory information on an inquiry, state plainly: "I do not have verified information on that in this prototype — please check Help & Contact or the official portal."

FEW-SHOT EXAMPLES:
Citizen: Where to file rti application
Good reply: You can file it two ways:
- **Online** — through the RTI Online Portal, for Central Government authorities
- **Offline** — a written application to the CPIO of that department, with a ₹10 fee (free if BPL)

Filing with a State Government department? That goes through your state's own portal, not this one.

Want more detail on either option?

Citizen: What is the fee for first appeal?
Good reply: The statutory fee for filing a **First Appeal** under Section 19(1) is **₹0 (Free)**. There is no application fee.

Would you like guidance on the 30-day appeal timeline or grounds?
`;

  if (apiKey) {
    try {
      const openai = new OpenAI({ apiKey });

      // Retrieve grounded context
      const retrieved = retrieveContext(rawMessage, 3);
      const contextText = retrieved.chunks
        .map((c) => `[Source: ${c.title}]\n${c.content}`)
        .join('\n\n');

      const userContent = `Target Response Language: ${LANGUAGE_NAMES[activeLanguage]} (${activeLanguage})\nContext knowledge:\n${contextText}\n\nCitizen Query: "${rawMessage}"`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userContent },
        ],
        tools: [getApplicationStatusTool],
        tool_choice: 'auto',
        temperature: 0.2,
      });

      const responseMessage = completion.choices[0]?.message;

      // Handle function calling if invoked
      if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
        const toolCall = responseMessage.tool_calls[0];
        if (toolCall.type === 'function' && toolCall.function.name === 'getApplicationStatus') {
          let parsedArgs = { registrationNumber: '' };
          try {
            parsedArgs = JSON.parse(toolCall.function.arguments || '{}');
          } catch {
            parsedArgs = { registrationNumber: '' };
          }

          const toolResult = lookupApplicationStatus(parsedArgs.registrationNumber);

          // Second round to synthesize tool response
          const secondCompletion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: userContent },
              responseMessage,
              {
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(toolResult),
              },
            ],
            temperature: 0.2,
          });

          const replyText = secondCompletion.choices[0]?.message?.content || 'Unable to summarize status at this time.';

          return {
            reply: replyText,
            language: activeLanguage,
            detectedLanguage: activeLanguage,
            usedTool: 'getApplicationStatus',
            confidence: 'high',
          };
        }
      }

      const sources = retrieved.chunks.map((c) => ({
        title: c.title,
        excerpt: c.content.slice(0, 150) + '...',
      }));

      return {
        reply: responseMessage?.content || 'I could not generate an answer. Please verify with official portal resources.',
        language: activeLanguage,
        detectedLanguage: activeLanguage,
        sources,
        confidence: retrieved.confidence,
      };
    } catch (err) {
      console.warn('[OpenAI Assistant] Error in API call, falling back to local deterministic rule engine:', err);
    }
  }

  // Deterministic local fallback if no API key or API call fails
  if (regMatch) {
    const regNo = regMatch[0].toUpperCase();
    const result = lookupApplicationStatus(regNo);
    if ('error' in result) {
      return {
        reply: `No RTI application or First Appeal was found matching Registration Number **${regNo}**. Please double-check your receipt or SMS.\n\n*This is an AI-generated summary — please verify against the official status page.*`,
        language: activeLanguage,
        detectedLanguage: activeLanguage,
        usedTool: 'getApplicationStatus',
        confidence: 'high',
      };
    }

    if (result.type === 'REQUEST') {
      let desc = `**Application Status for ${result.registrationNumber}**\n- **Authority**: ${result.authority}\n- **Current State**: ${result.status}\n- **Filed Date**: ${new Date(result.filedOn).toLocaleDateString('en-IN')}`;
      if (result.actionRequired?.type === 'ADDITIONAL_FEE') {
        desc += `\n- **Action Required**: Additional fee of ₹${result.actionRequired.amount} demanded for ${result.actionRequired.reason}.`;
      }
      desc += `\n\nWant help with fee payment or First Appeal options?\n\n*This is an AI-generated summary — please verify against the official status page.*`;

      return {
        reply: desc,
        language: activeLanguage,
        detectedLanguage: activeLanguage,
        usedTool: 'getApplicationStatus',
        confidence: 'high',
      };
    }
  }

  // Fallback RAG search with concise format
  const lowerMsg = rawMessage.toLowerCase();
  if (lowerMsg.includes('where') && (lowerMsg.includes('file') || lowerMsg.includes('apply'))) {
    return {
      reply: `You can file it two ways:\n- **Online** — through the RTI Online Portal, for Central Government authorities\n- **Offline** — a written application to the CPIO of that department, with a ₹10 fee (free if BPL)\n\nFiling with a State Government department? That goes through your state's own portal, not this one.\n\nWant more detail on either option?\n\n*AI-generated, verify with official sources.*`,
      language: activeLanguage,
      detectedLanguage: activeLanguage,
      confidence: 'high',
    };
  }

  const retrieved = retrieveContext(rawMessage, 2);
  const primaryChunk = retrieved.chunks[0];

  if (primaryChunk && retrieved.confidence === 'high') {
    return {
      reply: `${primaryChunk.content}\n\nNeed more details on this topic?\n\n*AI-generated, verify with official sources.*`,
      language: activeLanguage,
      detectedLanguage: activeLanguage,
      sources: retrieved.chunks.map((c) => ({ title: c.title, excerpt: c.content.slice(0, 150) + '...' })),
      confidence: 'high',
    };
  }

  return {
    reply: `I don't have verified information on that specific inquiry in this prototype. Please check the Official Guidelines, FAQ section, or contact Helpdesk at **1800-11-2005**.\n\n*AI-generated, verify with official sources.*`,
    language: activeLanguage,
    detectedLanguage: activeLanguage,
    confidence: 'low',
    sources: retrieved.chunks.map((c) => ({ title: c.title, excerpt: c.content.slice(0, 150) + '...' })),
  };
}

/**
 * Text Simplification (Grade-6 Plain Language) using OpenAI gpt-4o-mini
 */
export async function simplifyPassage(
  passage: string,
  language: SupportedLanguage = 'en'
): Promise<{ simplified: string; language: SupportedLanguage }> {
  const apiKey = process.env.OPENAI_API_KEY;

  const systemPrompt = `You are an expert plain-language legal communicator. Rewrite official and statutory passages in plain ${LANGUAGE_NAMES[language]} at roughly a grade-6 reading level. Keep every factual claim, statutory deadline, fee amount, and statutory legal term (e.g., CPIO, First Appeal, Public Authority, Section 7(1)). Do not alter legal substance.`;

  if (apiKey) {
    try {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: passage },
        ],
        temperature: 0.2,
      });

      const simplified = completion.choices[0]?.message?.content?.trim();
      if (simplified) {
        return { simplified, language };
      }
    } catch (err) {
      console.warn('[OpenAI Assistant] Simplification fallback:', err);
    }
  }

  // Fallback simplification
  return {
    simplified: `[Simplified Summary]: ${passage.replace(/\b(herein|pursuant to|notwithstanding|aforementioned)\b/gi, '').slice(0, 400)}...`,
    language,
  };
}

/**
 * Multimodal Document Description using OpenAI gpt-4o Vision
 */
export async function describeDocument(
  fileBase64: string,
  mimeType: string,
  language: SupportedLanguage = 'en'
): Promise<{ description: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const openai = new OpenAI({ apiKey });
      const prompt = `Describe this document for a citizen using a screen reader, in ${LANGUAGE_NAMES[language]}, plainly and concisely. Highlight document type, issuing authority, dates, and subject matter.`;

      const mime = mimeType.startsWith('image/') ? mimeType : 'image/png';
      const dataUrl = `data:${mime};base64,${fileBase64}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
      });

      const description = completion.choices[0]?.message?.content?.trim();
      if (description) {
        return { description };
      }
    } catch (err) {
      console.warn('[OpenAI Assistant] Describe document fallback:', err);
    }
  }

  return {
    description:
      'The uploaded document appears to be a standard RTI supporting document or government record. Please review the file preview for detailed text.',
  };
}
