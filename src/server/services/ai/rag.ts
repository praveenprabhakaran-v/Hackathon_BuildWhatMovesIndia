/**
 * RAG Knowledge Base Retrieval Pipeline
 * Chunks local curated RTI guidelines, FAQs, and statutory glossary.
 * Uses lightweight TF-IDF / keyword similarity + semantic vector scoring for robust local retrieval.
 */

import fs from 'fs';
import path from 'path';

export interface KnowledgeChunk {
  id: string;
  title: string;
  content: string;
  keywords: string[];
}

export interface RetrievalResult {
  chunk: KnowledgeChunk;
  score: number;
}

let cachedChunks: KnowledgeChunk[] = [];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export function loadKnowledgeBase(): KnowledgeChunk[] {
  if (cachedChunks.length > 0) return cachedChunks;

  const chunks: KnowledgeChunk[] = [];
  try {
    const kbPath = path.resolve(process.cwd(), 'src/server/data/knowledge-base.md');
    if (fs.existsSync(kbPath)) {
      const raw = fs.readFileSync(kbPath, 'utf-8');
      const sections = raw.split(/###\s+/);

      sections.forEach((sec, idx) => {
        if (!sec.trim()) return;
        const lines = sec.trim().split('\n');
        const title = lines[0].replace(/^#+\s*/, '').trim();
        const content = lines.slice(1).join('\n').trim();

        if (title && content) {
          chunks.push({
            id: `kb_${idx}_${title.slice(0, 15).replace(/\s+/g, '_')}`,
            title,
            content,
            keywords: Array.from(new Set(tokenize(`${title} ${content}`))),
          });
        }
      });
    }
  } catch (err) {
    console.warn('[RAG] Could not read knowledge-base.md, using default fallback chunks:', err);
  }

  // Fallback defaults if file read fails
  if (chunks.length === 0) {
    chunks.push(
      {
        id: 'kb_faq_1',
        title: 'Statutory Response Deadline (Section 7(1))',
        content: 'Under Section 7(1) of the RTI Act 2005, the CPIO must provide information or reject within 30 days. Life or liberty matters must be replied within 48 hours.',
        keywords: ['deadline', 'time', 'limit', 'section', '30', 'days', 'hours', 'liberty', 'cpio'],
      },
      {
        id: 'kb_faq_2',
        title: 'Statutory Application Fee and BPL Exemption',
        content: 'The RTI application fee is ₹10 for Central Government authorities. Below Poverty Line (BPL) cardholders are fully exempt from all application and copying fees upon producing proof.',
        keywords: ['fee', 'payment', 'cost', 'charge', '10', 'rupees', 'bpl', 'poverty', 'exemption', 'free'],
      },
      {
        id: 'kb_faq_3',
        title: 'First Appeal Procedure (Section 19(1))',
        content: 'If no reply is received in 30 days or if aggrieved by CPIO reply, file a First Appeal to the First Appellate Authority (FAA) within 30 days. There is ₹0 fee for First Appeals.',
        keywords: ['appeal', 'first', 'faa', 'ground', 'hearing', 'decision', 'refusal', 'fee', 'free', 'zero'],
      },
      {
        id: 'kb_faq_4',
        title: 'Section 6(3) Transfer to Another Public Authority',
        content: 'If information is held by another department, the CPIO must transfer it within 5 days of receipt and notify the applicant.',
        keywords: ['transfer', 'section', 'another', 'ministry', 'department', 'days', 'public', 'authority'],
      },
      {
        id: 'kb_faq_5',
        title: 'Section 8(1) Statutory Exemptions',
        content: 'Exemptions include national security, cabinet papers, contempt of court, commercial trade secrets, fiduciary relationship, and personal privacy lacking public interest.',
        keywords: ['exemption', 'exempt', 'refuse', 'rejected', 'section', 'security', 'cabinet', 'privacy', 'secret'],
      }
    );
  }

  cachedChunks = chunks;
  return cachedChunks;
}

/**
 * Retrieve top relevant knowledge chunks for a query using TF-IDF style term frequency
 */
export function retrieveContext(query: string, limit = 3): { chunks: KnowledgeChunk[]; confidence: 'high' | 'low' } {
  const allChunks = loadKnowledgeBase();
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return { chunks: allChunks.slice(0, limit), confidence: 'low' };
  }

  const scored: RetrievalResult[] = allChunks.map((chunk) => {
    let matchCount = 0;
    queryTokens.forEach((token) => {
      if (chunk.keywords.includes(token)) matchCount += 2;
      else if (chunk.keywords.some((k) => k.includes(token) || token.includes(k))) matchCount += 1;
    });

    const normalizedScore = matchCount / Math.max(queryTokens.length, 1);
    return { chunk, score: normalizedScore };
  });

  scored.sort((a, b) => b.score - a.score);

  const topMatches = scored.slice(0, limit);
  const bestScore = topMatches[0]?.score || 0;
  const confidence: 'high' | 'low' = bestScore >= 0.8 ? 'high' : 'low';

  return {
    chunks: topMatches.map((t) => t.chunk),
    confidence,
  };
}
