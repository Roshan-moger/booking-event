/// <reference types="vite/client" />
// env.d.ts
interface ImportMetaEnv {
  readonly REACT_APP_API_BASEURL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
