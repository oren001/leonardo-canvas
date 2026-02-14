// Real Leonardo API integration
const LEONARDO_API_BASE = '/api/leonardo';
const API_KEY = import.meta.env.VITE_LEONARDO_API_KEY;

// Check if Leonardo API is configured
export const isLeonardoConfigured = () => {
    return API_KEY && API_KEY !== 'your_leonardo_api_key_here';
};

// Generate image with Leonardo API
export const generateImage = async (prompt, modelId = 'b24e16ff-06e3-43eb-8d33-4416c2d75876', count = 1) => {
    if (!isLeonardoConfigured()) {
        throw new Error('Leonardo API key not configured');
    }

    try {
        // Step 1: Create generation
        const generateResponse = await fetch(`${LEONARDO_API_BASE}/generations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                modelId: modelId,
                num_images: count,
                width: 1024,
                height: 1024,
                guidance_scale: 7,
                num_inference_steps: 30
            })
        });

        if (!generateResponse.ok) {
            const error = await generateResponse.json();
            throw new Error(`Leonardo API error: ${error.error || generateResponse.statusText}`);
        }

        const generateData = await generateResponse.json();
        const generationId = generateData.sdGenerationJob.generationId;

        // Step 2: Poll for completion
        let images = [];
        let attempts = 0;
        const maxAttempts = 60; // 60 seconds max wait

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

            const statusResponse = await fetch(`${LEONARDO_API_BASE}/generations/${generationId}`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                }
            });

            if (!statusResponse.ok) {
                throw new Error('Failed to check generation status');
            }

            const statusData = await statusResponse.json();
            const generation = statusData.generations_by_pk;

            if (generation.status === 'COMPLETE') {
                images = generation.generated_images.map((img, idx) => ({
                    id: img.id,
                    url: img.url,
                    model: modelId,
                    prompt: prompt,
                    timestamp: Date.now()
                }));
                break;
            } else if (generation.status === 'FAILED') {
                throw new Error('Generation failed');
            }

            attempts++;
        }

        if (images.length === 0) {
            throw new Error('Generation timed out');
        }

        return {
            success: true,
            images,
            tokensUsed: 12 // Phoenix cost
        };
    } catch (error) {
        console.error('Leonardo API error:', error);
        throw error;
    }
};

// Get Phoenix model ID
export const getPhoenixModelId = () => {
    return 'b24e16ff-06e3-43eb-8d33-4416c2d75876'; // Phoenix model ID
};

// Model ID mapping
export const MODEL_IDS = {
    'phoenix-nano': 'b24e16ff-06e3-43eb-8d33-4416c2d75876', // Using Phoenix for now
    'phoenix': 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
    'kino-xl': '6b645e3a-d64f-4341-a6d8-7a3690fbf042' // Kino XL
};

// Generate with specific model
export const generateWithModel = async (prompt, modelName, count = 1) => {
    const modelId = MODEL_IDS[modelName] || MODEL_IDS['phoenix'];
    return generateImage(prompt, modelId, count);
};

// --- Inpainting / Canvas Support ---

// Upload image to Leonardo (for init image or mask)
export const uploadImage = async (file) => {
    if (!isLeonardoConfigured()) throw new Error('Leonardo API key not configured');

    try {
        // 1. Get presigned URL
        const extension = file.name.split('.').pop();
        const initResponse = await fetch(`${LEONARDO_API_BASE}/init-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ extension })
        });

        if (!initResponse.ok) throw new Error('Failed to get upload URL');
        const initData = await initResponse.json();

        let uploadUrl = initData.uploadInitImage.url;
        const imageId = initData.uploadInitImage.id;
        const fields = JSON.parse(initData.uploadInitImage.fields);

        // Rewrite URL to use proxy if it matches the known S3 bucket to avoid CORS
        const s3Bucket = 'image-flex-213441772509-prod-images.s3-accelerate.amazonaws.com';
        if (uploadUrl.includes(s3Bucket)) {
            uploadUrl = uploadUrl.replace(`https://${s3Bucket}`, '/api/s3-upload');
        } else {
            console.warn('Unknown S3 bucket, CORS might fail:', uploadUrl);
        }

        // 2. Upload to S3
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formData.append('file', file);

        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });

        if (!uploadResponse.ok && uploadResponse.status !== 204) {
            throw new Error('Failed to upload image to S3');
        }

        return imageId;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

// Generate Inpainting
export const generateInpainting = async (prompt, initImageId, maskImageId) => {
    if (!isLeonardoConfigured()) throw new Error('Leonardo API key not configured');

    try {
        // Use Phoenix for inpainting if supported, or SDXL
        // For inpainting, we use the standard generations endpoint but with extra params
        const response = await fetch(`${LEONARDO_API_BASE}/generations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                modelId: MODEL_IDS['phoenix'], // Try Phoenix first
                init_image_id: initImageId,
                mask_image_id: maskImageId,
                num_images: 1,
                width: 1024,
                height: 1024,
                guidance_scale: 7,
                num_inference_steps: 30,
                // Leonardo specific: strength of init image (0.1 = lots of change, 0.9 = little change)
                init_strength: 0.5,
                // Using 'start_image_strength' might be better for some models?
                // For inpainting, allow_safety_checker might be needed
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Inpainting error: ${error.error || response.statusText}`);
        }

        const data = await response.json();
        const generationId = data.sdGenerationJob.generationId;

        return waitForGeneration(generationId, prompt, 'inpainting');
    } catch (error) {
        console.error('Inpainting error:', error);
        throw error;
    }
};

// Helper to poll for generation (refactored from generateImage to be reusable)
const waitForGeneration = async (generationId, prompt, modelName) => {
    let images = [];
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const statusResponse = await fetch(`${LEONARDO_API_BASE}/generations/${generationId}`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        if (!statusResponse.ok) throw new Error('Failed to check status');

        const statusData = await statusResponse.json();
        const generation = statusData.generations_by_pk;

        if (generation.status === 'COMPLETE') {
            images = generation.generated_images.map((img) => ({
                id: img.id,
                url: img.url,
                model: modelName,
                prompt: prompt,
                timestamp: Date.now()
            }));
            break;
        } else if (generation.status === 'FAILED') {
            throw new Error('Generation failed');
        }
        attempts++;
    }

    if (images.length === 0) throw new Error('Timeout');

    return {
        success: true,
        images,
        tokensUsed: 4 // Estimate
    };
};

export const urlToBlob = async (url) => {
    const response = await fetch(url);
    return await response.blob();
};
