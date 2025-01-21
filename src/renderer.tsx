import './styles/globals.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import CommandPalette from './components/CommandPalette';

console.log('Renderer starting...');
console.log('React version:', React.version);

// Add error boundary
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('React Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{color: 'white', padding: 20}}>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

const container = document.getElementById('root');
console.log('Root container found:', !!container);
console.log('Container contents:', container?.innerHTML);

if (container) {
  console.log('Creating React root...');
  const root = createRoot(container);
  console.log('Rendering CommandPalette...');
  root.render(
    <ErrorBoundary>
      <React.StrictMode>
        <CommandPalette />
      </React.StrictMode>
    </ErrorBoundary>
  );
  console.log('Render complete!');
} else {
  console.error('Root element not found! Check index.html');
}