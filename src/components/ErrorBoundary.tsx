import React from "react";

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 rounded-xl border bg-white">
          <h2 className="font-semibold mb-2">Une erreur est survenue</h2>
          <p className="text-sm text-black/70">
            La page des résultats a rencontré un problème. Réessayez de modifier votre recherche
            ou rafraîchissez la page.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
