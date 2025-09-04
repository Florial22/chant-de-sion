import React from "react";

export default class TinyBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return null; // skip just this item
    return this.props.children;
  }
}
