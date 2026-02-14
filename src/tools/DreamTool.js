import { StateNode, createShapeId } from 'tldraw'

class IdleState extends StateNode {
    static id = 'idle'

    onPointerDown(info) {
        const { currentPagePoint } = this.editor.inputs

        // Create a new ai-image shape at the pointer location
        const id = `shape:ai-image-${Date.now()}`
        this.parent.shapeId = id

        this.editor.createShape({
            id,
            type: 'ai-image',
            x: currentPagePoint.x,
            y: currentPagePoint.y,
            props: {
                w: 1,
                h: 1,
                prompt: '',
                isLoading: false
            }
        })

        this.parent.transition('dragging')
    }
}

class DraggingState extends StateNode {
    static id = 'dragging'

    onPointerMove(info) {
        const { originPagePoint, currentPagePoint } = this.editor.inputs
        const shapeId = this.parent.shapeId

        if (!shapeId) return

        // Calculate basic bounds (origin to current)
        const w = Math.abs(currentPagePoint.x - originPagePoint.x)
        const h = Math.abs(currentPagePoint.y - originPagePoint.y)
        const x = Math.min(currentPagePoint.x, originPagePoint.x)
        const y = Math.min(currentPagePoint.y, originPagePoint.y)

        // Update the shape bounds
        this.editor.updateShape({
            id: shapeId,
            type: 'ai-image',
            x, y,
            props: { w, h }
        })
    }

    onPointerUp() {
        this.editor.setCurrentTool('select')

        // Select the shape we just made
        if (this.parent.shapeId) {
            this.editor.select(this.parent.shapeId)
        }

        this.parent.transition('idle')
    }
}

export class DreamTool extends StateNode {
    static id = 'dream'
    static initial = 'idle'
    static children = () => [IdleState, DraggingState]

    shapeId = null

    onCreate(info) {
        this.shapeId = null
    }
}
