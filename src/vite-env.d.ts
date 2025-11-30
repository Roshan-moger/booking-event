/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" /> 

// env.d.ts
interface ImportMetaEnv {
  readonly REACT_APP_API_BASEURL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
