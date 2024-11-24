import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderGateway } from './order.gateway';
import { OrderController } from './order.controller';
import { GmailModule } from 'src/gmail/gmail.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [GmailModule, CacheModule.register()],
  providers: [OrderGateway, OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
