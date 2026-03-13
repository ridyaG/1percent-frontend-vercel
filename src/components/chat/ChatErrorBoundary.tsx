import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
};

export default class ChatErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Chat route crashed:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div
            className="rounded-2xl border px-5 py-4"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          >
            <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
              Chat crashed while rendering
            </div>
            <div className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {this.state.error.message}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
