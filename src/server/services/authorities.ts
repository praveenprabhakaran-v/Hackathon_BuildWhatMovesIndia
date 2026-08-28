/**
 * Public Authorities Service Layer
 */

import { Authority } from '../../types/rti';
import { store } from '../store';

export async function searchAuthorities(query = '', ministry = ''): Promise<{ results: Authority[]; total: number }> {
  // Extract unique authorities by id
  const list = Array.from(new Set(Array.from(store.authorities.values())));
  let filtered = list.filter((a) => a.active);

  if (ministry && ministry.trim()) {
    const m = ministry.toLowerCase().trim();
    filtered = filtered.filter((a) => a.ministry.toLowerCase().includes(m));
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.ministry.toLowerCase().includes(q) ||
        (a.name_hi && a.name_hi.toLowerCase().includes(q)) ||
        (a.name_bn && a.name_bn.toLowerCase().includes(q)) ||
        (a.name_mr && a.name_mr.toLowerCase().includes(q)) ||
        (a.name_te && a.name_te.toLowerCase().includes(q)) ||
        (a.name_ta && a.name_ta.toLowerCase().includes(q)) ||
        (a.ministry_hi && a.ministry_hi.toLowerCase().includes(q)) ||
        (a.ministry_bn && a.ministry_bn.toLowerCase().includes(q)) ||
        (a.ministry_mr && a.ministry_mr.toLowerCase().includes(q)) ||
        (a.ministry_te && a.ministry_te.toLowerCase().includes(q)) ||
        (a.ministry_ta && a.ministry_ta.toLowerCase().includes(q)) ||
        (a.department && a.department.toLowerCase().includes(q))
    );
  }

  return {
    results: filtered,
    total: filtered.length,
  };
}

export async function getAuthorityById(idOrCode: string): Promise<Authority | null> {
  const auth = store.getAuthority(idOrCode);
  return auth || null;
}
