import { GoogleGenerativeAI } from '@google/generative-ai';
import { DEFAULT_SYSTEM_PROMPT, INTENT_CATEGORIES } from '../utils/constants.js';
import { extractContext } from '../utils/helpers.js';

// Initialize Gemini
const getApiKey = () => {
    const rawKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!rawKey) return null;
    // Trim any accidental whitespace or quotes
    return rawKey.replace(/['"]/g, '').trim();
};

const API_KEY = getApiKey();
let genAI = null;

if (API_KEY && API_KEY !== 'your_api_key_here' && API_KEY.startsWith('AIza')) {
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        console.log('Gemini AI initialized successfully');
    } catch (e) {
        console.error('Failed to initialize Gemini AI:', e);
    }
} else {
    console.warn('Gemini AI Key missing or invalid format. Status:', API_KEY ? 'Present (Invalid)' : 'Missing');
}

// Analyze user intent and generate options
export const analyzeIntent = async (userMessage, conversationHistory = [], systemPrompt = DEFAULT_SYSTEM_PROMPT, userBalance = 1000) => {
    // Fallback for when API key is not configured
    if (!genAI) {
        return generateFallbackIntent(userMessage, userBalance);
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const context = extractContext(conversationHistory, 10);
        const contextString = context.map(msg => `${msg.role}: ${msg.content}`).join('\n');

        const prompt = `${systemPrompt}

### CURRENT SESSION DATA:
- User's token balance: ${userBalance}
- Previous context:
${contextString}

- User's request: "${userMessage}"

### FINAL MANDATORY INSTRUCTIONS:
1. Respond with a raw JSON object ONLY.
2. The "reasoning" field MUST be between 5-10 words. 
3. DIVERSITY RULE: Check "OFFERED OPTIONS" in history. If the user expresses dissatisfaction (e.g., "I don't like these," "better option"), you MUST NOT repeat any of those models.
4. CATEGORY: You MUST use one of these: [generate_image, iterate, generate_video, edit_image].
5. RANK exactly 3 options.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            let intent = JSON.parse(jsonMatch[0]);

            // Normalize Category (Protect against AI capitalization or typos)
            const validCategories = Object.values(INTENT_CATEGORIES);
            if (!validCategories.includes(intent.category)) {
                if (intent.options && Array.isArray(intent.options) && intent.options.length > 0) {
                    intent.category = INTENT_CATEGORIES.GENERATE_IMAGE;
                } else {
                    intent.category = INTENT_CATEGORIES.UNKNOWN;
                }
            }

            // Ensure prompt exists
            if (!intent.prompt) intent.prompt = userMessage;

            return intent;
        }

        return generateFallbackIntent(userMessage, userBalance);
    } catch (error) {
        console.error('Gemini API error:', error);
        return generateFallbackIntent(userMessage, userBalance);
    }
};

// Fallback intent generation when API is unavailable
const generateFallbackIntent = (userMessage, userBalance) => {
    const lowerMessage = userMessage.toLowerCase();

    // Detect intent category
    let category = INTENT_CATEGORIES.GENERATE_IMAGE;
    if (lowerMessage.includes('video')) {
        category = INTENT_CATEGORIES.GENERATE_VIDEO;
    } else if (lowerMessage.includes('upscale') || lowerMessage.includes('background')) {
        category = INTENT_CATEGORIES.EDIT_IMAGE;
    } else if (lowerMessage.includes('expensive') || lowerMessage.includes('cheaper')) {
        category = INTENT_CATEGORIES.NEGOTIATE_PRICE;
    }

    // Detect quality preference
    let quality = 'balanced';
    if (lowerMessage.includes('quick') || lowerMessage.includes('draft') || lowerMessage.includes('fast')) {
        quality = 'draft';
    } else if (lowerMessage.includes('quality') || lowerMessage.includes('premium') || lowerMessage.includes('best')) {
        quality = 'premium';
    }

    // Generate options based on quality (Data-Driven Fallback)
    let options = [];
    if (quality === 'premium' || userBalance > 25000) {
        options = [
            { model: 'flux-2-pro', description: 'Ultra-detailed texture matches your high standards', tokenCost: 6, recommended: false, tag: 'SAVER' },
            { model: 'nano-banana-pro', description: 'Maximum commercial fidelity and geometry', tokenCost: 7, recommended: true, tag: 'RECOMMENDED' },
            { model: 'ideogram-3-0', description: 'Specialized for complex layouts and text', tokenCost: 5, recommended: false, tag: 'SAVER' }
        ];
    } else if (quality === 'draft' || userBalance < 150) {
        options = [
            { model: 'flux-schnell', description: 'Fastest generation for quick storyboarding', tokenCost: 1, recommended: false, tag: 'SAVER' },
            { model: 'phoenix-1-0', description: 'Stylized Pixar look for minimal cost', tokenCost: 2, recommended: true, tag: 'RECOMMENDED' },
            { model: 'nano-banana-pro', description: 'Commercial quality (expensive for this balance)', tokenCost: 7, recommended: false, tag: 'SPLURGE' }
        ];
    } else {
        options = [
            { model: 'phoenix-1-0', description: 'Great for stylized conceptual drafts', tokenCost: 2, recommended: false, tag: 'SAVER' },
            { model: 'seedream-4-5', description: 'Balanced character consistency and style', tokenCost: 4, recommended: true, tag: 'RECOMMENDED' },
            { model: 'nano-banana-pro', description: 'Professional product quality', tokenCost: 7, recommended: false, tag: 'SPLURGE' }
        ];
    }

    return {
        category,
        prompt: userMessage,
        style: '',
        quality,
        options,
        reasoning: 'Using fallback intent detection (Gemini API not configured)'
    };
};

// Check if Gemini is configured
export const isGeminiConfigured = () => {
    return genAI !== null;
};
