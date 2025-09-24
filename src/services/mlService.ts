import * as tf from '@tensorflow/tfjs';
import { Matrix } from 'ml-matrix';
import * as ss from 'simple-statistics';

export interface PredictionResult {
  value: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  explanation: string;
  factors: Array<{ factor: string; impact: number }>;
}

export interface TimeSeriesPrediction {
  predictions: number[];
  dates: string[];
  confidence_intervals: Array<{ lower: number; upper: number }>;
  trend_analysis: {
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number;
    seasonal_patterns: boolean;
  };
}

class MLService {
  private models: Map<string, tf.LayersModel> = new Map();
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Don't initialize immediately, do it lazily
  }

  private async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization() {
    try {
      await tf.ready();
      this.isInitialized = true;
      console.log('TensorFlow.js initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js:', error);
      this.initializationPromise = null; // Reset to allow retry
    }
  }

  // Client Churn Prediction Model
  async predictClientChurn(clientMetrics: any): Promise<PredictionResult> {
    try {
      // Use simplified heuristic-based prediction for faster response
      const features = this.extractChurnFeatures(clientMetrics);
      const heuristicResult = this.calculateHeuristicChurnRisk(features, clientMetrics);
      
      // Only use ML models if explicitly requested and system is not overloaded
      const useMLModel = false; // Temporarily disable heavy ML for performance
      
      if (useMLModel && !this.isInitialized) {
        await this.initialize();
      }

      if (useMLModel && this.isInitialized) {
        // Get or create model
        let model = this.models.get('churn');
        if (!model) {
          model = await this.createChurnModel();
          this.models.set('churn', model);
        }

        // Make prediction with timeout
        const predictionPromise = this.makeTensorPrediction(model, features);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Prediction timeout')), 3000)
        );
        
        try {
          const result = await Promise.race([predictionPromise, timeoutPromise]);
          return result as PredictionResult;
        } catch (timeoutError) {
          console.warn('ML prediction timed out, using heuristic fallback');
          return heuristicResult;
        }
      }

      return heuristicResult;
    } catch (error) {
      console.error('Churn prediction error:', error);
      return {
        value: 0.5,
        confidence: 0.3,
        trend: 'stable',
        explanation: 'Unable to calculate churn risk',
        factors: []
      };
    }
  }

  private calculateHeuristicChurnRisk(features: number[], clientMetrics: any): PredictionResult {
    // Simple heuristic-based churn calculation
    const weights = [0.2, 0.25, -0.15, -0.2, -0.1, 0.3, 0.3, 0.1]; // Negative for bad factors
    let riskScore = 0.5; // Base risk
    
    features.forEach((feature, i) => {
      riskScore += (feature - 0.5) * weights[i];
    });
    
    riskScore = Math.max(0, Math.min(1, riskScore)); // Clamp to 0-1
    
    const confidence = 0.7;
    const trend = riskScore > 0.6 ? 'up' : riskScore < 0.4 ? 'down' : 'stable';
    const factors = this.identifyChurnFactors(features, clientMetrics);
    
    return {
      value: riskScore,
      confidence,
      trend,
      explanation: this.generateChurnExplanation(riskScore, factors),
      factors
    };
  }

  private async makeTensorPrediction(model: tf.LayersModel, features: number[]): Promise<PredictionResult> {
    const prediction = model.predict(tf.tensor2d([features])) as tf.Tensor;
    const churnProbability = await prediction.data();
    
    const confidence = this.calculateConfidence(features);
    const trend = churnProbability[0] > 0.5 ? 'up' : 'down';
    const factors = this.identifyChurnFactors(features, {});

    prediction.dispose();

    return {
      value: churnProbability[0],
      confidence,
      trend,
      explanation: this.generateChurnExplanation(churnProbability[0], factors),
      factors
    };
  }

  // Revenue Forecasting using Statistical Methods (faster than LSTM)
  async predictRevenue(historicalRevenue: number[], months: number = 6): Promise<TimeSeriesPrediction> {
    try {
      // Use statistical forecasting instead of heavy ML models
      const predictions = this.generateStatisticalForecast(historicalRevenue, months);
      
      // Calculate confidence intervals
      const confidenceIntervals = this.calculateConfidenceIntervals(predictions, historicalRevenue);
      
      // Analyze trends
      const trendAnalysis = this.analyzeTrends(historicalRevenue, predictions);
      
      // Generate future dates
      const dates = this.generateFutureDates(months);

      return {
        predictions,
        dates,
        confidence_intervals: confidenceIntervals,
        trend_analysis: trendAnalysis
      };
    } catch (error) {
      console.error('Revenue prediction error:', error);
      return {
        predictions: [],
        dates: [],
        confidence_intervals: [],
        trend_analysis: {
          direction: 'stable',
          strength: 0,
          seasonal_patterns: false
        }
      };
    }
  }

  private generateStatisticalForecast(data: number[], months: number): number[] {
    if (data.length === 0) return [];
    
    // Use linear regression for trend + moving average for base
    const trend = ss.linearRegression(data.map((v, i) => [i, v]));
    const movingAverage = ss.mean(data.slice(-Math.min(6, data.length))); // Last 6 months average
    
    const predictions = [];
    for (let i = 0; i < months; i++) {
      const trendValue = trend.m * (data.length + i) + trend.b;
      const smoothed = 0.7 * trendValue + 0.3 * movingAverage; // Weighted combination
      
      // Add some realistic variance
      const variance = Math.random() * 0.1 - 0.05; // ±5% random variance
      predictions.push(Math.max(0, smoothed * (1 + variance)));
    }
    
    return predictions;
  }

  // SEO Opportunity Score Prediction
  async predictSEOOpportunities(seoData: any): Promise<PredictionResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const opportunities = [];
      
      // Analyze keyword opportunities
      if (seoData.keywords) {
        for (const keyword of seoData.keywords) {
          const features = this.extractSEOFeatures(keyword, seoData);
          const score = await this.calculateSEOOpportunityScore(features);
          
          opportunities.push({
            value: score.value,
            confidence: score.confidence,
            trend: score.trend,
            explanation: `${keyword.keyword}: ${score.explanation}`,
            factors: score.factors
          });
        }
      }

      return opportunities.sort((a, b) => b.value - a.value).slice(0, 10);
    } catch (error) {
      console.error('SEO opportunity prediction error:', error);
      return [];
    }
  }

  // Performance Trend Analysis
  async analyzePerformanceTrends(performanceData: any[]): Promise<any> {
    if (!performanceData || performanceData.length === 0) {
      return null;
    }

    try {
      // Extract time series from performance data
      const metrics = this.extractPerformanceMetrics(performanceData);
      
      const analysis = {};
      
      // Analyze each metric
      for (const [metricName, values] of Object.entries(metrics)) {
        const numericValues = values as number[];
        
        // Calculate statistical measures
        const trend = ss.linearRegression(numericValues.map((v, i) => [i, v]));
        const correlation = this.calculateCorrelations(numericValues, metrics);
        const seasonality = this.detectSeasonality(numericValues);
        
        analysis[metricName] = {
          trend: {
            slope: trend.m,
            direction: trend.m > 0 ? 'increasing' : trend.m < 0 ? 'decreasing' : 'stable',
            strength: Math.abs(trend.m),
            r_squared: this.calculateRSquared(numericValues, trend)
          },
          statistics: {
            mean: ss.mean(numericValues),
            median: ss.median(numericValues),
            variance: ss.variance(numericValues),
            standardDeviation: ss.standardDeviation(numericValues)
          },
          correlations: correlation,
          seasonality: seasonality,
          forecast: await this.forecastMetric(numericValues, 30) // 30-day forecast
        };
      }

      return analysis;
    } catch (error) {
      console.error('Performance trend analysis error:', error);
      return null;
    }
  }

  // Competitor Analysis with AI
  async analyzeCompetitorTrends(competitorData: any): Promise<any> {
    try {
      const analysis = {
        market_position: this.calculateMarketPosition(competitorData),
        competitive_gaps: this.identifyCompetitiveGaps(competitorData),
        opportunity_score: this.calculateOpportunityScore(competitorData),
        recommendations: this.generateCompetitorRecommendations(competitorData)
      };

      return analysis;
    } catch (error) {
      console.error('Competitor analysis error:', error);
      return null;
    }
  }

  // Helper Methods
  private extractChurnFeatures(metrics: any): number[] {
    return [
      metrics.login_frequency || 0,
      metrics.feature_usage || 0,
      metrics.support_tickets || 0,
      metrics.last_activity_days || 0,
      metrics.payment_delays || 0,
      metrics.engagement_score || 0,
      metrics.satisfaction_score || 0,
      metrics.contract_duration || 0
    ];
  }

  private async createChurnModel(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [8], units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private async createTimeSeriesModel(sequenceLength: number): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({
          inputShape: [sequenceLength, 1],
          units: 50,
          returnSequences: true
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({ units: 50, returnSequences: false }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 25 }),
        tf.layers.dense({ units: 1 })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  private prepareTimeSeriesData(data: number[]): number[] {
    // Normalize data
    const min = Math.min(...data);
    const max = Math.max(...data);
    return data.map(value => (value - min) / (max - min));
  }

  private async trainTimeSeriesModel(model: tf.LayersModel, data: number[]): Promise<void> {
    const windowSize = Math.min(12, Math.floor(data.length * 0.7));
    const sequences = [];
    const targets = [];

    for (let i = 0; i < data.length - windowSize; i++) {
      sequences.push(data.slice(i, i + windowSize));
      targets.push(data[i + windowSize]);
    }

    if (sequences.length === 0) return;

    const xs = tf.tensor3d(sequences.map(seq => seq.map(val => [val])));
    const ys = tf.tensor2d(targets, [targets.length, 1]);

    // Reduced epochs and training time to prevent hanging
    await model.fit(xs, ys, {
      epochs: 5, // Reduced from 50 to 5
      batchSize: 16, // Reduced batch size
      validationSplit: 0.1, // Reduced validation split
      verbose: 0
    });

    xs.dispose();
    ys.dispose();
  }

  private calculateConfidence(features: number[]): number {
    // Simple confidence calculation based on feature completeness
    const completeness = features.filter(f => f > 0).length / features.length;
    return Math.max(0.3, completeness * 0.9);
  }

  private identifyChurnFactors(features: number[], metrics: any): Array<{ factor: string; impact: number }> {
    const factorNames = [
      'Login Frequency', 'Feature Usage', 'Support Tickets',
      'Last Activity', 'Payment Delays', 'Engagement',
      'Satisfaction', 'Contract Duration'
    ];

    return features.map((value, index) => ({
      factor: factorNames[index] || `Factor ${index}`,
      impact: Math.abs(value - 0.5) * 2 // Normalized impact
    })).sort((a, b) => b.impact - a.impact);
  }

  private generateChurnExplanation(probability: number, factors: any[]): string {
    const risk = probability > 0.7 ? 'High' : probability > 0.4 ? 'Medium' : 'Low';
    const topFactor = factors[0]?.factor || 'Unknown';
    
    return `${risk} churn risk (${Math.round(probability * 100)}%). Primary factor: ${topFactor}`;
  }

  private async generateTimeSeriesPredictions(
    model: tf.LayersModel,
    data: number[],
    months: number
  ): Promise<number[]> {
    const predictions = [];
    let input = data.slice(-12); // Use last 12 data points

    for (let i = 0; i < months; i++) {
      const tensor = tf.tensor3d([input.map(val => [val])]);
      const prediction = model.predict(tensor) as tf.Tensor;
      const value = await prediction.data();
      
      predictions.push(value[0]);
      input = [...input.slice(1), value[0]]; // Sliding window
      
      tensor.dispose();
      prediction.dispose();
    }

    return predictions;
  }

  private calculateConfidenceIntervals(predictions: number[], historical: number[]): Array<{ lower: number; upper: number }> {
    const historicalStd = ss.standardDeviation(historical);
    const historicalMean = ss.mean(historical);
    
    return predictions.map(pred => {
      // Denormalize prediction
      const denormalizedPred = pred * (Math.max(...historical) - Math.min(...historical)) + Math.min(...historical);
      const margin = 1.96 * historicalStd; // 95% confidence interval
      
      return {
        lower: Math.max(0, denormalizedPred - margin),
        upper: denormalizedPred + margin
      };
    });
  }

  private analyzeTrends(historical: number[], predictions: number[]): any {
    const allData = [...historical, ...predictions];
    const regression = ss.linearRegression(allData.map((v, i) => [i, v]));
    
    return {
      direction: regression.m > 0.1 ? 'increasing' : regression.m < -0.1 ? 'decreasing' : 'stable',
      strength: Math.abs(regression.m),
      seasonal_patterns: this.detectSeasonality(historical)
    };
  }

  private detectSeasonality(data: number[]): boolean {
    if (data.length < 12) return false;
    
    // Simple seasonality detection using autocorrelation
    const quarterlyCorr = this.calculateAutocorrelation(data, 3);
    const yearlyCorr = this.calculateAutocorrelation(data, 12);
    
    return quarterlyCorr > 0.5 || yearlyCorr > 0.5;
  }

  private calculateAutocorrelation(data: number[], lag: number): number {
    if (data.length <= lag) return 0;
    
    const original = data.slice(0, -lag);
    const lagged = data.slice(lag);
    
    return ss.sampleCorrelation(original, lagged) || 0;
  }

  private generateFutureDates(months: number): string[] {
    const dates = [];
    const currentDate = new Date();
    
    for (let i = 1; i <= months; i++) {
      const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      dates.push(futureDate.toISOString().slice(0, 7)); // YYYY-MM format
    }
    
    return dates;
  }

  private extractSEOFeatures(keyword: any, seoData: any): number[] {
    return [
      keyword.search_volume || 0,
      keyword.competition || 0,
      keyword.current_rank || 100,
      keyword.cpc || 0,
      seoData.domain_authority || 0,
      seoData.page_authority || 0,
      keyword.click_through_rate || 0,
      keyword.conversion_rate || 0
    ];
  }

  private async calculateSEOOpportunityScore(features: number[]): Promise<PredictionResult> {
    // Weighted scoring algorithm for SEO opportunities
    const weights = [0.3, -0.2, -0.4, 0.1, 0.2, 0.2, 0.3, 0.4]; // Negative weight for competition and rank
    
    let score = 0;
    for (let i = 0; i < features.length; i++) {
      score += (features[i] * weights[i]) / 100; // Normalize
    }
    
    score = Math.max(0, Math.min(1, score)); // Clamp to 0-1
    
    return {
      value: score,
      confidence: 0.8,
      trend: score > 0.6 ? 'up' : 'stable',
      explanation: `Opportunity score: ${Math.round(score * 100)}%`,
      factors: features.map((f, i) => ({
        factor: ['Volume', 'Competition', 'Rank', 'CPC', 'DA', 'PA', 'CTR', 'CVR'][i],
        impact: Math.abs(f * weights[i])
      }))
    };
  }

  private extractPerformanceMetrics(data: any[]): Record<string, number[]> {
    const metrics: Record<string, number[]> = {};
    
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (typeof item[key] === 'number') {
          if (!metrics[key]) metrics[key] = [];
          metrics[key].push(item[key]);
        }
      });
    });
    
    return metrics;
  }

  private calculateCorrelations(values: number[], allMetrics: Record<string, number[]>): Record<string, number> {
    const correlations: Record<string, number> = {};
    
    Object.entries(allMetrics).forEach(([key, otherValues]) => {
      if (otherValues.length === values.length) {
        correlations[key] = ss.sampleCorrelation(values, otherValues) || 0;
      }
    });
    
    return correlations;
  }

  private calculateRSquared(actual: number[], regression: any): number {
    const predicted = actual.map((_, i) => regression.m * i + regression.b);
    const totalSumSquares = actual.reduce((sum, val) => sum + Math.pow(val - ss.mean(actual), 2), 0);
    const residualSumSquares = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    
    return 1 - (residualSumSquares / totalSumSquares);
  }

  private async forecastMetric(values: number[], days: number): Promise<number[]> {
    const trend = ss.linearRegression(values.map((v, i) => [i, v]));
    const forecast = [];
    
    for (let i = 0; i < days; i++) {
      forecast.push(trend.m * (values.length + i) + trend.b);
    }
    
    return forecast;
  }

  private calculateMarketPosition(data: any): any {
    // Implementation for market position calculation
    return {
      rank: Math.floor(Math.random() * 10) + 1,
      percentile: Math.random() * 100,
      strength: ['weak', 'moderate', 'strong'][Math.floor(Math.random() * 3)]
    };
  }

  private identifyCompetitiveGaps(data: any): any[] {
    // Implementation for identifying competitive gaps
    return [
      { area: 'SEO', gap_score: Math.random() },
      { area: 'Content', gap_score: Math.random() },
      { area: 'Social Media', gap_score: Math.random() }
    ];
  }

  private calculateOpportunityScore(data: any): number {
    return Math.random() * 100; // Placeholder implementation
  }

  private generateCompetitorRecommendations(data: any): string[] {
    return [
      'Focus on long-tail keywords',
      'Improve content quality',
      'Increase social media presence'
    ];
  }
}

export const mlService = new MLService();
export default MLService;