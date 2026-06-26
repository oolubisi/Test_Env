declare module 'wouter' {
  import { FC, ReactElement, ReactNode } from 'react';

  interface RouteProps {
    path?: string;
    component?: FC<any>;
    children?: ReactNode | ((params: Record<string, string>) => ReactElement);
  }

  export const Route: FC<RouteProps>;
  export const Switch: FC<{ children: ReactNode }>;
  export const Router: FC<{ children: ReactNode; hook?: any }>;
  export const Link: FC<{ href: string; children: ReactNode; className?: string; title?: string }>;
  export function useParams<T = Record<string, string>>(): T;
  export function useLocation(): [string, (to: string) => void];
  export function useRoute(path: string): [boolean, Record<string, string>];
}

declare module 'wouter/use-hash-location' {
  export function useHashLocation(): [string, (to: string) => void];
}

declare module 'vite-plugin-pwa' {
  import { Plugin } from 'vite';
  interface VitePWAOptions {
    registerType?: string;
    manifest?: Record<string, any>;
    workbox?: Record<string, any>;
    [key: string]: any;
  }
  export function VitePWA(options?: VitePWAOptions): Plugin;
}

declare module 'pdf-lib' {
  interface PDFPage {
    getSize(): { width: number; height: number };
    setSize(width: number, height: number): void;
  }
  export class PDFDocument {
    static load(bytes: Uint8Array, options?: { updateMetadata?: boolean }): Promise<PDFDocument>;
    getPages(): PDFPage[];
    save(options?: { useObjectStreams?: boolean }): Promise<Uint8Array>;
  }
}
