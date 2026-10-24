import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HashRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from '@/app';
import { makeDemoClient } from '@/test/utils';
import { scrollTargetFor, useScrollToHash } from './use-scroll-to-hash';

function Probe() {
  useScrollToHash();
  return <section id="pricing">Pricing</section>;
}

describe('scrollTargetFor', () => {
  it('resolves the element named by the hash and ignores an empty hash', () => {
    const el = document.createElement('div');
    const root = { getElementById: (id: string) => (id === 'pricing' ? el : null) };
    expect(scrollTargetFor('#pricing', root)).toBe(el);
    expect(scrollTargetFor('', root)).toBeNull();
    expect(scrollTargetFor('#missing', root)).toBeNull();
  });
});

describe('useScrollToHash', () => {
  it('scrolls the window to the section once the route hash names it', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    render(
      <MemoryRouter initialEntries={['/#pricing']}>
        <Probe />
      </MemoryRouter>,
    );
    await vi.waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(1));
    const options = scrollTo.mock.calls[0]?.[0] as ScrollToOptions | undefined;
    expect(options?.top).toBeTypeOf('number');
    scrollTo.mockRestore();
  });

  it('does nothing without a hash', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    render(
      <MemoryRouter initialEntries={['/']}>
        <Probe />
      </MemoryRouter>,
    );
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    expect(scrollTo).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });
});

describe('section links under the hash router', () => {
  it('stay inside the app instead of leaving for the site root', async () => {
    makeDemoClient();
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </QueryClientProvider>,
    );
    for (const name of ['How it works', 'Pricing', 'Stores']) {
      const links = await screen.findAllByRole('link', { name });
      for (const link of links) {
        expect(link.getAttribute('href')).toMatch(/^#\/#[a-z-]+$/);
      }
    }
    expect(screen.getByRole('link', { name: /see pricing/i })).toHaveAttribute(
      'href',
      '#/#pricing',
    );
  });
});
