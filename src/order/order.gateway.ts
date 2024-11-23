import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OrderService } from './order.service';
import { Order } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly orderService: OrderService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const orders = await this.orderService.findAll();
    client.emit('orders', orders);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('findAllOrders')
  async findAll(): Promise<Order[]> {
    const orders = await this.orderService.findAll();
    this.server.emit('orders', orders);
    return orders;
  }

  async broadcastOrderUpdate(order?: Order) {
    this.server.emit('orderUpdated', order);
    const orders = await this.orderService.findAll();
    this.server.emit('orders', orders);
  }
}
