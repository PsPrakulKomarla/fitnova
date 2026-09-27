import { config } from '../../config/index.js';
import { IAIProvider } from './ai.interface.js';
import { GeminiAIAdapter } from './gemini.adapter.js';
import { MockAIAdapter } from './mock.adapter.js';

let cachedProvider: IAIProvider | null = null;

export function getAIProvider(): IAIProvider {
  if (cachedProvider) return cachedProvider;

  if (config.ai.provider === 'gemini' && config.ai.apiKey) {
    cachedProvider = new GeminiAIAdapter(config.ai.apiKey);
  } else {
    cachedProvider = new MockAIAdapter();
  }

  return cachedProvider;
}

export function setAIProvider(provider: IAIProvider) {
  cachedProvider = provider;
}
