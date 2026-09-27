import dotenv from 'dotenv';
dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  isProduction: boolean;
  appUrl: string;
  ai: {
    provider: 'gemini' | 'mock';
    apiKey?: string;
    model: string;
  };
  email: {
    provider: 'brevo' | 'console';
    apiKey?: string;
    fromEmail: string;
  };
  automation: {
    n8nWebhookUrl?: string;
  };
}

export const config: AppConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  ai: {
    provider: (process.env.AI_PROVIDER as 'gemini' | 'mock') || 'gemini',
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.AI_MODEL || 'gemini-3.8-flash'
  },
  email: {
    provider: (process.env.EMAIL_PROVIDER as 'brevo' | 'console') || 'brevo',
    apiKey: process.env.BREVO_API_KEY,
    fromEmail: process.env.EMAIL_FROM || 'agent@adaptiv.emberground.dev'
  },
  automation: {
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL
  }
};
