import { gmail_v1 } from 'googleapis';

export interface IGmailCredentials {
  web: {
    client_id: string;
    project_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_secret: string;
    redirect_uris: string[];
    javascript_origins: string[];
  };
}

export interface IGmailTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface IEmailFetchOptions {
  maxResults: number;
  labelIds?: string[];
  pageToken?: string;
  q?: string;
}

export type GmailMessage = gmail_v1.Schema$Message;
export type GmailMessageList = gmail_v1.Schema$ListMessagesResponse;

export class EmailFetchError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'EmailFetchError';
  }
}
