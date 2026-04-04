import { navigationContent } from "./navigation";

export interface ServicesOverviewContent {
  hero: {
    eyebrow: string;
    title: string;
    titleHighlight?: string | string[];
    description: string;
    pills: string[];
    primaryCtaText: string;
    primaryCtaHref: string;
    secondaryCtaText: string;
    secondaryCtaHref: string;
  };
  chooser: {
    title: string;
    description: string;
    tracks: {
      name: string;
      summary: string;
      services: string[];
      outcome: string;
    }[];
  };
  industries: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    industries: {
      name: string;
      description: string;
      descriptionHighlight?: string | string[];
      icon: string;
      keyBenefit: string;
      keyBenefitHighlight?: string | string[];
    }[];
    goal: string;
    goalHighlight?: string | string[];
  };
  engagementModels: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    models: {
      name: string;
      subheadline: string;
      description: string;
      descriptionHighlight?: string | string[];
      commercialModel: string;
      workingRhythm: string;
      bestFor: string;
      bestForHighlight?: string | string[];
      deliverables: string[];
      pricingRange: string;
      typicalTimeframe: string;
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

const servicesDropdown =
  navigationContent.items.find((item) => item.name === "Services")?.dropdown ?? [];

export const servicesOverviewContent: ServicesOverviewContent = {
  hero: {
    eyebrow: "Service Library",
    title: "Analytics services built to fix specific operational problems",
    titleHighlight: ["specific operational problems"],
    description:
      "AUXO does not sell one vague transformation package. We offer eight focused services across data foundations, reporting, performance, forecasting, decision systems, automation, applied AI, and analytics enablement so buyers can start where the friction actually is.",
    pills: [
      `${servicesDropdown.length} specialist offers`,
      "Concrete fit criteria",
      "Flexible engagement models",
    ],
    primaryCtaText: "Find your service",
    primaryCtaHref: "#services-chooser",
    secondaryCtaText: "View engagement models",
    secondaryCtaHref: "#models",
  },
  chooser: {
    title: "Start with the problem, not the buzzword",
    description:
      "Most teams do not need more analytics language. They need help identifying where the operating drag really starts and which service fixes that layer first.",
    tracks: [
      {
        name: "Stabilize the foundation",
        summary:
          "Use this track when trust in the data, reporting layer, or ownership model is still shaky.",
        services: [
          "Foundation Readiness",
          "Reporting Reset",
          "Autonomy Readiness Review",
        ],
        outcome: "Get to shared definitions, cleaner reporting, and safer self-serve expansion.",
      },
      {
        name: "Improve speed and decision quality",
        summary:
          "Use this track when the stack exists, but it is slow, reactive, or inconsistent in how it supports decisions.",
        services: [
          "Performance Diagnostics",
          "Forecasting Lab",
          "Decision Playbooks",
        ],
        outcome: "Get faster systems, stronger forward visibility, and more repeatable operational choices.",
      },
      {
        name: "Scale throughput intelligently",
        summary:
          "Use this track when repetitive analytics work or emerging AI opportunities are blocking higher-value work.",
        services: [
          "Smart Automation",
          "Augmented Intelligence Studio",
        ],
        outcome: "Reduce repetitive effort and apply AI where it improves throughput without wrecking trust.",
      },
    ],
  },
  industries: {
    title: "Where these services tend to matter most",
    description:
      "We are most useful in data-rich environments where reporting quality, operational speed, planning discipline, and decision consistency affect margin or service quality quickly.",
    descriptionHighlight: ["data-rich environments", "decision consistency"],
    industries: [
      {
        name: "Real Estate and Property",
        description: "Useful when portfolio, leasing, and asset decisions depend on cleaner reporting, forecasting, and portfolio visibility.",
        descriptionHighlight: ["portfolio visibility"],
        icon: "mdi:domain",
        keyBenefit: "Typical focus: portfolio performance, tenant trends, pricing, and investment readiness.",
      },
      {
        name: "Hospitality and Tourism",
        description: "Useful when revenue, occupancy, and service operations require better forecasting and faster performance visibility.",
        descriptionHighlight: ["better forecasting"],
        icon: "mdi:palm-tree",
        keyBenefit: "Typical focus: demand planning, pricing, guest behavior, and operating review cadence.",
      },
      {
        name: "Retail and Ecommerce",
        description: "Useful when teams need cleaner reporting, customer insight, inventory visibility, and more consistent commercial decisions.",
        descriptionHighlight: ["customer insight", "inventory visibility"],
        icon: "mdi:cart",
        keyBenefit: "Typical focus: merchandising, retention, conversion, supply planning, and channel performance.",
      },
      {
        name: "Financial and Professional Services",
        description: "Useful when leadership needs stronger KPI discipline, portfolio visibility, risk review, and decision playbooks.",
        descriptionHighlight: ["stronger KPI discipline"],
        icon: "mdi:finance",
        keyBenefit: "Typical focus: executive reporting, portfolio analysis, risk visibility, and client-performance views.",
      },
      {
        name: "Logistics and Operations",
        description: "Useful when workflow bottlenecks, forecasting gaps, and reporting lag are slowing decisions in the operating core.",
        descriptionHighlight: ["workflow bottlenecks"],
        icon: "mdi:package-variant",
        keyBenefit: "Typical focus: cost visibility, route or capacity planning, SLA reporting, and workflow automation.",
      },
      {
        name: "Public Sector and Complex Service Delivery",
        description: "Useful when analytics needs to improve resource allocation, reporting trust, and service-level decision speed across many stakeholders.",
        descriptionHighlight: ["resource allocation"],
        icon: "mdi:gavel",
        keyBenefit: "Typical focus: service performance, allocation logic, program monitoring, and operational transparency.",
      },
    ],
    goal: "Across sectors, the consistent goal is the same: make reporting clearer, decisions faster, and delivery less dependent on manual workarounds.",
    goalHighlight: ["reporting clearer", "decisions faster"],
  },
  engagementModels: {
    title: "Choose how you want AUXO involved",
    description:
      "The right model depends on how defined the problem is, how much senior attention the work needs, and whether you are buying clarity, delivery capacity, or ongoing judgment.",
    descriptionHighlight: ["clarity, delivery capacity, or ongoing judgment"],
    models: [
      {
        name: "Diagnostic Sprint",
        subheadline: "Fast clarity before bigger spend",
        description:
          "A senior-led diagnostic for teams that need to isolate the real bottleneck, align owners, and leave with a decision-ready plan before committing to a larger build.",
        descriptionHighlight: ["decision-ready plan"],
        commercialModel: "Fixed-fee diagnostic",
        workingRhythm: "Intensive review with 2-3 working sessions per week",
        bestFor:
          "Problem framing, architecture uncertainty, reporting cleanup decisions, and service selection when leadership wants sharp direction quickly.",
        bestForHighlight: ["sharp direction quickly"],
        deliverables: [
          "Current-state diagnostic",
          "Priority findings and risks",
          "Decision-ready roadmap",
          "Recommended next-stage model",
        ],
        pricingRange: "AED 35,000 - 75,000",
        typicalTimeframe: "2 - 4 Weeks",
      },
      {
        name: "Delivery Build",
        subheadline: "Targeted implementation with senior execution",
        description:
          "A scoped build for teams that already know the outcome they need and want senior-led execution from design through rollout.",
        descriptionHighlight: ["senior-led execution"],
        commercialModel: "Fixed-fee or phased delivery",
        workingRhythm: "Weekly build cadence with delivery reviews and steering",
        bestFor:
          "Reporting rebuilds, forecasting systems, automation delivery, decision-playbook implementation, and other high-trust scoped launches.",
        bestForHighlight: ["high-trust scoped launches"],
        deliverables: [
          "Working solution build",
          "Validation and testing",
          "Documentation and controls",
          "Handoff and adoption support",
        ],
        pricingRange: "AED 120,000 - 320,000",
        typicalTimeframe: "2 - 4 Months",
      },
      {
        name: "Managed Analytics Program",
        subheadline: "Ongoing support across the analytics backlog",
        description:
          "A retained delivery model for organizations with a live analytics backlog that need recurring execution, prioritization, and oversight without building the full internal team immediately.",
        descriptionHighlight: ["retained delivery model"],
        commercialModel: "Monthly retainer",
        workingRhythm: "Shared backlog, recurring delivery, and monthly planning rhythm",
        bestFor:
          "Organizations managing multiple reporting, automation, performance, or enablement priorities over a sustained operating horizon.",
        bestForHighlight: ["sustained operating horizon"],
        deliverables: [
          "Recurring delivery capacity",
          "Backlog prioritization",
          "Platform and reporting upkeep",
          "Monthly impact review",
        ],
        pricingRange: "AED 35,000 - 80,000 / mo",
        typicalTimeframe: "6+ Months",
      },
      {
        name: "Strategic Co-Pilot",
        subheadline: "Senior data and analytics guidance",
        description:
          "Direct access to senior analytics leadership for architecture calls, roadmap decisions, vendor questions, and executive-level guidance when the business needs judgment more than delivery volume.",
        descriptionHighlight: ["needs judgment more than delivery volume"],
        commercialModel: "Leadership retainer",
        workingRhythm: "Senior advisory cadence with reviews, decisions, and on-call support",
        bestFor:
          "Founders and leaders who need sharper analytics judgment, vendor challenge, and roadmap oversight without hiring a full-time data executive yet.",
        bestForHighlight: ["roadmap oversight"],
        deliverables: [
          "Strategic advisory",
          "Architecture reviews",
          "Hiring and org guidance",
          "Leadership decision support",
        ],
        pricingRange: "AED 25,000 - 55,000 / mo",
        typicalTimeframe: "3+ Months",
      },
    ],
  },
  cta: {
    title: "Need help choosing the right starting point?",
    description:
      "Bring the problem, the reporting mess, the performance pain, or the AI ambition. We will tell you which service fits, which one does not, and what should happen first.",
    descriptionHighlight: ["which service fits, which one does not"],
    ctaText: "Book a discovery call",
    ctaHref: "/contact/",
  },
};
