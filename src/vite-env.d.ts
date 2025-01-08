interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    VITE_API_KEY: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  