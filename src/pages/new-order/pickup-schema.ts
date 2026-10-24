import { z } from 'zod';

export const pickupSchema = z.object({
  storeId: z.string().min(1, 'Choose a pickup store'),
  line1: z.string().trim().min(3, 'Enter your street address').max(120),
  line2: z.string().trim().max(120),
  city: z.string().trim().min(2, 'Enter a city').max(60),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, 'Enter a 6-digit PIN code'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number'),
  notes: z.string().trim().max(500, 'Keep notes under 500 characters'),
});
export type PickupValues = z.infer<typeof pickupSchema>;

export const PICKUP_FORM_ID = 'pickup-form';
