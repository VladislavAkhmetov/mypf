import "react";

declare module "react" {
  interface CSSProperties {
    cornerShape?: string;
    WebkitMaskImage?: string;
  }
}

interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
}

interface Document {
  startViewTransition?: (update: () => void) => ViewTransition;
}
