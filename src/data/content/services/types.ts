export interface ServiceDetail {
  slug: string;
  name: string;
  shortDescription: string;
  icon: string;
  hero: {
    title: string;
    subtitle: string;
    description: string;
    descriptionHighlight?: string | string[];
    keyBenefits: string[];
  };
  overview: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    challenges: string[];
    solutions: string[];
  };
  benefits: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    features: {
      title: string;
      description: string;
      icon: string;
    }[];
  };
  process: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    steps: {
      step: number;
      title: string;
      description: string;
      deliverables: string[];
    }[];
  };
  outcomes: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    metrics: {
      label: string;
      value: string;
      description: string;
    }[];
  };
  cta: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    ctaText: string;
    ctaHref: string;
  };
}

export interface ServicesContent {
  hero: {
    headline: string;
    headlineLine1: string;
    headlineLine2: string;
    description: string;
    descriptionHighlight?: string | string[];
    ctaText?: string;
    ctaHref?: string;
  };
  stages: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    services: {
      name: string;
      description: string;
      descriptionHighlight?: string | string[];
      link: string;
    }[];
    codeEdge: string;
    codeEdgeHighlight?: string | string[];
  };
  impact: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    industries: {
      name: string;
      description: string;
      descriptionHighlight?: string | string[];
      icon: string;
      useCases: string[];
      keyBenefit: string;
      keyBenefitHighlight?: string | string[];
    }[];
    goal: string;
    goalHighlight?: string | string[];
  };
  models: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    models: {
      name: string;
      subheadline: string;
      description: string;
      descriptionHighlight?: string | string[];
      bestFor: string;
      bestForHighlight?: string | string[];
      deliverables: string[];
      idealFor: string[];
    }[];
  };
  cta: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    ctaText: string;
    ctaHref: string;
  };
  details: ServiceDetail[];
}
