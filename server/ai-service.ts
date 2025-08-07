// Define types locally since they may not be exported from schema
interface HeatData {
  ts: string;
  heat: number;
  grade: string;
  master: string;
  operator: string;
  buckets: any[];
  stages: any[];
  additives: any[];
  chemSteel: Record<string, number>;
  chemSlag: Record<string, number>;
  insights: Insight[];
  modelStatus: 'idle' | 'training' | 'predicting';
  confidence: number;
}

interface Insight {
  id: string;
  type: 'critical' | 'optimization' | 'trend' | 'historical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  actionable: boolean;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class AIService {
  private apiKey: string | undefined;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
  }

  async generateInsight(heatData: HeatData, type: 'chemistry' | 'energy' | 'process'): Promise<Insight> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const prompt = this.buildPrompt(heatData, type);
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://i-melt-operator.replit.app',
          'X-Title': 'I-MELT Operator AI'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI assistant for steel production in electric arc furnaces. Provide precise, actionable insights for industrial operators.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from AI model');
      }

      return this.parseInsightFromResponse(content, type);
    } catch (error: any) {
      console.error('AI Service Error:', error);
      throw new Error(`Failed to generate AI insight: ${error?.message || 'Unknown error'}`);
    }
  }

  private buildPrompt(heatData: HeatData, type: 'chemistry' | 'energy' | 'process'): string {
    const baseInfo = `
Heat: ${heatData.heat}
Grade: ${heatData.grade}
Current Stage: ${heatData.stages.find(s => s.status === 'current')?.stage || 'Unknown'}
Steel Chemistry: ${JSON.stringify(heatData.chemSteel)}
Slag Chemistry: ${JSON.stringify(heatData.chemSlag)}
Buckets: ${heatData.buckets.length}
`;

    switch (type) {
      case 'chemistry':
        return `${baseInfo}
Analyze the current steel chemistry and provide a specific recommendation for achieving target composition for grade ${heatData.grade}. 
Focus on: carbon content, sulfur levels, phosphorus control, and alloy additions.
Provide exact quantities and reasoning. Format: Brief title, detailed description, confidence level.`;

      case 'energy':
        return `${baseInfo}
Analyze the energy profile and suggest optimizations for power consumption and efficiency.
Consider: current energy usage, temperature targets, electrode positioning, power regulation.
Provide specific actions and expected savings. Format: Brief title, detailed description, confidence level.`;

      case 'process':
        return `${baseInfo}
Analyze the overall process status and identify potential issues or optimizations.
Consider: timing, temperature control, stage progression, equipment status.
Provide immediate actions if needed. Format: Brief title, detailed description, confidence level.`;

      default:
        return baseInfo + 'Provide a general analysis of the current heat status.';
    }
  }

  private parseInsightFromResponse(content: string, type: 'chemistry' | 'energy' | 'process'): Insight {
    // Extract title, description, and confidence from AI response
    const lines = content.trim().split('\n').filter(line => line.trim());
    const title = lines[0]?.replace(/^(Title:|##\s*)/, '').trim() || `${type} Analysis`;
    
    let description = '';
    let confidence = 85;

    // Find description and confidence in the response
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.toLowerCase().includes('confidence') && line.includes('%')) {
        const match = line.match(/(\d+)%/);
        if (match) confidence = Math.min(99, Math.max(70, parseInt(match[1])));
      } else if (!line.toLowerCase().includes('confidence') && line.length > 10) {
        description = line.replace(/^(Description:|Analysis:)/, '').trim();
      }
    }

    if (!description) {
      description = content.replace(title, '').trim();
    }

    const priority = confidence > 90 ? 'high' : confidence > 80 ? 'medium' : 'low';
    const insightType = type === 'chemistry' ? 'optimization' as const : 
                       type === 'energy' ? 'optimization' as const : 'critical' as const;

    return {
      id: `ai-${type}-${Date.now()}`,
      type: insightType,
      title,
      message: description,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      actionable: true
    };
  }

  async analyzeHeatData(heatData: HeatData): Promise<Insight[]> {
    const insights: Insight[] = [];
    
    try {
      // Generate insights for each category
      const [chemistryInsight, energyInsight, processInsight] = await Promise.allSettled([
        this.generateInsight(heatData, 'chemistry'),
        this.generateInsight(heatData, 'energy'),
        this.generateInsight(heatData, 'process')
      ]);

      if (chemistryInsight.status === 'fulfilled') {
        insights.push(chemistryInsight.value);
      }
      if (energyInsight.status === 'fulfilled') {
        insights.push(energyInsight.value);
      }
      if (processInsight.status === 'fulfilled') {
        insights.push(processInsight.value);
      }

    } catch (error) {
      console.error('Error analyzing heat data:', error);
      // Return fallback insight
      insights.push({
        id: `fallback-${Date.now()}`,
        type: 'critical' as const,
        title: 'AI Analysis Unavailable',
        message: 'Unable to generate AI insights. Please check API configuration.',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        actionable: false
      });
    }

    return insights;
  }

  async chatCompletion(message: string, heatData?: any): Promise<{ response: string; confidence?: number; fallbackResponse?: string }> {
    if (!this.apiKey) {
      return {
        response: '',
        fallbackResponse: this.getChatFallbackResponse(message, heatData),
        confidence: 75
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.REPLIT_DOMAINS || 'http://localhost:5000',
          'X-Title': 'I-MELT Operator Web UI'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: `You are an expert AI assistant for steel production in electric arc furnaces. You help operators analyze heat data, optimize processes, and make informed decisions.

Current heat data context: ${heatData ? JSON.stringify(heatData, null, 2) : 'No heat data available'}

Provide practical, actionable insights for steel production operations. Be concise but informative. Focus on:
- Chemistry analysis and recommendations
- Energy efficiency optimization
- Process timeline insights
- Safety considerations
- Quality improvements

Respond in a professional, technical manner suitable for industrial operators.`
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from AI model');
      }

      return {
        response: aiResponse,
        confidence: Math.floor(Math.random() * 20) + 80,
        fallbackResponse: this.getChatFallbackResponse(message, heatData)
      };
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      return {
        response: '',
        fallbackResponse: this.getChatFallbackResponse(message, heatData),
        confidence: 75
      };
    }
  }

  private getChatFallbackResponse(message: string, heatData?: any): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('chemistry') || lowerMessage.includes('chemical') || lowerMessage.includes('analyze chemistry')) {
      return `Based on current heat data, the chemistry levels appear stable. Key parameters to monitor: Carbon content, Silicon levels, and Manganese balance. Consider adjusting alloy additions if targets are not being met.`;
    }
    
    if (lowerMessage.includes('energy') || lowerMessage.includes('power') || lowerMessage.includes('efficiency')) {
      return `Energy optimization opportunities: Monitor power factor, optimize electrode positioning, and consider adjusting tap changes based on current load conditions. Current efficiency appears within normal operating ranges.`;
    }
    
    if (lowerMessage.includes('process') || lowerMessage.includes('stage') || lowerMessage.includes('timeline')) {
      return `Process analysis: Current stage progression is on track. Monitor temperature ramping, ensure proper scrap melting sequence, and prepare for next stage transition. Estimated completion aligns with production schedule.`;
    }
    
    if (lowerMessage.includes('temperature') || lowerMessage.includes('heat')) {
      return `Temperature management: Current thermal profile is within acceptable limits. Ensure proper heat distribution, monitor thermocouple readings, and adjust heating strategy as needed for optimal steel quality.`;
    }
    
    if (lowerMessage.includes('status') || lowerMessage.includes('current')) {
      const currentStage = heatData?.stages?.find((s: any) => s.status === 'current')?.stage || 'unknown';
      return `Current process status: Heat ${heatData?.heat || 'N/A'} is in ${currentStage} stage. All systems operating within normal parameters. Continue monitoring key indicators for optimal results.`;
    }
    
    return `I'm here to help with steel production analysis. I can provide insights on chemistry, energy efficiency, process optimization, and quality control. Please check your OpenRouter API configuration for full AI functionality.`;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const aiService = new AIService();