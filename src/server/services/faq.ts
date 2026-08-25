/**
 * FAQ & Knowledge Base Service Layer
 */

import { store } from '../store';

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export async function getFaqs(category = '', query = ''): Promise<{ results: FaqItem[] }> {
  let list = [...store.faqs];

  if (category && category.trim()) {
    const cat = category.toLowerCase().trim();
    list = list.filter((f) => f.category.toLowerCase() === cat);
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }

  return { results: list };
}
