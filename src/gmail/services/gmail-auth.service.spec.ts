import { Test, TestingModule } from '@nestjs/testing';
import { GmailAuthService } from './gmail-auth.service';
import { GmailConfigService } from '../config/gmail.config';
import * as fs from 'fs';

jest.mock('fs');
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        generateAuthUrl: jest.fn().mockReturnValue('mock-auth-url'),
        getToken: jest
          .fn()
          .mockResolvedValue({ tokens: { access_token: 'mock-token' } }),
        setCredentials: jest.fn(),
      })),
    },
  },
}));

describe('GmailAuthService', () => {
  let service: GmailAuthService;
  let configService: GmailConfigService;

  const mockConfigService = {
    credentialsPath: '/mock/credentials.json',
    tokensPath: '/mock/tokens.json',
    scopes: ['mock.scope'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailAuthService,
        {
          provide: GmailConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GmailAuthService>(GmailAuthService);
    configService = module.get<GmailConfigService>(GmailConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initialize', () => {
    const mockCredentials = {
      web: {
        client_id: 'mock-id',
        client_secret: 'mock-secret',
        redirect_uris: ['mock-uri'],
      },
    };

    beforeEach(() => {
      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify(mockCredentials),
      );
      (fs.existsSync as jest.Mock).mockReturnValue(true);
    });

    it('should initialize OAuth2Client successfully', async () => {
      const result = await service.initialize();

      expect(result).toBeDefined();
      expect(fs.promises.readFile).toHaveBeenCalledWith(
        mockConfigService.credentialsPath,
        'utf-8',
      );
    });

    it('should throw error on invalid credentials', () => {
      (fs.promises.readFile as jest.Mock).mockRejectedValue(
        new Error('File not found'),
      );

      expect(service.initialize()).rejects.toThrow(
        'Failed to load credentials',
      );
    });
  });

  describe('getAuthUrl', () => {
    it('should return authorization URL', async () => {
      await service.initialize();
      const url = service.getAuthUrl();

      expect(url).toBe('mock-auth-url');
    });
  });

  describe('setTokens', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should set and save tokens successfully', async () => {
      await service.setTokens('mock-code');

      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        mockConfigService.tokensPath,
        expect.any(String),
      );
    });

    it('should throw error on token retrieval failure', () => {
      const mockError = new Error('Token error');
      (service as any).oauth2Client.getToken.mockRejectedValue(mockError);

      expect(service.setTokens('invalid-code')).rejects.toThrow(
        'Failed to set tokens',
      );
    });
  });
});
