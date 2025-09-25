// Global type declarations

declare global {
  interface Window {
    JSZip?: {
      new (): JSZipInstance;
    };
  }

  interface JSZipInstance {
    folder(name: string): JSZipFolder | null;
    generateAsync(options: { type: 'blob' }): Promise<Blob>;
  }

  interface JSZipFolder {
    file(name: string, data: string | Blob): void;
  }
}

export {};