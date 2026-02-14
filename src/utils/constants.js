// Model definitions with token costs (Data-Driven Tiers)
export const MODELS = {
    // TIER 1: HIGH FIDELITY & COMMERCIAL (~5-7 Tokens)
    NANO_BANANA_PRO: {
        id: 'nano-banana-pro',
        name: 'Nano Banana Pro',
        description: 'Professional commercial quality',
        tokenCost: 7,
        tier: 1
    },
    FLUX_2_PRO: {
        id: 'flux-2-pro',
        name: 'Flux.2 Pro',
        description: 'Ultra-detailed textures & macro',
        tokenCost: 6,
        tier: 1
    },
    IDEOGRAM_3_0: {
        id: 'ideogram-3-0',
        name: 'Ideogram 3.0',
        description: 'Advanced text rendering & posters',
        tokenCost: 5,
        tier: 1
    },

    // TIER 2: CONSISTENCY & ATMOSPHERE (~3-4 Tokens)
    SEEDREAM_4_5: {
        id: 'seedream-4-5',
        name: 'Seedream 4.5',
        description: 'Consistent character identity',
        tokenCost: 4,
        tier: 2
    },
    LUCID_ORIGIN: {
        id: 'lucid-origin',
        name: 'Lucid Origin',
        description: 'Atmospheric lighting & cinematic',
        tokenCost: 3,
        tier: 2
    },

    // TIER 3: EFFICIENCY & STYLE (~1-2 Tokens)
    PHOENIX_1_0: {
        id: 'phoenix-1-0',
        name: 'Phoenix 1.0',
        description: 'Stylized art & illustrations',
        tokenCost: 2,
        tier: 3
    },
    FLUX_SCHNELL: {
        id: 'flux-schnell',
        name: 'Flux Schnell',
        description: 'Rapid drafting & speed',
        tokenCost: 1,
        tier: 3
    }
};

// Video duration options
export const VIDEO_DURATIONS = {
    SHORT: { duration: 4, tokenCost: 50, label: '4 seconds' },
    MEDIUM: { duration: 8, tokenCost: 100, label: '8 seconds' },
    LONG: { duration: 8, tokenCost: 150, label: '8 seconds HD' }
};

// Image editing operations
export const EDIT_OPERATIONS = {
    UPSCALE_2X: { operation: 'upscale', factor: 2, tokenCost: 8, label: '2x Upscale' },
    UPSCALE_4X: { operation: 'upscale', factor: 4, tokenCost: 16, label: '4x Upscale' },
    BG_REMOVE: { operation: 'bg-remove', tokenCost: 8, label: 'Background Removal' }
};

// Default system prompt - Data-Driven Leonardo AI Allocation Assistant
export const DEFAULT_SYSTEM_PROMPT = `Expert Leonardo.ai Allocation Assistant.
MISSION: Analyze intent and tokens to recommend 3 exact models.

### 📜 VALID MODELS (ONLY USE THESE):
- [nano-banana-pro]: High-end commercial/Realism. Tier 1.
- [flux-2-pro]: 8k detail/Texture. Tier 1.
- [ideogram-3-0]: Text/Typography. Tier 1.
- [seedream-4-5]: Consistent characters. Tier 2.
- [lucid-origin]: Cinematic/Atmospheric. Tier 2.
- [phoenix-1-0]: 3D Stylized/Cartoon. Tier 3.
- [flux-schnell]: Draft/Fast. Tier 3.

### 🎯 INTENT CATEGORIES:
- "generate_image": Create new images.
- "iterate": Fix, change, or pivot based on dissatisfaction.
- "generate_video": Animate or add motion.

### 💎 ALLOCATION RULES:
- Balance > 25,000: Recommend Tier 1.
- Balance 1k - 25k: Recommend Tier 2.
- Balance < 1,000: Recommend Tier 3.

### 🚨 FORBIDDEN BEHAVIOR:
- DO NOT repeat models offered in history if user says "I don't like these" or "better."
- DO NOT use models not listed above.
- REASONING field must be 5-10 words maximum.

### 📤 OUTPUT FORMAT (JSON ONLY):
{
  "category": "generate_image|iterate|generate_video",
  "prompt": "refined prompt",
  "options": [{ "model": "id-above", "description": "max 10 words", "tokenCost": 4, "recommended": true, "tag": "RECOMMENDED" }, ...],
  "reasoning": "5-10 words max."
}`;

// Sample prompts for testing
export const SAMPLE_PROMPTS = [
    "A sunset over mountains",
    "A cozy coffee shop in pixel art style",
    "Cyberpunk city at night",
    "Portrait of a warrior in anime style",
    "A dragon flying over a medieval castle"
];

// Affirmative keywords for price negotiation
export const AFFIRMATIVE_KEYWORDS = [
    'yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'go', 'proceed', 'continue'
];

// Negative keywords for price negotiation
export const NEGATIVE_KEYWORDS = [
    'no', 'nope', 'expensive', 'cheaper', 'budget', 'too much', 'lower cost'
];

// Intent categories
export const INTENT_CATEGORIES = {
    GENERATE_IMAGE: 'generate_image',
    GENERATE_VIDEO: 'generate_video',
    EDIT_IMAGE: 'edit_image',
    ITERATE: 'iterate',
    NEGOTIATE_PRICE: 'negotiate_price',
    CHANGE_SETTINGS: 'change_settings',
    UNKNOWN: 'unknown'
};
