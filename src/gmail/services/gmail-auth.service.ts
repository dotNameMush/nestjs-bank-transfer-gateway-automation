import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import { IGmailCredentials, IGmailTokens } from '../types/gmail.types';
import { GmailConfigService } from '../config/gmail.config';

@Injectable()
export class GmailAuthService {
  private oauth2Client: OAuth2Client;

  constructor(private readonly configService: GmailConfigService) {}

  async initialize(): Promise<OAuth2Client> {
    const credentials = await this.loadCredentials();
    this.oauth2Client = this.createOAuth2Client(credentials);
    await this.loadExistingTokens();
    return this.oauth2Client;
  }

  private async loadCredentials(): Promise<IGmailCredentials> {
    try {
      const content = await fs.promises.readFile(
        this.configService.credentialsPath,
        'utf-8',
      );
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load credentials: ${error.message}`);
    }
  }

  private createOAuth2Client(credentials: IGmailCredentials): OAuth2Client {
    const { client_id, client_secret, redirect_uris } = credentials.web;
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  }

  private async loadExistingTokens(): Promise<void> {
    try {
      if (fs.existsSync(this.configService.tokensPath)) {
        const tokens: IGmailTokens = JSON.parse(
          await fs.promises.readFile(this.configService.tokensPath, 'utf-8'),
        );
        this.oauth2Client.setCredentials(tokens);
      }
    } catch (error) {
      throw new Error(`Failed to load tokens: ${error.message}`);
    }
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.configService.scopes,
    });
  }

  async setTokens(code: string): Promise<void> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      await fs.promises.writeFile(
        this.configService.tokensPath,
        JSON.stringify(tokens),
      );
    } catch (error) {
      throw new Error(`Failed to set tokens: ${error.message}`);
    }
  }

  getOAuth2Client(): OAuth2Client {
    return this.oauth2Client;
  }
}
