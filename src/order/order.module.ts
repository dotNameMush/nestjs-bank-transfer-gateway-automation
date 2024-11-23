import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderGateway } from './order.gateway';
import { OrderController } from './order.controller';
import { GmailService } from 'src/gmail/services/gmail.service';
import { GmailModule } from 'src/gmail/gmail.module';

@Module({
  imports: [GmailModule],
  providers: [OrderGateway, OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
