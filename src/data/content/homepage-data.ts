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
  shortDescription?: string;
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
  servicesIntro: {
    title?: string;
    subheading?: string;
    items: {
      icon?: string;
      link?: string;
      number?: string;
      title: string;
      titleHighlight?: string;
      description: string;
      descriptionHighlight?: string | string[];
      ctaText?: string;
      ctaHref?: string;
    }[];
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
  featuredServices: {
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
  valueProposition: {
    line1: string;
    line2: string;
  };
}

export const homepageContent: HomepageContent = {
  "capabilities": {
    "cards": [
      {
        "description": "Identifying where analytics creates value and building actionable roadmaps.",
        "descriptionHighlight": [
          "creates value"
        ],
        "icon": "mdi:compass-outline",
        "metric": "upto 3x faster\ntime‑to‑insights",
        "title": "Strategy Blueprint"
      },
      {
        "description": "Designing and implementing cloud data platforms, models, and pipelines.",
        "descriptionHighlight": [
          "Designing and implementing"
        ],
        "icon": "mdi:server-network",
        "metric": "upto 50% leaner\ndata processing costs",
        "title": "Data Foundations"
      },
      {
        "description": "Unifying metrics and dashboards into governed, self-serve BI layers.",
        "descriptionHighlight": [
          "Unifying"
        ],
        "icon": "mdi:view-dashboard-variant",
        "metric": "upto 5x decision velocity\ncompany‑wide",
        "title": "Insight Hub"
      },
      {
        "description": "Building, deploying, and monitoring data science and ML solutions.",
        "descriptionHighlight": [
          "Building, deploying"
        ],
        "icon": "mdi:atom",
        "metric": "upto 30% elevated\nmodel precision",
        "title": "Pattern Lab"
      },
      {
        "description": "Transforming customer, product, and revenue data into growth insights.",
        "descriptionHighlight": [
          "Transforming"
        ],
        "icon": "mdi:chart-timeline-variant",
        "metric": "upto 25% faster\nrevenue growth",
        "title": "Growth Signals"
      },
      {
        "description": "Establishing policies and controls for reliable, secure, compliant data.",
        "descriptionHighlight": [
          "Establishing"
        ],
        "icon": "mdi:shield-check-outline",
        "metric": "upto 80% faster\ncompliance cycles",
        "title": "Trust Frameworks"
      }
    ],
    "subheading": "Six disciplines powering every project.",
    "title": "Six Core Capabilities"
  },
  "featuredServices": {
    "items": [
      {
        "description": "Define your data vision, identify opportunities, and build a roadmap for analytics success.",
        "icon": "mdi:layers",
        "link": "/services/foundation-readiness",
        "number": "01",
        "shortDescription": "Assess and prepare your data infrastructure",
        "title": "Foundation Readiness"
      },
      {
        "description": "Build robust data pipelines, cloud platforms, and infrastructure that scales with your business.",
        "icon": "mdi:chart-box",
        "link": "/services/reporting-reset",
        "number": "02",
        "shortDescription": "Modernize your reporting capabilities",
        "title": "Reporting Reset"
      },
      {
        "description": "Create self-serve dashboards and reporting layers that empower teams to make data-driven decisions.",
        "icon": "mdi:chart-line",
        "link": "/services/performance-diagnostics",
        "number": "03",
        "shortDescription": "Identify and optimize performance bottlenecks",
        "title": "Performance Diagnostics"
      }
    ],
    "navigationButton": {
      "href": "/services",
      "text": "View all services"
    },
    "subheading": "Where most teams begin their analytics journey.",
    "title": "Three Common Starting Points"
  },
  "finalCta": {
    "body": "Share your goals, current challenges, and timelines. You'll leave with a concise view of where analytics can create the most impact and what to do first—before you commit to anything.",
    "bodyHighlight": [
      "most impact",
      "what to do first"
    ],
    "ctaHref": "/contact/",
    "ctaText": "Book a discovery call",
    "reassuranceLine": "No sales pitch—just a structured discussion and clear next steps.",
    "subtitle": "Book a 30-minute discovery call.",
    "title": "Find your next step"
  },
  "hero": {
    "primaryCta": {
      "href": "/contact/",
      "text": "Book a discovery call"
    },
    "scrollIndicator": "Scroll More",
    "subtitle": "AUXO delivers end-to-end DAAS — Data Analytics as a Service tailored to your organisation.",
    "subtitleHighlight": [
      "DAAS",
      "Data Analytics as a Service"
    ],
    "title": "Intelligence,",
    "titleHighlight": "Engineered."
  },
  "methodology": {
    "navigationButton": {
      "href": "/about/",
      "text": "Learn about our approach"
    },
    "steps": [
      {
        "description": "Explore the problem space, the decisions that matter most, and the realities of your data.",
        "descriptionHighlight": [
          "decisions that matter most"
        ],
        "icon": "mdi:database-search",
        "number": 1,
        "output": "Discovery\nDocument",
        "title": "Explore"
      },
      {
        "description": "Design the analytics strategy, architecture, and end‑user experience to support those decisions.",
        "descriptionHighlight": [
          "analytics strategy"
        ],
        "icon": "mdi:palette",
        "number": 2,
        "output": "Technical\nSpecification",
        "title": "Design"
      },
      {
        "description": "Generate the solutions—pipelines, models, dashboards, and automations—that run in your real environment.",
        "descriptionHighlight": [
          "pipelines, models, dashboards"
        ],
        "icon": "mdi:rocket-launch",
        "number": 3,
        "output": "Production\nCodebase",
        "title": "Generate"
      },
      {
        "description": "Embed these capabilities through training, governance, and change management so they become part of everyday work.",
        "descriptionHighlight": [
          "training, governance"
        ],
        "icon": "mdi:account-group-outline",
        "number": 4,
        "output": "Training &\nHandoff",
        "title": "Embed"
      }
    ],
    "subtitle": "A practical four-step model",
    "title": "AUXO",
    "titleHighlight": "Edge"
  },
  "servicesIntro": {
    "items": [
      {
        "description": "Define your data vision, identify opportunities, and build a roadmap for analytics success.",
        "icon": "mdi:chart-line",
        "link": "/services/analytics-strategy",
        "number": "01",
        "title": "Analytics Strategy"
      },
      {
        "description": "Build robust data pipelines, cloud platforms, and infrastructure that scales with your business.",
        "icon": "mdi:database-cog",
        "link": "/services/data-engineering",
        "number": "02",
        "title": "Data Engineering"
      },
      {
        "description": "Create self-serve dashboards and reporting layers that empower teams to make data-driven decisions.",
        "icon": "mdi:chart-box",
        "link": "/services/business-intelligence",
        "number": "03",
        "title": "Business Intelligence"
      }
    ],
    "navigationButton": {
      "href": "/services",
      "text": "View all services"
    },
    "subheading": "Three starting points for your analytics journey",
    "title": "Our Core Services"
  },
  "techStack": {
    "items": [
      {
        "icon": "simple-icons:python",
        "name": "Python"
      },
      {
        "icon": "simple-icons:amazonaws",
        "name": "AWS"
      },
      {
        "icon": "simple-icons:microsoftazure",
        "name": "Azure"
      },
      {
        "icon": "simple-icons:googlecloud",
        "name": "GCP"
      },
      {
        "icon": "simple-icons:snowflake",
        "name": "Snowflake"
      },
      {
        "icon": "simple-icons:databricks",
        "name": "Databricks"
      },
      {
        "icon": "simple-icons:tableau",
        "name": "Tableau"
      },
      {
        "icon": "simple-icons:powerbi",
        "name": "Power BI"
      },
      {
        "icon": "simple-icons:dbt",
        "name": "dbt"
      },
      {
        "icon": "simple-icons:apacheairflow",
        "name": "Airflow"
      },
      {
        "icon": "simple-icons:apachespark",
        "name": "Spark"
      },
      {
        "icon": "simple-icons:apachekafka",
        "name": "Kafka"
      },
      {
        "icon": "simple-icons:tensorflow",
        "name": "TensorFlow"
      },
      {
        "icon": "simple-icons:pytorch",
        "name": "PyTorch"
      },
      {
        "icon": "simple-icons:postgresql",
        "name": "PostgreSQL"
      },
      {
        "icon": "simple-icons:mongodb",
        "name": "MongoDB"
      },
      {
        "icon": "simple-icons:docker",
        "name": "Docker"
      },
      {
        "icon": "simple-icons:kubernetes",
        "name": "Kubernetes"
      }
    ],
    "subtitle": "Modern analytics tools and platforms powering our solutions",
    "title": "Technologies We Work With"
  },
  "valueProposition": {
    "line1": "Most companies collect data. Few convert it into decisions.",
    "line2": "AUXO bridges the gap — connecting business understanding with data intelligence."
  }
};
