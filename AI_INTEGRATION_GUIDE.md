# 🤖 AI Integration Guide for BMECom

## Overview

BMECom now supports advanced AI services for enhanced content generation. The system can automatically generate titles, abstracts, and images for articles using multiple AI providers, with intelligent fallback to existing methods when AI services are not available.

## Supported AI Services

### 1. OpenAI (GPT-4 + DALL-E)
- **Title Generation**: Uses GPT-4 to create compelling, SEO-friendly titles
- **Abstract Generation**: Generates comprehensive, accurate abstracts
- **Image Generation**: Creates professional scientific images using DALL-E 3
- **API Endpoint**: `https://api.openai.com/v1/`

### 2. Anthropic (Claude)
- **Title Generation**: Uses Claude 3 Sonnet for intelligent title creation
- **Abstract Generation**: Generates detailed, scientifically accurate abstracts
- **API Endpoint**: `https://api.anthropic.com/v1/messages`

### 3. Google (Gemini)
- **Title Generation**: Uses Gemini Pro for content-aware titles
- **Abstract Generation**: Creates comprehensive summaries
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`

## Configuration

### Accessing AI Configuration
1. Log in to BMECom
2. Navigate to the Articles page
3. Click on the moderator section (if you have moderator privileges)
4. Scroll down to the "🤖 AI Services Configuration" section

### Setting Up API Keys

#### OpenAI Setup
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the API key
5. Paste it into the "OpenAI API Key" field in BMECom
6. Click "Configure OpenAI"

#### Anthropic Setup
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Generate a new API key
4. Copy the API key
5. Paste it into the "Anthropic API Key" field in BMECom
6. Click "Configure Anthropic"

#### Google Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a project or select existing one
3. Generate an API key
4. Copy the API key
5. Paste it into the "Google API Key" field in BMECom
6. Click "Configure Google"

## How It Works

### Content Processing Flow
1. **URL Submission**: User submits an article URL
2. **Content Extraction**: System fetches and parses the webpage content
3. **AI Processing**: If AI services are configured, the system attempts to use them in order of preference:
   - OpenAI (GPT-4 + DALL-E)
   - Anthropic (Claude)
   - Google (Gemini)
4. **Fallback**: If AI services fail or are not configured, the system uses built-in content generation methods
5. **Storage**: Generated content is saved with the article

### Title Generation
- **AI Method**: Analyzes article content and generates SEO-friendly, compelling titles
- **Fallback Method**: Uses keyword analysis and biomedical engineering terminology scoring
- **Length Limit**: Maximum 80 characters
- **Format**: Title + " - " + Domain

### Abstract Generation
- **AI Method**: Creates comprehensive, scientifically accurate abstracts (300-500 words)
- **Fallback Method**: Extracts meaningful sentences and combines them intelligently
- **Content Focus**: Emphasizes biomedical engineering relevance and scientific accuracy

### Image Generation
- **AI Method**: DALL-E 3 creates professional scientific images based on article content
- **Fallback Method**: Unsplash generates relevant biomedical engineering images
- **Style**: Modern, clean, scientific, professional
- **Size**: 800x400 pixels

## Features

### Automatic AI Enhancement
- New articles automatically use AI services when available
- Seamless fallback to existing methods when AI is unavailable
- No user intervention required

### Multiple Service Support
- Configure multiple AI services for redundancy
- Automatic failover between services
- Service-specific optimization

### Content Quality
- Biomedical engineering domain expertise
- Scientific accuracy and relevance
- Professional presentation

### Security
- API keys stored securely in browser localStorage
- No server-side storage of sensitive credentials
- Easy key management and removal

## Management Functions

### Check AI Services Status
- Click "🔍 Check AI Services Status" to see which services are configured
- Displays current configuration status for all services

### Clear All AI Services
- Click "🗑️ Clear All AI Services" to remove all API keys
- Confirmation dialog prevents accidental deletion

### Individual Service Management
- Configure or remove individual services
- Real-time feedback on configuration status

## Troubleshooting

### Common Issues

#### "AI title generation failed, using fallback"
- Check API key validity
- Verify internet connection
- Ensure API quota is not exceeded

#### "OpenAI API key not configured"
- Configure API key in moderator section
- Ensure you have moderator privileges

#### "API error: 401"
- Invalid or expired API key
- Regenerate API key and reconfigure

#### "API error: 429"
- Rate limit exceeded
- Wait before submitting new articles
- Consider upgrading API plan

### Best Practices

1. **Multiple Services**: Configure at least 2 AI services for redundancy
2. **API Limits**: Monitor API usage to avoid rate limits
3. **Content Quality**: Review generated content for accuracy
4. **Regular Updates**: Keep API keys current and valid

## Technical Details

### API Integration
- RESTful API calls with proper error handling
- Automatic retry logic with exponential backoff
- Comprehensive logging for debugging

### Content Processing
- Intelligent text extraction from web pages
- Biomedical engineering keyword analysis
- Professional formatting and presentation

### Performance
- Asynchronous processing for better user experience
- Caching of generated content
- Optimized API calls to minimize latency

## Future Enhancements

- Support for additional AI providers
- Custom prompt templates
- Batch processing capabilities
- Advanced content analysis
- Multi-language support

## Support

For technical support or questions about AI integration:
1. Check the troubleshooting section above
2. Review API provider documentation
3. Contact the development team

---

*This guide covers the AI integration features added to BMECom. The system is designed to enhance content quality while maintaining reliability through intelligent fallback mechanisms.* 