/**
 * Anki Tool AI Auto-fill Worker
 * Cloudflare Worker for handling AI auto-fill requests with rate limiting
 */

const DAILY_LIMIT = 10;
const GEMMA_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent';

// CORS headers for browser extension requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Extension-Id',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST to /api/autofill
    const url = new URL(request.url);
    if (request.method !== 'POST' || !url.pathname.endsWith('/api/autofill')) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // Get client identifier (extension ID + IP for robustness)
      const extensionId = request.headers.get('X-Extension-Id') || 'unknown';
      const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
      const clientId = `${extensionId}:${clientIP}`;
      
      // Get today's date in UTC
      const today = new Date().toISOString().split('T')[0];
      const rateLimitKey = `${clientId}:${today}`;

      // Check rate limit using KV
      const currentCount = parseInt(await env.RATE_LIMIT.get(rateLimitKey) || '0');
      
      if (currentCount >= DAILY_LIMIT) {
        return new Response(JSON.stringify({
          error: 'Daily limit reached',
          message: 'You have used all 10 AI auto-fill requests for today. Limit resets at midnight UTC.',
          remaining: 0,
          resetAt: 'midnight UTC',
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Parse request body
      const body = await request.json();
      const { deckName, modelName, fieldNames, filledFields, emptyFields } = body;

      if (!emptyFields || emptyFields.length === 0) {
        return new Response(JSON.stringify({
          error: 'No empty fields to fill',
          remaining: DAILY_LIMIT - currentCount,
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Build prompt for Gemma
      const prompt = buildPrompt(deckName, modelName, fieldNames, filledFields, emptyFields);

      // Call Gemma API
      const aiResponse = await callGemmaAPI(env.GEMMA_API_KEY, prompt);

      if (aiResponse.error) {
        return new Response(JSON.stringify({
          error: 'AI generation failed',
          message: aiResponse.error,
          remaining: DAILY_LIMIT - currentCount,
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Increment rate limit (expires in 24 hours)
      await env.RATE_LIMIT.put(rateLimitKey, String(currentCount + 1), {
        expirationTtl: 86400, // 24 hours in seconds
      });

      return new Response(JSON.stringify({
        fields: aiResponse.fields,
        remaining: DAILY_LIMIT - currentCount - 1,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

/**
 * Build the prompt for Gemma API
 */
function buildPrompt(deckName, modelName, fieldNames, filledFields, emptyFields) {
  const isCloze = modelName?.toLowerCase().includes('cloze');
  
  let filledContent = '';
  if (filledFields && Object.keys(filledFields).length > 0) {
    filledContent = Object.entries(filledFields)
      .map(([key, value]) => `- ${key}: ${stripHtml(value)}`)
      .join('\n');
  } else {
    filledContent = '(No existing content)';
  }

  const prompt = `You are an expert at creating Anki flashcards. Generate content for the empty fields of a flashcard.

CONTEXT:
- Deck: "${deckName || 'General'}"
- Card Type: "${modelName || 'Basic'}"
- All Fields: ${fieldNames?.join(', ') || 'Front, Back'}

EXISTING CONTENT:
${filledContent}

EMPTY FIELDS TO FILL: ${emptyFields.join(', ')}

RULES:
1. Keep responses concise and suitable for flashcards (1-3 sentences max per field)
2. ${isCloze ? 'This is a Cloze card - use {{c1::text}} format for key terms to hide' : 'Create clear question/answer content'}
3. Match the language and topic of existing content
4. If the deck name suggests a topic (e.g., "Spanish Vocab", "Medical Terms"), generate relevant content
5. For vocabulary cards, include pronunciation or context if applicable

Respond ONLY with a valid JSON object mapping field names to generated content.
Example: {"Back": "Generated answer content", "Notes": "Additional context"}

Generate content for: ${emptyFields.join(', ')}`;

  return prompt;
}

/**
 * Call Gemma API
 */
async function callGemmaAPI(apiKey, prompt) {
  try {
    const response = await fetch(`${GEMMA_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemma API error:', errorText);
      return { error: `API error: ${response.status}` };
    }

    const data = await response.json();
    
    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      return { error: 'No content generated' };
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonText = generatedText.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    try {
      const fields = JSON.parse(jsonText);
      return { fields };
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Text:', jsonText);
      return { error: 'Failed to parse AI response' };
    }

  } catch (error) {
    console.error('Gemma API call failed:', error);
    return { error: error.message };
  }
}

/**
 * Strip HTML tags from content for cleaner prompt context
 */
function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '').trim() || '';
}
