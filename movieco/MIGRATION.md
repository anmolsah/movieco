# Migration Guide: Gemini to OpenRouter

This guide helps you migrate from Gemini AI to OpenRouter AI for your Movieco installation.

## Why OpenRouter?

- **Multiple AI Models**: Access to various AI models from different providers
- **Better Reliability**: More stable API with better uptime
- **Cost Effective**: Free tier available with multiple model options
- **Flexibility**: Easy to switch between different AI models
- **Better Rate Limits**: More generous rate limiting

## Migration Steps

### 1. Update Environment Variables

Replace your Gemini API key with OpenRouter:

**Old (.env):**

```env
VITE_GEMINI_API_KEY=your_gemini_key_here
```

**New (.env):**

```env
VITE_OPENROUTER_API_KEY=your_openrouter_key_here
```

### 2. Get OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a free account
3. Go to your dashboard and create an API key
4. Add credits or use free models

### 3. Choose Your AI Model

The default model is `meta-llama/llama-3.2-3b-instruct:free` (completely free).

You can change it in `src/config/api.js`:

```javascript
// Free models (no cost)
export const OPENROUTER_MODEL = "meta-llama/llama-3.2-3b-instruct:free";

// Paid models (better performance)
// export const OPENROUTER_MODEL = "openai/gpt-3.5-turbo";
// export const OPENROUTER_MODEL = "anthropic/claude-3-haiku";
```

### 4. Test the Migration

1. Start your development server: `npm run dev`
2. Try the AI movie bot feature
3. Ask for movie recommendations like "I want funny movies from the 90s"
4. Verify the AI responses are working correctly

## Model Recommendations

### For Development/Testing

- `meta-llama/llama-3.2-3b-instruct:free` - Completely free, good for testing

### For Production

- `openai/gpt-3.5-turbo` - Reliable, fast, cost-effective
- `anthropic/claude-3-haiku` - Great for complex queries
- `meta-llama/llama-3.1-8b-instruct` - Good balance of performance and cost

## Performance Comparison

| Feature | Gemini | OpenRouter |
|---------|--------|------------|
| Free Tier | Limited | Multiple free models |
| Rate Limits | Restrictive | More generous |
| Model Options | 1 | 50+ models |
| Reliability | Good | Excellent |
| Response Quality | Good | Varies by model |

## Troubleshooting

### API Key Issues

- Ensure your OpenRouter API key is active
- Check if you have sufficient credits (for paid models)
- Verify the key is correctly set in your `.env` file

### Model Errors

- Some models may be temporarily unavailable
- Try switching to a different model
- Check OpenRouter status page for model availability

### Rate Limiting

- OpenRouter has more generous rate limits than Gemini
- Free models have lower rate limits than paid ones
- Consider upgrading to paid models for production use

## Rollback Plan

If you need to rollback to Gemini:

1. Restore your old `.env` file with Gemini API key
2. Revert the changes in `src/config/api.js`
3. Revert the service files to use Gemini API format

## Support

- OpenRouter Documentation: <https://openrouter.ai/docs>
- OpenRouter Discord: <https://discord.gg/openrouter>
- GitHub Issues: Create an issue in your repository
