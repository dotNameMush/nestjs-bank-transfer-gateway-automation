import { OrderStatus } from '@prisma/client';

export interface OrderCache {
  id: number;
  status: OrderStatus;
}
