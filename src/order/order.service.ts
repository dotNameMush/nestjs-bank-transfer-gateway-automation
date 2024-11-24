import { Inject, Injectable } from '@nestjs/common';
import { Order, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/_core/prisma/prisma.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { OrderCache } from './types/cache-types';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async checkPaid() {
    return await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PAID,
      },
    });
  }
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    return this.prisma.order.create({
      data: createOrderDto,
    });
  }

  async findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number): Promise<Order> {
    return this.prisma.order.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
    });
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
    });
    await this.updateOrderCache(order);
    return order;
  }
  async getOrderCache() {
    return (await this.cacheManager.get('PAID_ORDERS')) as OrderCache[];
  }
  async updateOrderCache(order: Order) {
    const cacheKey = 'PAID_ORDERS';
    const ttl = 1000 * 60 * 60 * 72;
    if (order.status == OrderStatus.PAID) {
      const cache: OrderCache[] = await this.cacheManager.get(cacheKey);
      const newItem: OrderCache = {
        id: order.id,
        status: order.status,
      };
      await this.cacheManager.set(cacheKey, [...cache, newItem], ttl);
    } else if (order.status == OrderStatus.PENDING) {
      // Do Nothing
    } else {
      const cache: OrderCache[] = await this.cacheManager.get(cacheKey);
      const updatedCache = cache.filter((order) => order.id !== order.id);
      await this.cacheManager.set(cacheKey, [updatedCache], ttl);
    }
  }

  async remove(id: number): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.DELETED },
    });
  }
}
