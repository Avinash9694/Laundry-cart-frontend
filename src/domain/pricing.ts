import type { Garment, OrderItem, Pricing, WashType } from '@/api/types';

// Mirrors Laundry-cart-backend/src/domain/pricing.js. The wizard previews what
// the server will charge, so the two must agree.

export const DELIVERY_FEE = 49;
export const FREE_DELIVERY_THRESHOLD = 499;

export interface PriceLine {
  garment: Garment;
  quantity: number;
  washTypes: Pick<WashType, 'id' | 'name'>[];
}

export interface PricedOrder {
  items: OrderItem[];
  pricing: Pricing;
}

export function deliveryFeeFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function unitPriceFor(garment: Garment, washTypeIds: readonly string[]): number {
  return washTypeIds.reduce((sum, id) => sum + (garment.prices[id] ?? 0), 0);
}

export function priceOrder(lines: readonly PriceLine[]): PricedOrder {
  const items: OrderItem[] = lines.map(({ garment, quantity, washTypes }) => {
    const priced = washTypes.map((wash) => {
      const price = garment.prices[wash.id];
      if (typeof price !== 'number') {
        throw new Error(`Garment ${garment.id} has no price for wash type ${wash.id}`);
      }
      return { id: wash.id, name: wash.name, price };
    });
    const unitPrice = priced.reduce((sum, w) => sum + w.price, 0);
    return {
      garmentId: garment.id,
      garmentName: garment.name,
      quantity,
      washTypes: priced,
      unitPrice,
      lineTotal: unitPrice * quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = deliveryFeeFor(subtotal);
  return { items, pricing: { subtotal, deliveryFee, total: subtotal + deliveryFee, totalItems } };
}
