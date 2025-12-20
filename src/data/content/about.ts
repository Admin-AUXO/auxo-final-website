export interface AboutContent {
  hero: {
    headline: string;
    description: string;
    ctaText: string;
    ctaHref: string;
  };
  mission: {
    title: string;
    mission: string;
    missionHighlight?: string | string[];
    vision: string;
    visionHighlight?: string | string[];
  };
  purpose: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    nameOrigin: {
      title: string;
      description: string;
      descriptionHighlight?: string | string[];
    };
  };
  approach: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    principles: {
      letter: string;
      title: string;
      description: string;
      descriptionHighlight?: string | string[];
    }[];
  };
  team: {
    title: string;
    description: string;
    leadership: {
      name: string;
      role: string;
      bio: string;
    }[];
    advisors: {
      name: string;
      role: string;
      bio: string;
    }[];
  };
  partnership: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
  };
  global: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
  };
  cta: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    ctaText: string;
    ctaHref: string;
  };
}
