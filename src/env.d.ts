/// <reference types="astro/client" />

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module 'astro:assets' {
  interface ImageMetadata {
    src: string;
    width: number;
    height: number;
    format: string;
  }

  interface ImageSrcSet {
    width: number;
    size: string;
  }

  interface ImageMedia {
    minWidth: number;
    width: number;
  }

  export interface LocalImageProps {
    src: string | ImageMetadata;
    srcset?: ImageSrcSet[];
    type?: string;
    media?: ImageMedia[];
    alt: string;
    width?: string;
    height?: string;
    loading?: 'lazy' | 'eager';
    decoding?: 'async' | 'sync' | 'auto';
    fetchpriority?: 'high' | 'low' | 'auto';
    onload?: string;
    onerror?: string;
    class?: string;
  }

  export const Image: (_props: LocalImageProps) => any;
}

declare module 'astro:transitions' {
  export const ClientRouter: any;
}