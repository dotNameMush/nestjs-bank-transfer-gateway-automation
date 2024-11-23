import { Injectable } from '@nestjs/common';
import { Order, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/_core/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: number): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.DELETED },
    });
  }
}
