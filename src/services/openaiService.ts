import OpenAI from 'openai';
import { withCostTracking } from './apiCostTracker';

// OpenAI Service for Advanced AI Insights
class OpenAIService {
  private client: OpenAI;
  private isInitialized: boolean = false;

  constructor() {
    // Initialize with API key (you'll need to add this to your env)
    this.client = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-openai-api-key-here',
      dangerouslyAllowBrowser: true // Enable client-side usage
    });
    this.isInitialized = true;
  }

  // Generate natural language insights from data
  generateInsights = withCostTracking(
    async (data: any, analysisType: string): Promise<string> => {
      if (!this.isInitialized) {
        throw new Error('OpenAI service not initialized');
      }

      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert business intelligence analyst. Analyze the provided data and generate actionable insights in a clear, professional manner. Focus on trends, opportunities, and recommendations.`
          },
          {
            role: "user",
            content: `Analyze this ${analysisType} data and provide key insights: ${JSON.stringify(data)}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content || 'No insights generated';
    },
    {
      service: 'openai',
      endpoint: 'chat/completions',
      method: 'POST',
      estimatedCost: 0.03 // GPT-4 cost
    }
  );

  // Generate prediction explanations
  async explainPrediction(prediction: any, context: any): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('OpenAI service not initialized');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an AI expert explaining machine learning predictions. Provide clear, non-technical explanations that business users can understand.`
          },
          {
            role: "user",
            content: `Explain this prediction: ${JSON.stringify(prediction)} based on context: ${JSON.stringify(context)}`
          }
        ],
        max_tokens: 300,
        temperature: 0.5
      });

      return response.choices[0]?.message?.content || 'No explanation available';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return 'Explanation unavailable';
    }
  }

  // Generate actionable recommendations
  generateRecommendations = withCostTracking(
    async (analysisResults: any): Promise<string[]> => {
      if (!this.isInitialized) {
        throw new Error('OpenAI service not initialized');
      }

      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a strategic business advisor. Based on the analysis results, provide 3-5 specific, actionable recommendations. Format as a JSON array of strings.`
          },
          {
            role: "user",
            content: `Generate recommendations based on: ${JSON.stringify(analysisResults)}`
          }
        ],
        max_tokens: 400,
        temperature: 0.6
      });

      const content = response.choices[0]?.message?.content || '[]';
      try {
        return JSON.parse(content);
      } catch {
        return [content];
      }
    },
    {
      service: 'openai',
      endpoint: 'chat/completions',
      method: 'POST',
      estimatedCost: 0.03
    }
  );

  // Natural language query interface
  async processNaturalLanguageQuery(query: string, contextData: any): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('OpenAI service not initialized');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a business intelligence assistant with access to dashboard data. Answer questions about the data in a clear, helpful manner. Provide specific numbers and insights when possible.`
          },
          {
            role: "user",
            content: `Question: "${query}". Available data: ${JSON.stringify(contextData)}`
          }
        ],
        max_tokens: 400,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content || 'Unable to process query';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return 'Query processing unavailable';
    }
  }

  // Generate content suggestions for marketing
  async generateContentSuggestions(clientData: any, industry: string): Promise<any[]> {
    if (!this.isInitialized) {
      throw new Error('OpenAI service not initialized');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a content marketing expert. Generate 5 content ideas based on client performance data and industry trends. Format as JSON array with title, description, and content_type fields.`
          },
          {
            role: "user",
            content: `Generate content ideas for ${industry} industry based on data: ${JSON.stringify(clientData)}`
          }
        ],
        max_tokens: 600,
        temperature: 0.8
      });

      const content = response.choices[0]?.message?.content || '[]';
      try {
        return JSON.parse(content);
      } catch {
        return [];
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      return [];
    }
  }

  // Predict market trends
  async predictMarketTrends(historicalData: any, timeframe: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('OpenAI service not initialized');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a market trend analyst. Analyze historical data and predict trends for the specified timeframe. Provide confidence levels and reasoning.`
          },
          {
            role: "user",
            content: `Predict market trends for ${timeframe} based on: ${JSON.stringify(historicalData)}`
          }
        ],
        max_tokens: 500,
        temperature: 0.6
      });

      const content = response.choices[0]?.message?.content || '{}';
      try {
        return JSON.parse(content);
      } catch {
        return { prediction: content, confidence: 'medium' };
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      return { prediction: 'Unable to predict trends', confidence: 'low' };
    }
  }
}

export const openaiService = new OpenAIService();
export default OpenAIService;