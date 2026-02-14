# Cobalt Canvas Multiplayer

A real-time collaborative infinite canvas for AI-assisted creativity.

## Features
- **Infinite Canvas**: Powered by `tldraw`.
- **Multiplayer**: Live cursors and object sync via Firebase.
- **AI Integration**:
    - **Dream Box**: Draw a box, type a prompt, get an image (Leonardo.ai).
    - **Inpainting**: Spray paint directly on images to edit them.

## Setup
1. `npm install`
2. `npm run dev`

## Architecture
- `src/shapes/`: Custom canvas nodes (AIImageShape, etc.)
- `src/tools/`: Custom tools (DreamTool)
- `src/services/`: API integrations (Leonardo, Gemini, Firebase)
- `src/hooks/`: React hooks for multiplayer sync

## Tech Stack
- React + Vite
- tldraw
- Firebase Realtime Database
- TailwindCSS
