import { Module } from '@nestjs/common';
import { GmailService } from './services/gmail.service';
import { GmailAuthService } from './services/gmail-auth.service';
import { GmailConfigService } from './config/gmail.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [GmailService, GmailAuthService, GmailConfigService],
  exports: [GmailService],
})
export class GmailModule {}
