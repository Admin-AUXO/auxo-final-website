export interface ProcessStep {
  number: number;
  icon: string;
  title: string;
  description: string;
  descriptionHighlight?: string | string[];
  output?: string;
}

export interface CapabilityCard {
  icon: string;
  title: string;
  description: string;
  descriptionHighlight?: string | string[];
  metric: string;
}

export interface ServiceIntroItem {
  number: string;
  icon: string;
  title: string;
  description: string;
  descriptionHighlight?: string | string[];
  link?: string;
}

export interface TechStackItem {
  name: string;
  icon: string;
}

export interface HomepageContent {
  hero: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    subtitleHighlight?: string | string[];
    primaryCta: {
      text: string;
      href: string;
    };
    scrollIndicator: string;
  };
  finalCta: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
    body: string;
    bodyHighlight?: string | string[];
    reassuranceLine: string;
  };
  methodology: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    steps: ProcessStep[];
    navigationButton?: {
      text: string;
      href: string;
    };
  };
  capabilities: {
    title: string;
    subheading: string;
    cards: CapabilityCard[];
  };
  servicesIntro: {
    title: string;
    subheading: string;
    items: ServiceIntroItem[];
    navigationButton: {
      text: string;
      href: string;
    };
  };
  techStack: {
    title: string;
    subtitle: string;
    items: TechStackItem[];
  };
  problem: {
    line1: string;
    line2: string;
  };
}
