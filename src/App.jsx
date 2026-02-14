import { Component } from 'react'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { AIImageShapeUtil } from './shapes/AIImageShape'
import { DreamTool } from './tools/DreamTool'

const customShapeUtils = [AIImageShapeUtil]
const customTools = [DreamTool]

const overrides = {
  tools(editor, tools) {
    tools.dream = {
      id: 'dream',
      icon: 'geo-rectangle',
      label: 'Dream',
      kbd: 'd',
      onSelect: () => {
        editor.setCurrentTool('dream')
      },
    }
    return tools
  },
  uiOverrides: {
    tools(editor, tools) {
      tools.dream = {
        id: 'dream',
        icon: 'geo-rectangle',
        label: 'Dream',
        kbd: 'd',
        onSelect: () => {
          editor.setCurrentTool('dream')
        },
      }
      return tools
    },
    toolbar(editor, toolbar, { tools }) {
      toolbar.push(tools.dream)
      return toolbar
    },
  },
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', fontFamily: 'monospace' }}>
          <h2>Something went wrong.</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <div style={{ position: 'fixed', inset: 0 }}>
        <Tldraw
          persistenceKey="cobalt-canvas-local-v2"
          shapeUtils={customShapeUtils}
          tools={customTools}
          overrides={overrides}
          licenseKey={import.meta.env.VITE_TLDRAW_LICENSE_KEY}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App
