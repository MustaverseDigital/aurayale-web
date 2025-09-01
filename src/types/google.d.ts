declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: any) => void;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            options: {
              type?: string;
              shape?: string;
              theme?: string;
              text?: string;
              size?: string;
              logo_alignment?: string;
            }
          ) => void;
        };
      };
    };
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, handler: (...args: any[]) => void) => void;
      removeListener: (
        eventName: string,
        handler: (...args: any[]) => void
      ) => void;
      isMetaMask?: boolean;
    };
    visualViewport?: {
      height: number;
      width: number;
      scale: number;
      offsetTop: number;
      offsetLeft: number;
      addEventListener: (event: string, handler: () => void) => void;
      removeEventListener: (event: string, handler: () => void) => void;
    };
  }
}

export {};
