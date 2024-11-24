import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Render,
  NotFoundException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderGateway } from './order.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GmailService } from 'src/gmail/services/gmail.service';
import { formatOrderId } from 'src/_core/utils/order';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderGateway: OrderGateway,
    private readonly gmailService: GmailService,
  ) {}

  @Get()
  @Render('orders')
  async getOrdersPage() {
    const orders = await this.orderService.findAll();
    return { orders };
  }

  @Get(':id')
  @Render('order-detail')
  async getOrderDetail(@Param('id') id: string) {
    const order = await this.orderService.findOne(+id);
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return {
      order,
      statuses: Object.values(OrderStatus),
    };
  }

  @Get('api')
  async findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    const order = await this.orderService.create(createOrderDto);
    await this.orderGateway.broadcastOrderUpdate(order);
    return order;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.orderService.update(+id, updateOrderDto);
    await this.orderGateway.broadcastOrderUpdate(order);
    return order;
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ): Promise<Order> {
    const order = await this.orderService.updateStatus(+id, status);
    await this.orderGateway.broadcastOrderUpdate(order);
    return order;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Order> {
    const order = await this.orderService.remove(+id);
    await this.orderGateway.broadcastOrderUpdate(order);
    return order;
  }
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    const now = new Date();
    console.log(`[CRON] Job started at: ${now.toISOString()}`);

    try {
      // Fetch all PAID orders
      const paidOrders = await this.orderService.getOrderCache();

      if (!paidOrders || paidOrders.length === 0) {
        console.log('[CRON] No PAID orders found');
        return;
      }

      console.log(`[CRON] Found ${paidOrders.length} PAID orders`);

      // Fetch email order IDs in bulk
      const emailOrderIdList = await this.gmailService.searchEmailOrders(
        paidOrders.length,
      );
      console.log(`[CRON] Retrieved ${emailOrderIdList.length} email orders`);

      // Process each order
      const updatePromises = paidOrders.map(async (order) => {
        const formattedOrderId = formatOrderId(order.id);
        const newStatus = emailOrderIdList.includes(formattedOrderId)
          ? OrderStatus.CONFIRMED
          : OrderStatus.PENDING;

        console.log(`[CRON] Updating order ID ${order.id} to ${newStatus}`);

        // Update the order status in the database
        const updatedOrder = await this.orderService.updateStatus(
          order.id,
          newStatus,
        );

        // Broadcast the updated order to the WebSocket gateway
        this.orderGateway.broadcastOrderUpdate(updatedOrder);

        return updatedOrder;
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      console.log('[CRON] All orders processed and broadcasted successfully');
    } catch (err) {
      console.error('[CRON] Error during job execution:', err);
    }
  }
}
