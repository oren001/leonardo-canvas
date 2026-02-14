// Format token count with commas
export const formatTokens = (tokens) => {
    return tokens.toLocaleString();
};

// Extract file from various input methods
export const handleFileUpload = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Extract context from conversation history
export const extractContext = (messages, limit = 10) => {
    return messages
        .slice(-limit)
        .map(msg => {
            let contentString = '';
            if (typeof msg.content === 'string') {
                contentString = msg.content;
            } else if (msg.content?.type === 'options') {
                const optionsList = msg.content.options.map(o => o.model).join(', ');
                contentString = `OFFERED_MODELS_LIST: [${optionsList}]. AI_REASONING: ${msg.content.reasoning || 'N/A'}`;
            } else if (msg.content?.type === 'text') {
                contentString = msg.content.text;
            } else if (msg.content?.type === 'image') {
                contentString = `EVENT: IMAGE_GENERATED. PROMPT: ${msg.content.images?.[0]?.prompt || 'User choice'}`;
            } else if (msg.content?.type === 'video') {
                contentString = `EVENT: VIDEO_GENERATED. PROMPT: ${msg.content.video?.prompt || 'User choice'}`;
            }

            return {
                role: msg.role,
                content: contentString
            };
        });
};

// Check if user is negotiating price
export const isNegotiatingPrice = (text) => {
    const lowerText = text.toLowerCase();
    return lowerText.includes('expensive') ||
        lowerText.includes('cheaper') ||
        lowerText.includes('budget') ||
        lowerText.includes('too much') ||
        lowerText.includes('lower cost');
};

// Check if user is affirming
export const isAffirmative = (text) => {
    const lowerText = text.toLowerCase().trim();
    const affirmatives = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'go', 'proceed', 'continue'];
    return affirmatives.some(word => lowerText === word || lowerText.startsWith(word + ' '));
};

// Generate option ID
export const generateOptionId = () => {
    return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Parse user selection (1, 2, 3)
export const parseSelection = (text) => {
    const match = text.match(/^[123]$/);
    return match ? parseInt(match[0]) : null;
};

// Truncate text with ellipsis
export const truncate = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

// Delay helper for simulating async operations
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get relative time string
export const getRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
};
