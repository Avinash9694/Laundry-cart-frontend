import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Store } from '@/api/types';
import { useWizardStore } from '@/store/wizard-store';
import { Input, Textarea } from '@/components/ui/field';
import { PICKUP_FORM_ID, pickupSchema, type PickupValues } from './pickup-schema';
import styles from './new-order.module.css';

interface StepPickupProps {
  stores: Store[];
  defaultPhone?: string | null | undefined;
  onValid: (values: PickupValues) => void;
}

export function StepPickup({ stores, defaultPhone, onValid }: StepPickupProps) {
  const storeId = useWizardStore((s) => s.storeId);
  const address = useWizardStore((s) => s.address);
  const notes = useWizardStore((s) => s.notes);
  const { register, handleSubmit, formState, setValue } = useForm<PickupValues>({
    resolver: zodResolver(pickupSchema),
    defaultValues: {
      storeId: storeId ?? '',
      line1: address?.line1 ?? '',
      line2: address?.line2 ?? '',
      city: address?.city ?? 'Hyderabad',
      pincode: address?.pincode ?? '',
      phone: address?.phone ?? defaultPhone ?? '',
      notes,
    },
  });

  useEffect(() => {
    if (!storeId && stores.length === 1 && stores[0]) setValue('storeId', stores[0].id);
  }, [storeId, stores, setValue]);

  return (
    <form id={PICKUP_FORM_ID} className={styles.panel} onSubmit={handleSubmit(onValid)} noValidate>
      <div className={styles.panelHead}>
        <h2>Where do we collect from?</h2>
        <p>Pick the store nearest to you and tell us where to pick up.</p>
      </div>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="visually-hidden">Pickup store</legend>
        <div className={styles.stores}>
          {stores.map((s) => (
            <label key={s.id} className={styles.storeOption}>
              <input type="radio" value={s.id} {...register('storeId')} />
              <strong>{s.name.replace('Laundry Cart · ', '')}</strong>
              <span>
                {s.addressLine}, {s.pincode}
              </span>
              <span>{s.hours}</span>
            </label>
          ))}
        </div>
        {formState.errors.storeId ? (
          <p
            role="alert"
            style={{ color: 'var(--danger)', fontSize: '0.8125rem', fontWeight: 500, marginTop: 8 }}
          >
            {formState.errors.storeId.message}
          </p>
        ) : null}
      </fieldset>
      <div className={styles.form}>
        <div className={styles.span2}>
          <Input
            label="Address line 1"
            autoComplete="address-line1"
            error={formState.errors.line1?.message}
            {...register('line1')}
          />
        </div>
        <div className={styles.span2}>
          <Input
            label="Address line 2"
            hint="Optional: landmark, building, floor"
            autoComplete="address-line2"
            error={formState.errors.line2?.message}
            {...register('line2')}
          />
        </div>
        <Input
          label="City"
          autoComplete="address-level2"
          error={formState.errors.city?.message}
          {...register('city')}
        />
        <Input
          label="PIN code"
          inputMode="numeric"
          autoComplete="postal-code"
          error={formState.errors.pincode?.message}
          {...register('pincode')}
        />
        <div className={styles.span2}>
          <Input
            label="Contact phone"
            type="tel"
            autoComplete="tel"
            error={formState.errors.phone?.message}
            {...register('phone')}
          />
        </div>
        <div className={styles.span2}>
          <Textarea
            label="Notes for the team"
            hint="Optional: detergent preferences, gate code, fragile items"
            error={formState.errors.notes?.message}
            {...register('notes')}
          />
        </div>
      </div>
    </form>
  );
}
