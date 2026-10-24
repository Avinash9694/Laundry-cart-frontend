import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeDemoClient, renderApp, signInDemo } from '@/test/utils';
import { useWizardStore } from '@/store/wizard-store';

describe('page smoke tests (demo adapter, no latency)', () => {
  it('landing renders the hero, loads the price table and stores', async () => {
    makeDemoClient();
    renderApp('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/doorstep laundry/i);
    expect(await screen.findByRole('rowheader', { name: 'Shirts' })).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: '₹20' }).length).toBeGreaterThan(0);
    expect(await screen.findByRole('heading', { name: /gachibowli/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /avinash sahu/i })).toHaveAttribute(
      'href',
      'https://avinash9694.github.io',
    );
  });

  it('login validates, then signs the demo account in and lands on the dashboard', async () => {
    makeDemoClient();
    const user = userEvent.setup();
    renderApp('/login');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /fill demo credentials/i }));
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    expect(await screen.findByRole('heading', { name: /hi demo/i })).toBeInTheDocument();
  });

  it('register shows server conflicts inline', async () => {
    makeDemoClient();
    const user = userEvent.setup();
    renderApp('/register');
    await user.type(screen.getByLabelText(/full name/i), 'Demo Again');
    await user.type(screen.getByLabelText(/^email/i), 'demo@laundry.test');
    await user.type(screen.getByLabelText(/^password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/already exists/i);
  });

  it('protected routes redirect a guest to login', () => {
    makeDemoClient();
    renderApp('/orders');
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('dashboard shows summary tiles and recent orders for the seeded demo account', async () => {
    const client = makeDemoClient();
    await signInDemo(client);
    renderApp('/dashboard');
    expect(await screen.findByText('Orders in progress')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: /^order lc-/i }).length).toBeGreaterThan(0),
    );
    const deliveredTile = screen.getAllByText('Delivered').find((el) => el.tagName === 'P')!;
    expect(deliveredTile.nextSibling).toHaveTextContent('2');
  });

  it('orders list filters by status chip and searches within the page', async () => {
    const client = makeDemoClient();
    await signInDemo(client);
    const user = userEvent.setup();
    renderApp('/orders');
    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: /^order lc-/i })).toHaveLength(6),
    );
    await user.click(screen.getByRole('button', { name: 'Cancelled' }));
    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: /^order lc-/i })).toHaveLength(1),
    );
    await user.click(screen.getByRole('button', { name: 'All' }));
    await user.type(screen.getByLabelText(/search this page/i), 'saree');
    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: /^order lc-/i })).toHaveLength(1),
    );
    await user.clear(screen.getByLabelText(/search this page/i));
    await user.type(screen.getByLabelText(/search this page/i), 'zzz');
    expect(await screen.findByText(/nothing matches/i)).toBeInTheDocument();
  });

  it('order detail renders the timeline and can cancel a placed order', async () => {
    const client = makeDemoClient();
    const { token } = await signInDemo(client);
    void token;
    const page = await client.listOrders({ status: 'placed' });
    const placed = page.data[0]!;
    const user = userEvent.setup();
    renderApp(`/orders/${placed.id}`);
    expect(await screen.findByRole('heading', { name: placed.orderNumber })).toBeInTheDocument();
    expect(screen.getByLabelText(/status timeline/i)).toHaveTextContent(
      /placed.*processing.*ready.*delivered/i,
    );
    await user.click(screen.getByRole('button', { name: /cancel order/i }));
    await user.click(screen.getByRole('alertdialog').querySelector('button:last-child')!);
    await waitFor(() =>
      expect(screen.getByLabelText(/status timeline/i)).toHaveTextContent(/cancelled/i),
    );
    expect(screen.queryByRole('button', { name: /cancel order/i })).not.toBeInTheDocument();
  });

  it('order detail shows a not-found state for an unknown id', async () => {
    const client = makeDemoClient();
    await signInDemo(client);
    renderApp('/orders/nope');
    expect(await screen.findByText(/order not found/i)).toBeInTheDocument();
  });

  it('wizard: picking garments enables the next step, then wash types drive the live total', async () => {
    const client = makeDemoClient();
    await signInDemo(client);
    const user = userEvent.setup();
    renderApp('/orders/new');
    const next = await screen.findByRole('button', { name: /choose wash types/i });
    expect(next).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /add one shirts/i }));
    await user.click(screen.getByRole('button', { name: /add one shirts/i }));
    expect(next).toBeEnabled();
    await user.click(next);
    expect(
      await screen.findByRole('heading', { name: /how should each garment/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^washing/i }));
    await user.click(screen.getByRole('button', { name: /^ironing/i }));
    expect(screen.getByText('2 × ₹35 =')).toBeInTheDocument();
    expect(useWizardStore.getState().step).toBe('wash-types');
    expect(JSON.parse(window.sessionStorage.getItem('laundry-cart.wizard') ?? '{}')).toMatchObject({
      quantities: { shirts: 2 },
    });
  });

  it('wizard: pickup form validates and review places the order', async () => {
    const client = makeDemoClient();
    await signInDemo(client);
    const s = useWizardStore.getState();
    s.setQuantity('towels', 2);
    s.toggleWash('towels', 'wash');
    s.goTo('wash-types');
    s.goTo('pickup');
    const user = userEvent.setup();
    renderApp('/orders/new');
    await user.click(await screen.findByRole('button', { name: /review order/i }));
    expect(await screen.findByText(/choose a pickup store/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText(/gachibowli/i));
    await user.type(screen.getByLabelText(/address line 1/i), '12 Lake Road');
    await user.type(screen.getByLabelText(/pin code/i), '500032');
    await user.type(screen.getByLabelText(/contact phone/i), '+91 9000000000');
    await user.click(screen.getByRole('button', { name: /review order/i }));
    expect(await screen.findByRole('heading', { name: /review your order/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /place order/i }));
    expect(await screen.findByRole('heading', { name: /^LC-/ })).toBeInTheDocument();
    expect(useWizardStore.getState().quantities).toEqual({});
  });

  it('account page shows profile and the 404 route renders', async () => {
    const client = makeDemoClient();
    await signInDemo(client);
    renderApp('/account');
    expect(await screen.findByRole('heading', { name: 'Demo Customer' })).toBeInTheDocument();
    expect(screen.getAllByText('demo@laundry.test').length).toBeGreaterThan(0);
    renderApp('/nowhere');
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });
});
