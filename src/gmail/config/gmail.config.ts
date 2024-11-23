import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const gmailConfigSchema = z.object({
  credentialsPath: z.string(),
  tokensPath: z.string(),
  scopes: z.array(z.string()),
});

type GmailConfig = z.infer<typeof gmailConfigSchema>;

@Injectable()
export class GmailConfigService {
  private readonly config: GmailConfig;

  constructor(private configService: ConfigService) {
    this.config = this.validateConfig({
      credentialsPath: process.cwd() + '/credentials/credential.json',
      tokensPath: process.cwd() + '/credentials/tokens.json',
      scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    });
  }

  private validateConfig(config: unknown): GmailConfig {
    return gmailConfigSchema.parse(config);
  }

  get credentialsPath(): string {
    return this.config.credentialsPath;
  }

  get tokensPath(): string {
    return this.config.tokensPath;
  }

  get scopes(): string[] {
    return this.config.scopes;
  }
}
