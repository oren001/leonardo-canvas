import { useEffect, useState } from 'react'
import { uniqueId } from 'tldraw'

// Placeholder for Firebase integration
// We will replace this with actual Firebase logic once we have the config

export function useMultiplayer(editor) {
    const [roomId, setRoomId] = useState('default-room')
    const [user] = useState(() => ({
        id: uniqueId(),
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        name: 'Dreamer ' + Math.floor(Math.random() * 100)
    }))

    useEffect(() => {
        if (!editor) return

        // TODO: Connect to Firebase
        console.log('Connecting to room:', roomId, 'as user:', user)

        // Mock cursor sync for now (local echo)
        const cleanup = editor.store.listen((entry) => {
            // changes in the store
        })

        return () => {
            cleanup()
        }
    }, [editor, roomId, user])

    return {
        user,
        roomId
    }
}
