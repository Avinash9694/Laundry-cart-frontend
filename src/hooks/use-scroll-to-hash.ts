import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const HEADER_OFFSET_PX = 88;

export function scrollTargetFor(hash: string, root: Pick<Document, 'getElementById'>) {
  const id = hash.replace(/^#/, '');
  return id ? root.getElementById(id) : null;
}

/** Scrolls to the section named by the route hash. HashRouter never does this itself. */
export function useScrollToHash() {
  const { hash } = useLocation();
  useEffect(() => {
    const target = scrollTargetFor(hash, document);
    if (!target) return;
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frame = requestAnimationFrame(() => {
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);
}
