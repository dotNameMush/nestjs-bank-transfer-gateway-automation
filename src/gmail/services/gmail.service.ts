import { Injectable, OnModuleInit } from '@nestjs/common';
import { google, gmail_v1 } from 'googleapis';
import { GmailAuthService } from './gmail-auth.service';
import {
  IEmailFetchOptions,
  GmailMessage,
  EmailFetchError,
} from '../types/gmail.types';

@Injectable()
export class GmailService implements OnModuleInit {
  private gmail: gmail_v1.Gmail;

  constructor(private readonly authService: GmailAuthService) {}

  async onModuleInit(): Promise<void> {
    const auth = await this.authService.initialize();
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async fetchEmails<T extends IEmailFetchOptions>(
    options: T,
  ): Promise<GmailMessage[]> {
    try {
      this.validateAuth();

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        ...options,
      });

      if (!response.data.messages) {
        return [];
      }

      return await Promise.all(
        response.data.messages.map((message) =>
          this.fetchEmailDetails(message.id),
        ),
      );
    } catch (error) {
      throw new EmailFetchError(
        `Failed to fetch emails: ${error.message}`,
        error.code || 'UNKNOWN_ERROR',
      );
    }
  }

  private async fetchEmailDetails(messageId: string): Promise<GmailMessage> {
    const email = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    // To seperate the data
    const { raw, ...emailData } = email.data;
    return emailData;
  }

  private validateAuth(): void {
    const credentials = this.authService.getOAuth2Client().credentials;
    if (!credentials?.access_token) {
      throw new EmailFetchError(
        'Authentication required. Please authenticate first.',
        'UNAUTHORIZED',
      );
    }
  }
}