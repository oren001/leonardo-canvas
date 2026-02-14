import { BaseBoxShapeUtil, HTMLContainer } from 'tldraw'
import { useState } from 'react'

export class AIImageShapeUtil extends BaseBoxShapeUtil {
    static type = 'ai-image'

    getDefaultProps() {
        return {
            w: 300,
            h: 300,
            imageUrl: '',
            prompt: '',
            model: '',
            seed: null,
            isLoading: false,
        }
    }

    component(shape) {
        const { w, h, imageUrl, prompt, isLoading } = shape.props
        const editor = this.editor
        const [localPrompt, setLocalPrompt] = useState(prompt || '')

        const handleGenerate = async () => {
            if (!localPrompt.trim()) return

            // Update shape to loading state
            editor.updateShape({
                id: shape.id,
                type: 'ai-image',
                props: { isLoading: true, prompt: localPrompt }
            })

            try {
                // Dynamic import to avoid circular dependencies or initialization issues
                const { generateWithModel } = await import('../services/leonardo')

                const result = await generateWithModel(localPrompt, 'phoenix', 1) // Default to phoenix for speed

                if (result.success && result.images.length > 0) {
                    editor.updateShape({
                        id: shape.id,
                        type: 'ai-image',
                        props: {
                            isLoading: false,
                            imageUrl: result.images[0].url
                        }
                    })
                }
            } catch (error) {
                console.error("Generation failed", error)
                editor.updateShape({
                    id: shape.id,
                    type: 'ai-image',
                    props: { isLoading: false }
                })
                // Could add error state here
            }
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault() // Prevent tldraw from handling enter
                e.stopPropagation()
                handleGenerate()
            }
        }

        // Prevent tldraw events when interacting with input
        const onPointerDown = (e) => e.stopPropagation()

        return (
            <HTMLContainer style={{ pointerEvents: 'all' }}>
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontFamily: 'sans-serif'
                    }}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={localPrompt}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                            draggable={false}
                        />
                    ) : (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#374151', width: '100%' }}>
                            {isLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Dreaming...</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                                    <span style={{ fontSize: '24px' }}>✨</span>
                                    <input
                                        type="text"
                                        placeholder="What do you want to see?"
                                        value={localPrompt}
                                        onChange={(e) => setLocalPrompt(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onPointerDown={onPointerDown}
                                        style={{
                                            width: '90%',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid #d1d5db',
                                            fontSize: '14px',
                                            outline: 'none',
                                            textAlign: 'center'
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleGenerate}
                                        onPointerDown={onPointerDown}
                                        style={{
                                            padding: '6px 16px',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Generate
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Metadata Overlay on Hover */}
                    {imageUrl && (
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '6px 8px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                            color: 'white',
                            fontSize: '11px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textAlign: 'center'
                        }}>
                            {localPrompt}
                        </div>
                    )}
                </div>
            </HTMLContainer>
        )
    }

    indicator(shape) {
        return <rect width={shape.props.w} height={shape.props.h} />
    }
}
