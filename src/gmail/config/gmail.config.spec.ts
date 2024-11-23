import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GmailConfigService } from './gmail.config';

describe('GmailConfigService', () => {
  let service: GmailConfigService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailConfigService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GmailConfigService>(GmailConfigService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('configuration getters', () => {
    it('should return credentialsPath', () => {
      expect(service.credentialsPath).toContain('/credentials/credential.json');
    });

    it('should return tokensPath', () => {
      expect(service.tokensPath).toContain('/credentials/tokens.json');
    });

    it('should return scopes', () => {
      expect(service.scopes).toContain(
        'https://www.googleapis.com/auth/gmail.readonly',
      );
    });
  });
});
