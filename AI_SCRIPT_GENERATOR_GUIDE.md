# AI Script Generator Integration Guide

## Overview
The AI Script Generator has been successfully integrated into the dashboard as part of the new "Content Generation" category in the sidebar. This feature allows users to create platform-optimized social media scripts using AI.

## Features Added

### 1. Sidebar Integration
- **New Category**: "Content Generation" section added to the sidebar
- **Sub-item**: "AI Script Generator" under Content Generation
- **Collapsible**: The section is collapsible and starts collapsed by default

### 2. AI Script Generator Component
Location: `src/components/content-generation/AIScriptGenerator.tsx`

#### Key Features:
- **Multi-platform support**: Instagram, TikTok, YouTube, LinkedIn, Facebook, Twitter, Pinterest
- **Content types**: Video scripts, captions, story scripts, carousel posts, reel scripts
- **Advanced configuration**: Tone, industry, campaign type, language support
- **Real-time preview**: Quality scores and performance predictions
- **Export options**: Copy to clipboard and download as text file

#### Form Fields:
- **Basic Information**:
  - Platform selection (visual buttons)
  - Purpose
  - Target audience
  - Key message
  - Call to action

- **Content Settings**:
  - Script length (short/medium/long)
  - Content type
  - Tone (10 options: engaging, professional, casual, etc.)
  - Industry (11 categories)
  - Language (13 languages including Hinglish/Spanglish)
  - Brand context (optional)

### 3. n8n Webhook Integration
Location: `src/utils/webhookConfig.js`

#### Added Features:
- **New endpoint**: `/webhook/generate-script` for AI Script Generator
- **WebhookService method**: `generateScript(formData)`
- **Fallback system**: Uses mock data when webhook is disabled/unavailable
- **Error handling**: Comprehensive error handling with timeout support

#### Configuration:
```javascript
// Environment variables
REACT_APP_N8N_BASE_URL=https://your-n8n-instance.com
REACT_APP_WEBHOOKS_ENABLED=true
```

### 4. n8n Workflow Compatibility
The component is designed to work with the existing n8n workflow:
`n8n-workflows-new/AI_Script Generator.json`

#### Expected Input Format:
```json
{
  "platform": "instagram",
  "purpose": "Promote new product",
  "target_audience": "Young professionals aged 25-35",
  "script_length": "medium",
  "key_message": "Your key message here",
  "cta": "Visit our website",
  "language": "english",
  "tone": "engaging",
  "content_type": "video script",
  "industry": "tech",
  "campaign_type": "product launch",
  "location": "global",
  "brand_context": "Optional brand context"
}
```

#### Expected Output Format:
```json
{
  "mainScript": "Generated script content",
  "qualityScore": 8.5,
  "performancePrediction": 78,
  "trendingElements": ["2025 trends", "Platform optimization"],
  "optimizationNotes": ["Platform-specific tips"],
  "complianceCheck": ["Policy compliance notes"]
}
```

## Usage Instructions

### For Users:
1. Navigate to the sidebar and expand "Content Generation"
2. Click on "AI Script Generator"
3. Select your target platform
4. Fill in the required fields (marked with validation)
5. Configure optional settings for better results
6. Click "Generate AI Script"
7. Review results in the Results tab
8. Copy or download your generated script

### For Developers:
1. **Environment Setup**: Configure n8n webhook URL in environment variables
2. **Webhook Service**: Use `WebhookService.generateScript(formData)` for integration
3. **Mock Data**: Component works with mock data when webhooks are disabled
4. **Error Handling**: Built-in error handling and user feedback
5. **Customization**: Easy to extend with new platforms or content types

## Technical Implementation

### Component Structure:
- **Form Tab**: Configuration interface with validation
- **Results Tab**: Generated script display with metrics
- **Stats Dashboard**: Usage statistics and quality metrics
- **Platform-specific**: Optimized for each social media platform

### State Management:
- Form data validation
- Loading states
- Error handling
- Tab switching
- Results caching

### Integration Points:
- Webhook service integration
- Environment configuration
- Mock data fallback
- Export functionality

## Files Modified/Created:

### Created:
- `src/components/content-generation/AIScriptGenerator.tsx` - Main component
- `AI_SCRIPT_GENERATOR_GUIDE.md` - This documentation

### Modified:
- `src/utils/constants.ts` - Added Content Generation section to sidebar
- `src/components/EnhancedDashboard.tsx` - Added routing for AI Script Generator
- `src/utils/webhookConfig.js` - Added AI Script Generator webhook endpoint and service method

## Next Steps:
1. Configure n8n webhook URL in environment variables
2. Test with actual n8n workflow
3. Customize branding and styling as needed
4. Add additional content types or platforms as required
5. Monitor usage analytics and performance

## Support:
The component includes comprehensive error handling and fallback mechanisms to ensure a smooth user experience even when the n8n backend is unavailable.