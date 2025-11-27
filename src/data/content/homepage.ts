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
  problem: {
    valueProposition: string;
  };
}

export const homepageContent: HomepageContent = {
  hero: {
    title: 'Intelligence,',
    titleHighlight: 'Engineered.',
    subtitle: 'Analytics consultancy for high-growth startups and scale-ups that need confident, compliant decisions—without the overhead.',
    subtitleHighlight: ['confident, compliant decisions'],
    primaryCta: {
      text: 'Book a discovery call',
      href: '/contact/',
    },
    scrollIndicator: 'Scroll More',
  },
  problem: {
    valueProposition: 'Most companies collect data. Few convert it into decisions.\n\nAUXO bridges the gap — connecting business understanding with data intelligence.\n\nBig-firm clarity. Startup agility. Compliant by Design.',
  },
  finalCta: {
    title: 'Find your next step',
    subtitle: 'Book a 30-minute discovery call.',
    ctaText: 'Book a discovery call',
    ctaHref: '/contact/',
    body: "Share your goals, current challenges, and timelines. You'll leave with a concise view of where analytics can create the most impact and what to do first—before you commit to anything.",
    bodyHighlight: ['most impact', 'what to do first'],
    reassuranceLine: 'No sales pitch—just a structured discussion and clear next steps.',
  },
  methodology: {
    title: 'AUXO',
    titleHighlight: 'Edge',
    subtitle: 'A practical four-step model',
    steps: [
      {
        number: 1,
        icon: 'mdi:database-search',
        title: 'Explore',
        description: 'Explore the problem space, the decisions that matter most, and the realities of your data.',
        descriptionHighlight: ['decisions that matter most'],
        output: 'Discovery\nDocument',
      },
      {
        number: 2,
        icon: 'mdi:palette',
        title: 'Design',
        description: 'Design the analytics strategy, architecture, and end‑user experience to support those decisions.',
        descriptionHighlight: ['analytics strategy'],
        output: 'Technical\nSpecification',
      },
      {
        number: 3,
        icon: 'mdi:rocket-launch',
        title: 'Generate',
        description: 'Generate the solutions—pipelines, models, dashboards, and automations—that run in your real environment.',
        descriptionHighlight: ['pipelines, models, dashboards'],
        output: 'Production\nCodebase',
      },
      {
        number: 4,
        icon: 'mdi:account-group-outline',
        title: 'Embed',
        description: 'Embed these capabilities through training, governance, and change management so they become part of everyday work.',
        descriptionHighlight: ['training, governance'],
        output: 'Training &\nHandoff',
      },
    ],
    navigationButton: {
      text: 'Learn about our approach',
      href: '/about/',
    },
  },
  capabilities: {
    title: 'Six Core Capabilities',
    subheading: 'Six disciplines powering every project.',
    cards: [
      {
        icon: 'mdi:compass-outline',
        title: 'Strategy Blueprint',
        description: 'Identifying where analytics creates value and building actionable roadmaps.',
        descriptionHighlight: ['creates value'],
        metric: '3x faster\ntime‑to‑insights',
      },
      {
        icon: 'mdi:server-network',
        title: 'Data Foundations',
        description: 'Designing and implementing cloud data platforms, models, and pipelines.',
        descriptionHighlight: ['Designing and implementing'],
        metric: '50% leaner\ndata processing costs',
      },
      {
        icon: 'mdi:view-dashboard-variant',
        title: 'Insight Hub',
        description: 'Unifying metrics and dashboards into governed, self-serve BI layers.',
        descriptionHighlight: ['Unifying'],
        metric: '5x decision velocity\ncompany‑wide',
      },
      {
        icon: 'mdi:atom',
        title: 'Pattern Lab',
        description: 'Building, deploying, and monitoring data science and ML solutions.',
        descriptionHighlight: ['Building, deploying'],
        metric: '30% elevated\nmodel precision',
      },
      {
        icon: 'mdi:chart-timeline-variant',
        title: 'Growth Signals',
        description: 'Transforming customer, product, and revenue data into growth insights.',
        descriptionHighlight: ['Transforming'],
        metric: '25% faster\nrevenue growth',
      },
      {
        icon: 'mdi:shield-check-outline',
        title: 'Trust Frameworks',
        description: 'Establishing policies and controls for reliable, secure, compliant data.',
        descriptionHighlight: ['Establishing'],
        metric: '80% faster\ncompliance cycles',
      },
    ],
  },
  servicesIntro: {
    title: 'Three Common Starting Points',
    subheading: 'Where most teams begin their analytics journey.',
    items: [
      {
        number: '01',
        icon: 'mdi:layers',
        title: 'Foundation Readiness',
        description: 'Assess and prepare your data infrastructure',
        descriptionHighlight: ['Assess and prepare'],
        link: '/services/#foundation',
      },
      {
        number: '02',
        icon: 'mdi:chart-box',
        title: 'Reporting Reset',
        description: 'Modernize your reporting capabilities',
        descriptionHighlight: ['reporting capabilities'],
        link: '/services/#reporting',
      },
      {
        number: '03',
        icon: 'mdi:chart-line',
        title: 'Performance Diagnostics',
        description: 'Identify and optimize performance bottlenecks',
        descriptionHighlight: ['optimize'],
        link: '/services/#diagnostics',
      },
    ],
    navigationButton: {
      text: 'View all Services',
      href: '/services/',
    },
  },
};

