import { Test, TestingModule } from '@nestjs/testing';
import { GmailService } from './gmail.service';
import { GmailAuthService } from './gmail-auth.service';
import { EmailFetchError } from '../types/gmail.types';

describe('GmailService', () => {
  let service: GmailService;
  let authService: GmailAuthService;

  const mockGmailAuthService = {
    initialize: jest.fn(),
    getOAuth2Client: jest.fn(),
  };

  const mockGmail = {
    users: {
      messages: {
        list: jest.fn(),
        get: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailService,
        {
          provide: GmailAuthService,
          useValue: mockGmailAuthService,
        },
      ],
    }).compile();

    service = module.get<GmailService>(GmailService);
    authService = module.get<GmailAuthService>(GmailAuthService);

    // Mock the Gmail API initialization
    (service as any).gmail = mockGmail;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize Gmail API with auth client', async () => {
      const mockAuth = { credentials: { access_token: 'test-token' } };
      mockGmailAuthService.initialize.mockResolvedValue(mockAuth);

      await service.onModuleInit();

      expect(mockGmailAuthService.initialize).toHaveBeenCalled();
    });
  });

  describe('fetchEmails', () => {
    const mockOptions = { maxResults: 10 };

    beforeEach(() => {
      mockGmailAuthService.getOAuth2Client.mockReturnValue({
        credentials: { access_token: 'test-token' },
      });
    });

    it('should fetch emails successfully', async () => {
      const mockMessages = [{ id: '1' }, { id: '2' }];
      const mockEmailData = { id: '1', snippet: 'test' };

      mockGmail.users.messages.list.mockResolvedValue({
        data: { messages: mockMessages },
      });
      mockGmail.users.messages.get.mockResolvedValue({
        data: { ...mockEmailData, raw: 'raw-data' },
      });

      const result = await service.fetchEmails(mockOptions);

      expect(result).toHaveLength(2);
      expect(mockGmail.users.messages.list).toHaveBeenCalledWith({
        userId: 'me',
        ...mockOptions,
      });
    });

    it('should return empty array when no messages found', async () => {
      mockGmail.users.messages.list.mockResolvedValue({
        data: { messages: null },
      });

      const result = await service.fetchEmails(mockOptions);

      expect(result).toEqual([]);
    });

    it('should throw EmailFetchError when not authenticated', () => {
      mockGmailAuthService.getOAuth2Client.mockReturnValue({
        credentials: {},
      });

      expect(service.fetchEmails(mockOptions)).rejects.toThrow(EmailFetchError);
    });

    it('should throw EmailFetchError on API error', () => {
      mockGmail.users.messages.list.mockRejectedValue(new Error('API Error'));

      expect(service.fetchEmails(mockOptions)).rejects.toThrow(EmailFetchError);
    });
  });
});
