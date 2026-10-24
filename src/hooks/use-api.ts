import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiClient } from '@/api';
import type { CreateOrderInput, ListOrdersParams, LoginInput, RegisterInput } from '@/api/types';
import { useAuthStore } from '@/store/auth-store';

export const queryKeys = {
  catalog: ['catalog'] as const,
  stores: ['stores'] as const,
  me: ['me'] as const,
  orders: (params: ListOrdersParams) => ['orders', params] as const,
  allOrders: ['orders'] as const,
  order: (id: string) => ['order', id] as const,
};

export function useCatalog() {
  return useQuery({
    queryKey: queryKeys.catalog,
    queryFn: () => getApiClient().getCatalog(),
    staleTime: 5 * 60_000,
  });
}

export function useStores() {
  return useQuery({
    queryKey: queryKeys.stores,
    queryFn: () => getApiClient().getStores(),
    staleTime: 5 * 60_000,
  });
}

export function useOrders(params: ListOrdersParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.orders(params),
    queryFn: () => getApiClient().listOrders(params),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.order(id ?? ''),
    queryFn: () => getApiClient().getOrder(id ?? ''),
    enabled: !!id,
  });
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: LoginInput) => getApiClient().login(input),
    onSuccess: setSession,
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: RegisterInput) => getApiClient().register(input),
    onSuccess: setSession,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => getApiClient().createOrder(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.allOrders }),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getApiClient().cancelOrder(id),
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.order(order.id), order);
      void qc.invalidateQueries({ queryKey: queryKeys.allOrders });
    },
  });
}
