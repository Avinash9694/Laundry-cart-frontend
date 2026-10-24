import { useNavigate } from 'react-router-dom';
import { errorMessage } from '@/api';
import { useCatalog, useCreateOrder, useStores } from '@/hooks/use-api';
import { useAuthStore } from '@/store/auth-store';
import { useWizardStore } from '@/store/wizard-store';
import {
  STEP_LABELS,
  WIZARD_STEPS,
  garmentsMissingWash,
  isStepComplete,
  maxReachableStep,
  previewPricing,
  toOrderItems,
} from '@/store/wizard-logic';
import { formatINR } from '@/lib/format';
import { toast } from '@/lib/toast-store';
import { PageHeader } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconArrowLeft, IconArrowRight } from '@/components/ui/icons';
import { PriceBreakdown } from '@/components/ui/price-breakdown';
import { Skeleton, SkeletonRows } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { Stepper } from '@/components/ui/stepper';
import { StepGarments } from './step-garments';
import { StepWashTypes } from './step-wash-types';
import { StepPickup } from './step-pickup';
import { PICKUP_FORM_ID, type PickupValues } from './pickup-schema';
import { StepReview } from './step-review';
import styles from './new-order.module.css';

export function NewOrderPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const catalog = useCatalog();
  const stores = useStores();
  const createOrder = useCreateOrder();
  const wizard = useWizardStore();

  if (catalog.isPending || stores.isPending) {
    return (
      <div className="container" aria-busy>
        <PageHeader eyebrow="New order" title="Build your order" />
        <Skeleton height={48} radius="12px" />
        <div style={{ height: 24 }} />
        <SkeletonRows rows={4} height={72} />
      </div>
    );
  }

  if (catalog.isError || stores.isError) {
    const err = catalog.error ?? stores.error;
    return (
      <div className="container">
        <PageHeader eyebrow="New order" title="Build your order" />
        <ErrorState
          title="Could not load the catalog"
          description={errorMessage(err)}
          onRetry={() => {
            void catalog.refetch();
            void stores.refetch();
          }}
        />
      </div>
    );
  }

  const canContinue = isStepComplete(wizard.step, wizard);
  const preview = previewPricing(wizard, catalog.data);
  const missing = garmentsMissingWash(wizard);

  const onPickupValid = ({ storeId, notes, line2, ...address }: PickupValues) => {
    wizard.setPickup(storeId, line2 ? { ...address, line2 } : address, notes);
    wizard.goTo('review');
  };

  const placeOrder = () => {
    if (!wizard.storeId || !wizard.address) return;
    createOrder.mutate(
      {
        items: toOrderItems(wizard),
        storeId: wizard.storeId,
        address: wizard.address,
        ...(wizard.notes ? { notes: wizard.notes } : {}),
      },
      {
        onSuccess: (order) => {
          wizard.reset();
          toast.success(
            `Order ${order.orderNumber} placed`,
            `${formatINR(order.pricing.total)} · we'll collect soon.`,
          );
          navigate(`/orders/${order.id}`, { replace: true });
        },
        onError: (err) => toast.error('Could not place the order', errorMessage(err)),
      },
    );
  };

  const stepIdx = WIZARD_STEPS.indexOf(wizard.step);
  const nextLabel =
    wizard.step === 'garments'
      ? 'Choose wash types'
      : wizard.step === 'wash-types'
        ? 'Pickup details'
        : 'Review order';

  return (
    <div className="container">
      <PageHeader
        eyebrow="New order"
        title="Build your order"
        description="Four steps. Your progress is kept if you refresh."
      />
      <div className={styles.stepperWrap}>
        <Stepper
          steps={WIZARD_STEPS}
          labels={STEP_LABELS}
          current={wizard.step}
          maxReachable={maxReachableStep(wizard)}
          onSelect={wizard.goTo}
        />
      </div>
      <div className={styles.layout}>
        <div>
          {wizard.step === 'garments' ? <StepGarments garments={catalog.data.garments} /> : null}
          {wizard.step === 'wash-types' ? <StepWashTypes catalog={catalog.data} /> : null}
          {wizard.step === 'pickup' ? (
            <StepPickup stores={stores.data} defaultPhone={user?.phone} onValid={onPickupValid} />
          ) : null}
          {wizard.step === 'review' ? (
            <StepReview catalog={catalog.data} stores={stores.data} />
          ) : null}

          <div className={styles.actions}>
            {stepIdx > 0 ? (
              <Button variant="secondary" icon={<IconArrowLeft size={18} />} onClick={wizard.back}>
                Back
              </Button>
            ) : (
              <span />
            )}
            {wizard.step === 'pickup' ? (
              <Button type="submit" form={PICKUP_FORM_ID}>
                Review order <IconArrowRight size={18} />
              </Button>
            ) : wizard.step === 'review' ? (
              <Button
                size="lg"
                onClick={placeOrder}
                loading={createOrder.isPending}
                disabled={!canContinue}
              >
                Place order · {formatINR(preview.pricing.total)}
              </Button>
            ) : (
              <Button onClick={wizard.next} disabled={!canContinue}>
                {nextLabel} <IconArrowRight size={18} />
              </Button>
            )}
          </div>
        </div>

        <Card as="aside" aria-labelledby="summary-title" className={styles.summary}>
          <h2 id="summary-title">Order summary</h2>
          {preview.items.length === 0 ? (
            <p className={styles.summaryMuted}>
              {toOrderItems(wizard).length === 0
                ? 'Nothing added yet. Pick a garment to get started.'
                : 'Choose wash types to see prices.'}
            </p>
          ) : (
            <ul className={styles.summaryItems}>
              {preview.items.map((item) => (
                <li key={item.garmentId} className={styles.summaryItem}>
                  <span>
                    {item.quantity} × {item.garmentName}
                  </span>
                  <span>{formatINR(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
          )}
          {missing.length > 0 && wizard.step !== 'garments' ? (
            <p className={styles.summaryMuted} role="status">
              {missing.length} garment{missing.length === 1 ? '' : 's'} still need a wash type.
            </p>
          ) : null}
          <PriceBreakdown pricing={preview.pricing} showHint />
        </Card>
      </div>
    </div>
  );
}
