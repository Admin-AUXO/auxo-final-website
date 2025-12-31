import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from './client';
import type { SanityImageSource } from '@sanity/image-url';

const builder = imageUrlBuilder(sanityClient!);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export function getOptimizedImageUrl(
  source: SanityImageSource,
  width: number,
  height?: number,
  quality: number = 80
): string {
  let url = urlFor(source).width(width).quality(quality).auto('format');
  
  if (height) {
    url = url.height(height);
  }
  
  return url.url();
}

export function getResponsiveImage(
  source: SanityImageSource,
  widths: number[] = [640, 768, 1024, 1280],
  aspectRatio?: number
) {
  const baseUrl = urlFor(source);
  const quality = 80;
  
  const buildSrcset = (format: 'webp' | 'auto') =>
    widths
      .map((width) => {
        let url = baseUrl.width(width).quality(quality);
        if (format === 'webp') {
          url = url.format('webp');
        } else {
          url = url.auto('format');
        }
        if (aspectRatio) {
          url = url.height(Math.round(width / aspectRatio));
        }
        return `${url.url()} ${width}w`;
      })
      .join(', ');

  return {
    src: baseUrl.width(widths[widths.length - 1]).quality(quality).url(),
    srcset: buildSrcset('auto'),
    srcsetWebP: buildSrcset('webp'),
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1280px',
  };
}