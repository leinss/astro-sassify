/// <reference types="astro/client" />

// Image module declarations (*.png/*.jpg → ImageMetadata) and the astro:assets
// module (Image, getImage, …) are provided correctly by `astro/client` above.
// A previous hand-written stub typed *.png as `string`, which contradicts reality: image
// imports are ImageMetadata objects at runtime, and re-declared astro:assets
// without getImage; both have been removed in favour of astro/client's types.

declare module 'astro:transitions' {
  export const ClientRouter: any;
}