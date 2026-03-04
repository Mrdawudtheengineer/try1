import { OpenAI } from 'openai';
import logger from '../bot/logger.js';
import config from '../bot/config.js';

export default class Conversation {
  constructor() {
    this.client = null;
    this.conversationHistory = [];
    this.systemPrompt = `You are an intelligent Minecraft AI bot. You help players with:
- Minecraft survival tips and strategies
- Resource gathering information
- Combat advice
- Building suggestions
- Location discoveries

Keep responses brief (1-2 sentences) and casual as if chatting in Minecraft.
Always be helpful and factual about Minecraft mechanics.`;

    if (config.openai.apiKey) {
      this.client = new OpenAI({
        apiKey: config.openai.apiKey
      });
      logger.info('OpenAI client initialized');
    } else {
      logger.warn('OpenAI API key not configured');
    }
  }

  async respond(message) {
    if (!this.client) {
      return "I don't have AI capabilities configured. Set OPENAI_API_KEY in .env";
    }

    try {
      this.conversationHistory.push({
        role: 'user',
        content: message
      });

      // Keep history to last 10 messages
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...this.conversationHistory
        ],
        max_tokens: 100,
        temperature: 0.7
      });

      const assistantMessage = response.choices[0].message.content;
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      logger.debug('AI response generated', { messageLength: assistantMessage.length });
      return assistantMessage;
    } catch (err) {
      logger.error('OpenAI API error', { error: err.message });
      return 'Error generating response. Check logs for details.';
    }
  }

  async suggestStrategy(situation) {
    if (!this.client) return null;

    try {
      const prompt = `Given this Minecraft situation: ${situation}. What's the best strategy in 1 sentence?`;
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (err) {
      logger.error('Strategy suggestion error', { error: err.message });
      return null;
    }
  }

  async explainAction(action) {
    if (!this.client) return null;

    try {
      const prompt = `I just performed this Minecraft action: ${action}. Can you briefly explain why this was a good decision?`;
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 60,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (err) {
      logger.error('Action explanation error', { error: err.message });
      return null;
    }
  }

  clearHistory() {
    this.conversationHistory = [];
    logger.debug('Conversation history cleared');
  }

  getHistory() {
    return this.conversationHistory;
  }
}
