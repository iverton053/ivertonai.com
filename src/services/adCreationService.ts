// AI-Powered Ad Creation Service
import { openaiService } from './openaiService';
import { v4 as uuidv4 } from 'uuid';

export interface AdCreativeRequest {
  industry: string;
  target_audience: string;
  campaign_objective: string;
  brand_voice: 'professional' | 'casual' | 'playful' | 'authoritative' | 'friendly';
  product_service: string;
  key_benefits: string[];
  call_to_action: string;
  platform: string;
  ad_format: 'single_image' | 'video' | 'carousel' | 'text_only' | 'story';
}

export interface GeneratedAdCreative {
  id: string;
  headline: string;
  description: string;
  body_text: string;
  cta_text: string;
  hashtags: string[];
  platform_specific: any;
  performance_prediction: {
    estimated_ctr: number;
    estimated_cpc: number;
    confidence_score: number;
  };
  variations: AdCreativeVariation[];
}

export interface AdCreativeVariation {
  id: string;
  headline: string;
  description: string;
  body_text: string;
  variation_type: 'headline' | 'description' | 'cta' | 'complete';
}

export interface AdImageRequest {
  style: 'professional' | 'modern' | 'minimalist' | 'bold' | 'elegant';
  color_scheme: string[];
  elements: string[];
  text_overlay?: string;
  brand_colors?: string[];
  image_type: 'product' | 'lifestyle' | 'abstract' | 'infographic';
}

export interface GeneratedAdImage {
  id: string;
  image_url: string;
  alt_text: string;
  dimensions: { width: number; height: number };
  variations: string[];
}

export interface AdVideoRequest {
  duration: number; // in seconds
  style: 'animated' | 'live_action' | 'motion_graphics' | 'slideshow';
  voiceover: boolean;
  music_type: 'upbeat' | 'professional' | 'calm' | 'dramatic' | 'none';
  scenes: AdVideoScene[];
}

export interface AdVideoScene {
  duration: number;
  description: string;
  text_overlay?: string;
  transition: 'fade' | 'slide' | 'zoom' | 'cut';
}

export interface GeneratedAdVideo {
  id: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  dimensions: { width: number; height: number };
  script: string;
}

export interface CopyTestingRequest {
  original_copy: string;
  test_variants: number;
  focus_areas: ('headline' | 'description' | 'cta' | 'emotional_appeal' | 'value_proposition')[];
  target_metrics: ('ctr' | 'conversion_rate' | 'engagement' | 'brand_awareness')[];
}

export interface CopyTestResults {
  test_id: string;
  variants: CopyVariant[];
  recommendations: string[];
  best_performing: string;
}

export interface CopyVariant {
  id: string;
  copy: GeneratedAdCreative;
  predicted_performance: {
    ctr_lift: number;
    engagement_score: number;
    conversion_probability: number;
  };
}

class AdCreationService {
  private dalleApiKey: string;
  private elevenLabsApiKey: string; // For voiceover generation

  constructor() {
    this.dalleApiKey = import.meta.env.VITE_DALLE_API_KEY || '';
    this.elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  }

  // AI-Powered Ad Copy Generation
  async generateAdCreative(request: AdCreativeRequest): Promise<GeneratedAdCreative> {
    try {
      const prompt = this.buildCreativePrompt(request);
      
      const response = await openaiService.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert advertising copywriter with 15+ years of experience creating high-converting ads across all digital platforms. You understand consumer psychology, platform-specific best practices, and performance optimization.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      });

      const creativeData = this.parseCreativeResponse(response.choices[0]?.message?.content || '');
      
      // Generate variations
      const variations = await this.generateCreativeVariations(creativeData, request);
      
      // Predict performance
      const performancePrediction = await this.predictCreativePerformance(creativeData, request);

      return {
        id: uuidv4(),
        ...creativeData,
        platform_specific: this.generatePlatformSpecific(creativeData, request.platform),
        performance_prediction: performancePrediction,
        variations
      };
    } catch (error) {
      console.error('Ad creative generation failed:', error);
      throw new Error('Failed to generate ad creative');
    }
  }

  // AI Image Generation for Ads
  async generateAdImage(request: AdImageRequest): Promise<GeneratedAdImage> {
    try {
      if (!this.dalleApiKey) {
        // Fallback to placeholder service
        return this.generatePlaceholderImage(request);
      }

      const prompt = this.buildImagePrompt(request);
      
      const response = await openaiService.client.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid"
      });

      const imageUrl = response.data[0]?.url || '';
      
      // Generate variations
      const variations = await this.generateImageVariations(imageUrl, request);

      return {
        id: uuidv4(),
        image_url: imageUrl,
        alt_text: this.generateAltText(request),
        dimensions: { width: 1024, height: 1024 },
        variations
      };
    } catch (error) {
      console.error('Ad image generation failed:', error);
      return this.generatePlaceholderImage(request);
    }
  }

  // AI Video Creation for Ads
  async generateAdVideo(request: AdVideoRequest): Promise<GeneratedAdVideo> {
    try {
      // Generate video script
      const script = await this.generateVideoScript(request);
      
      // For now, we'll simulate video creation
      // In production, you'd integrate with services like:
      // - Runway ML for AI video generation
      // - Synthesia for AI avatar videos
      // - Lumen5 for automated video creation
      
      const videoData = await this.simulateVideoGeneration(request, script);
      
      return {
        id: uuidv4(),
        video_url: videoData.url,
        thumbnail_url: videoData.thumbnail,
        duration: request.duration,
        dimensions: { width: 1920, height: 1080 },
        script
      };
    } catch (error) {
      console.error('Ad video generation failed:', error);
      throw new Error('Failed to generate ad video');
    }
  }

  // A/B Testing for Ad Copy
  async generateCopyTestVariants(request: CopyTestingRequest): Promise<CopyTestResults> {
    try {
      const variants: CopyVariant[] = [];
      
      for (let i = 0; i < request.test_variants; i++) {
        const variant = await this.generateCopyVariant(request, i);
        const performance = await this.predictVariantPerformance(variant, request);
        
        variants.push({
          id: uuidv4(),
          copy: variant,
          predicted_performance: performance
        });
      }

      // Sort by predicted performance
      variants.sort((a, b) => b.predicted_performance.conversion_probability - a.predicted_performance.conversion_probability);
      
      const recommendations = await this.generateTestingRecommendations(variants, request);

      return {
        test_id: uuidv4(),
        variants,
        recommendations,
        best_performing: variants[0]?.id || ''
      };
    } catch (error) {
      console.error('Copy testing failed:', error);
      throw new Error('Failed to generate copy test variants');
    }
  }

  // Dynamic Creative Optimization
  async optimizeCreativePerformance(
    creative: GeneratedAdCreative,
    performanceData: any
  ): Promise<GeneratedAdCreative> {
    try {
      const optimizationPrompt = `
        Analyze this ad creative performance and suggest optimizations:
        
        Original Creative:
        Headline: ${creative.headline}
        Description: ${creative.description}
        CTA: ${creative.cta_text}
        
        Performance Data:
        CTR: ${performanceData.ctr}%
        Conversion Rate: ${performanceData.conversion_rate}%
        Engagement: ${performanceData.engagement}
        
        Focus on improving the weakest performing elements while maintaining brand consistency.
      `;

      const response = await openaiService.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at optimizing ad creative based on performance data. Provide specific, actionable improvements."
          },
          {
            role: "user",
            content: optimizationPrompt
          }
        ],
        max_tokens: 600,
        temperature: 0.7
      });

      const optimizedData = this.parseOptimizationResponse(response.choices[0]?.message?.content || '');
      
      return {
        ...creative,
        id: uuidv4(), // New ID for optimized version
        ...optimizedData,
        performance_prediction: {
          ...creative.performance_prediction,
          confidence_score: Math.min(creative.performance_prediction.confidence_score + 0.1, 1.0)
        }
      };
    } catch (error) {
      console.error('Creative optimization failed:', error);
      return creative;
    }
  }

  // Audience-Specific Creative Generation
  async generateAudienceSpecificCreatives(
    baseRequest: AdCreativeRequest,
    audiences: string[]
  ): Promise<GeneratedAdCreative[]> {
    const creatives: GeneratedAdCreative[] = [];
    
    for (const audience of audiences) {
      try {
        const audienceRequest = {
          ...baseRequest,
          target_audience: audience
        };
        
        const creative = await this.generateAdCreative(audienceRequest);
        creatives.push(creative);
      } catch (error) {
        console.error(`Failed to generate creative for audience ${audience}:`, error);
      }
    }
    
    return creatives;
  }

  // Competitive Creative Analysis
  async analyzeCompetitorCreatives(
    industry: string,
    competitors: string[]
  ): Promise<any> {
    try {
      const analysisPrompt = `
        Analyze the advertising creative strategies for these competitors in the ${industry} industry:
        ${competitors.join(', ')}
        
        Provide insights on:
        1. Common messaging themes
        2. Visual style trends
        3. CTA strategies
        4. Emotional appeals used
        5. Opportunities for differentiation
      `;

      const response = await openaiService.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a competitive intelligence analyst specializing in advertising creative analysis."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        max_tokens: 800,
        temperature: 0.6
      });

      return this.parseCompetitiveAnalysis(response.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Competitive analysis failed:', error);
      return null;
    }
  }

  // Helper Methods
  private buildCreativePrompt(request: AdCreativeRequest): string {
    return `
      Create high-converting ${request.platform} ad copy for:
      
      Industry: ${request.industry}
      Target Audience: ${request.target_audience}
      Campaign Objective: ${request.campaign_objective}
      Brand Voice: ${request.brand_voice}
      Product/Service: ${request.product_service}
      Key Benefits: ${request.key_benefits.join(', ')}
      Desired CTA: ${request.call_to_action}
      Ad Format: ${request.ad_format}
      
      Requirements:
      - Follow ${request.platform} best practices
      - Use ${request.brand_voice} tone
      - Include compelling value proposition
      - Create urgency and emotional appeal
      - Optimize for ${request.campaign_objective}
      
      Provide response in this JSON format:
      {
        "headline": "primary headline",
        "description": "supporting description",
        "body_text": "main ad body",
        "cta_text": "call to action",
        "hashtags": ["relevant", "hashtags"]
      }
    `;
  }

  private buildImagePrompt(request: AdImageRequest): string {
    const elements = request.elements.join(', ');
    const colors = request.color_scheme.join(', ');
    
    return `
      Create a ${request.style} ${request.image_type} image for digital advertising.
      Style: ${request.style}
      Colors: ${colors}
      Elements: ${elements}
      ${request.text_overlay ? `Text overlay: "${request.text_overlay}"` : ''}
      
      Requirements:
      - High quality, professional
      - Optimized for digital ads
      - Eye-catching and engaging
      - Clear focal point
      - Suitable for multiple platforms
    `;
  }

  private async generateVideoScript(request: AdVideoRequest): Promise<string> {
    const scriptPrompt = `
      Create a ${request.duration}-second video ad script with ${request.scenes.length} scenes.
      Style: ${request.style}
      ${request.voiceover ? 'Include voiceover text' : 'Visual-only with text overlays'}
      Music: ${request.music_type}
      
      Scenes:
      ${request.scenes.map((scene, i) => `
        Scene ${i + 1} (${scene.duration}s): ${scene.description}
        ${scene.text_overlay ? `Text: "${scene.text_overlay}"` : ''}
        Transition: ${scene.transition}
      `).join('\n')}
      
      Provide detailed script with timing, visuals, and dialogue.
    `;

    const response = await openaiService.client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a video ad script writer specializing in short-form, high-converting video ads."
        },
        {
          role: "user",
          content: scriptPrompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || '';
  }

  private parseCreativeResponse(response: string): any {
    try {
      // Try to parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing
      return {
        headline: this.extractValue(response, 'headline') || 'Boost Your Business Today',
        description: this.extractValue(response, 'description') || 'Discover powerful solutions',
        body_text: this.extractValue(response, 'body_text') || 'Transform your business with our innovative solutions.',
        cta_text: this.extractValue(response, 'cta_text') || 'Learn More',
        hashtags: ['#business', '#growth', '#innovation']
      };
    } catch (error) {
      console.error('Failed to parse creative response:', error);
      return this.getDefaultCreative();
    }
  }

  private extractValue(text: string, key: string): string {
    const regex = new RegExp(`"?${key}"?\\s*:?\\s*"([^"]+)"`, 'i');
    const match = text.match(regex);
    return match ? match[1] : '';
  }

  private getDefaultCreative(): any {
    return {
      headline: 'Transform Your Business Today',
      description: 'Discover powerful solutions that drive real results',
      body_text: 'Join thousands of successful businesses using our proven platform.',
      cta_text: 'Get Started Free',
      hashtags: ['#business', '#growth', '#success']
    };
  }

  private async generateCreativeVariations(
    creative: any,
    request: AdCreativeRequest
  ): Promise<AdCreativeVariation[]> {
    const variations: AdCreativeVariation[] = [];
    
    // Generate headline variations
    const headlineVariations = await this.generateVariations(creative.headline, 'headline', request);
    headlineVariations.forEach(headline => {
      variations.push({
        id: uuidv4(),
        headline,
        description: creative.description,
        body_text: creative.body_text,
        variation_type: 'headline'
      });
    });

    return variations;
  }

  private async generateVariations(
    original: string,
    type: string,
    request: AdCreativeRequest
  ): Promise<string[]> {
    const prompt = `
      Create 3 variations of this ${type} for ${request.platform} ads:
      Original: "${original}"
      
      Keep the same meaning and ${request.brand_voice} tone, but vary:
      - Word choice
      - Structure
      - Emotional appeal
      
      Return as a simple list.
    `;

    try {
      const response = await openaiService.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.8
      });

      const content = response.choices[0]?.message?.content || '';
      return content.split('\n').filter(line => line.trim()).slice(0, 3);
    } catch (error) {
      return [original];
    }
  }

  private async predictCreativePerformance(
    creative: any,
    request: AdCreativeRequest
  ): Promise<any> {
    // Simulate ML-based performance prediction
    const baseScore = Math.random() * 0.5 + 0.5; // 0.5-1.0
    
    // Adjust based on creative elements
    let ctrMultiplier = 1.0;
    if (creative.headline.includes('free')) ctrMultiplier += 0.1;
    if (creative.cta_text.includes('now')) ctrMultiplier += 0.05;
    if (creative.description.length > 50) ctrMultiplier -= 0.05;
    
    return {
      estimated_ctr: Math.round((2.5 * ctrMultiplier) * 100) / 100,
      estimated_cpc: Math.round((3.50 / ctrMultiplier) * 100) / 100,
      confidence_score: baseScore
    };
  }

  private generatePlatformSpecific(creative: any, platform: string): any {
    const platformSpecs: any = {
      'facebook_ads': {
        character_limits: { headline: 40, description: 125 },
        image_ratio: '1.91:1',
        recommended_hashtags: 3
      },
      'google_ads': {
        character_limits: { headline: 30, description: 90 },
        extensions: ['sitelink', 'callout'],
        match_types: ['exact', 'phrase', 'broad']
      },
      'linkedin_ads': {
        character_limits: { headline: 50, description: 600 },
        targeting: 'professional',
        content_tone: 'business'
      }
    };

    return platformSpecs[platform] || {};
  }

  private generatePlaceholderImage(request: AdImageRequest): GeneratedAdImage {
    const placeholderUrl = `https://via.placeholder.com/1024x1024/${request.color_scheme[0] || 'cccccc'}/ffffff?text=Ad+Image`;
    
    return {
      id: uuidv4(),
      image_url: placeholderUrl,
      alt_text: this.generateAltText(request),
      dimensions: { width: 1024, height: 1024 },
      variations: []
    };
  }

  private generateAltText(request: AdImageRequest): string {
    return `${request.style} ${request.image_type} image for digital advertising featuring ${request.elements.join(', ')}`;
  }

  private async generateImageVariations(imageUrl: string, request: AdImageRequest): Promise<string[]> {
    // In production, you'd create actual variations
    // For now, return placeholder variations
    return [
      imageUrl.replace('1024x1024', '1200x628'), // Facebook format
      imageUrl.replace('1024x1024', '1080x1080'), // Square format
      imageUrl.replace('1024x1024', '1200x1200')  // Instagram format
    ];
  }

  private async simulateVideoGeneration(request: AdVideoRequest, script: string): Promise<any> {
    // Simulate video generation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      url: 'https://example.com/generated-video.mp4',
      thumbnail: 'https://example.com/video-thumbnail.jpg'
    };
  }

  private async generateCopyVariant(
    request: CopyTestingRequest,
    variantIndex: number
  ): Promise<GeneratedAdCreative> {
    const focusArea = request.focus_areas[variantIndex % request.focus_areas.length];
    
    const prompt = `
      Create a variant of this ad copy focusing on improving the ${focusArea}:
      
      Original: "${request.original_copy}"
      
      Variation focus: ${focusArea}
      Target metric: ${request.target_metrics.join(', ')}
      
      Create a complete new version optimized for better performance.
    `;

    try {
      const response = await openaiService.client.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content || '';
      const parsed = this.parseCreativeResponse(content);
      
      return {
        id: uuidv4(),
        ...parsed,
        platform_specific: {},
        performance_prediction: {
          estimated_ctr: Math.random() * 2 + 1,
          estimated_cpc: Math.random() * 3 + 2,
          confidence_score: Math.random() * 0.3 + 0.7
        },
        variations: []
      };
    } catch (error) {
      return this.getDefaultCreative();
    }
  }

  private async predictVariantPerformance(variant: GeneratedAdCreative, request: CopyTestingRequest): Promise<any> {
    return {
      ctr_lift: (Math.random() - 0.5) * 40, // -20% to +20% CTR lift
      engagement_score: Math.random() * 100,
      conversion_probability: Math.random() * 100
    };
  }

  private async generateTestingRecommendations(variants: CopyVariant[], request: CopyTestingRequest): Promise<string[]> {
    const recommendations = [
      "Test the top 3 variants with equal budget allocation",
      "Run test for at least 14 days to gather significant data",
      "Monitor both primary and secondary metrics",
      "Consider audience segmentation for more insights"
    ];

    // Add specific recommendations based on variants
    const bestVariant = variants[0];
    if (bestVariant.predicted_performance.ctr_lift > 15) {
      recommendations.push("High CTR lift predicted - prioritize this variant");
    }

    return recommendations;
  }

  private parseOptimizationResponse(response: string): any {
    return {
      headline: this.extractValue(response, 'headline'),
      description: this.extractValue(response, 'description'),
      cta_text: this.extractValue(response, 'cta')
    };
  }

  private parseCompetitiveAnalysis(response: string): any {
    return {
      analysis: response,
      themes: this.extractThemes(response),
      opportunities: this.extractOpportunities(response),
      recommendations: this.extractRecommendations(response)
    };
  }

  private extractThemes(text: string): string[] {
    const themes = text.match(/themes?:\s*(.+?)(?:\n|$)/gi);
    return themes ? themes.map(t => t.replace(/themes?:\s*/i, '').trim()) : [];
  }

  private extractOpportunities(text: string): string[] {
    const opps = text.match(/opportunit(?:y|ies):\s*(.+?)(?:\n|$)/gi);
    return opps ? opps.map(o => o.replace(/opportunit(?:y|ies):\s*/i, '').trim()) : [];
  }

  private extractRecommendations(text: string): string[] {
    const recs = text.match(/recommend(?:ation)?s?:\s*(.+?)(?:\n|$)/gi);
    return recs ? recs.map(r => r.replace(/recommend(?:ation)?s?:\s*/i, '').trim()) : [];
  }
}

export const adCreationService = new AdCreationService();
export default AdCreationService;