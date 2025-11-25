export interface ProcessStep {
  number: number;
  icon: string;
  title: string;
  description: string;
  output?: string;
}

export interface CapabilityCard {
  icon: string;
  title: string;
  description: string;
  metric: string;
}

export interface ServiceIntroItem {
  number: string;
  icon: string;
  title: string;
  description: string;
  link?: string;
}

export interface HomepageContent {
  hero: {
    title: string;
    titleHighlight: string;
    subtitle: string;
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
        output: 'Discovery\nDocument',
      },
      {
        number: 2,
        icon: 'mdi:palette',
        title: 'Design',
        description: 'Design the analytics strategy, architecture, and end‑user experience to support those decisions.',
        output: 'Technical\nSpecification',
      },
      {
        number: 3,
        icon: 'mdi:rocket-launch',
        title: 'Generate',
        description: 'Generate the solutions—pipelines, models, dashboards, and automations—that run in your real environment.',
        output: 'Production\nCodebase',
      },
      {
        number: 4,
        icon: 'mdi:account-group-outline',
        title: 'Embed',
        description: 'Embed these capabilities through training, governance, and change management so they become part of everyday work.',
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
        icon: 'mdi:strategy',
        title: 'Strategy Blueprint',
        description: 'Identifying where analytics creates value and building actionable roadmaps.',
        metric: '3x faster\ntime‑to‑insights',
      },
      {
        icon: 'mdi:database-cog',
        title: 'Data Foundations',
        description: 'Designing and implementing cloud data platforms, models, and pipelines.',
        metric: '50% leaner\ndata processing costs',
      },
      {
        icon: 'mdi:chart-pie',
        title: 'Insight Hub',
        description: 'Unifying metrics and dashboards into governed, self-serve BI layers.',
        metric: '5x decision velocity\ncompany‑wide',
      },
      {
        icon: 'mdi:robot-industrial',
        title: 'Pattern Lab',
        description: 'Building, deploying, and monitoring data science and ML solutions.',
        metric: '30% elevated\nmodel precision',
      },
      {
        icon: 'mdi:trending-up',
        title: 'Growth Signals',
        description: 'Transforming customer, product, and revenue data into growth insights.',
        metric: '25% faster\nrevenue growth',
      },
      {
        icon: 'mdi:shield-lock',
        title: 'Trust Frameworks',
        description: 'Establishing policies and controls for reliable, secure, compliant data.',
        metric: '80% faster\ncompliance cycles',
      },
    ],
  },
  servicesIntro: {
    title: 'Three common starting points.',
    subheading: 'Where most teams begin their analytics journey.',
    items: [
      {
        number: '01',
        icon: 'mdi:shield-lock',
        title: 'Foundation Readiness',
        description: 'Assess and prepare your data infrastructure',
        link: '/services/#foundation',
      },
      {
        number: '02',
        icon: 'mdi:file-document-edit',
        title: 'Reporting Reset',
        description: 'Modernize your reporting capabilities',
        link: '/services/#reporting',
      },
      {
        number: '03',
        icon: 'mdi:chart-bar',
        title: 'Performance Diagnostics',
        description: 'Identify and optimize performance bottlenecks',
        link: '/services/#diagnostics',
      },
    ],
    navigationButton: {
      text: 'View all Services',
      href: '/services/',
    },
  },
};

