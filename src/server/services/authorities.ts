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
