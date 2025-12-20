export interface SanityImageAsset {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

export interface SanityLink {
  text: string;
  href: string;
}

export interface SanityHighlight {
  descriptionHighlight?: string | string[];
}

export interface SanityCTA extends SanityHighlight {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
}
