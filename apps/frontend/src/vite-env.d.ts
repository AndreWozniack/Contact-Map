/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '@fontsource/roboto/300.css';
declare module '@fontsource/roboto/400.css';
declare module '@fontsource/roboto/500.css';
declare module '@fontsource/roboto/700.css';