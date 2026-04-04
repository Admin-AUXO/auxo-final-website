import { getServicePageDetailBySlug } from "./service-page-details";

export interface ProcessStep {
  number: number;
  icon: string;
  title: string;
  description: string;
  descriptionHighlight?: string | string[];
  output?: string;
}

export interface CapabilityItem {
  icon: string;
  title: string;
  description: string;
}

export interface CapabilityPillar {
  name: string;
  summary: string;
  outcome: string;
  capabilities: CapabilityItem[];
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
    proofPoints: string[];
  };
  decisionFit: {
    title: string;
    subheading: string;
    items: {
      title: string;
      pressure: string;
      signal: string;
      outcome: string;
    }[];
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
    pillars: CapabilityPillar[];
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

const homepageServiceItem = (
  slug: string,
  number: string,
  shortDescription: string,
  description: string,
): ServiceIntroItem => {
  const service = getServicePageDetailBySlug(slug);

  if (!service) {
    throw new Error(`Missing service detail for homepage item: ${slug}`);
  }

  return {
    number,
    icon: service.icon,
    title: service.name,
    description,
    shortDescription,
    link: `/services/${slug}/`,
  };
};

export const homepageContent: HomepageContent = {
  hero: {
    title: "Intelligence,",
    titleHighlight: "Engineered.",
    subtitle:
      "AUXO helps operators and leadership teams fix reporting drag, planning blind spots, and repetitive analytics work before those issues harden into operating debt.",
    subtitleHighlight: ["reporting drag", "planning blind spots", "manual analytics work"],
    primaryCta: {
      href: "/contact/",
      text: "Book a discovery call",
    },
    scrollIndicator: "See Where AUXO Fits",
    proofPoints: [
      "Dubai-based, senior-led delivery",
      "Reporting, planning, automation, applied AI",
      "Built for teams that need clarity before scale",
    ],
  },
  decisionFit: {
    title: "Why teams bring AUXO in",
    subheading:
      "The trigger is usually not a lack of dashboards. It is one of three operating failures that keeps surfacing in leadership reviews.",
    items: [
      {
        title: "Reporting trust is weak",
        pressure:
          "Numbers are duplicated, manually rebuilt, or argued over every time performance gets reviewed.",
        signal: "Common signal: meetings keep turning into debates about definitions instead of decisions.",
        outcome: "AUXO response: rebuild the foundation, reporting layer, and KPI logic so the review cadence stops stalling.",
      },
      {
        title: "Planning stays reactive",
        pressure:
          "Teams can explain last month clearly enough, but they still cannot model next month with confidence.",
        signal: "Common signal: forecasting lives in side spreadsheets, static assumptions, or one analyst's head.",
        outcome: "AUXO response: build forecasting systems and decision playbooks leaders can actually plan from.",
      },
      {
        title: "Analytics work is trapped in manual loops",
        pressure:
          "Skilled analysts are spending too much time assembling, checking, and distributing work instead of interpreting it.",
        signal: "Common signal: repetitive workflows soak up senior time while AI and automation ideas remain vague.",
        outcome: "AUXO response: automate the drudge work first, then apply AI where it earns the right to stay.",
      },
    ],
  },
  capabilities: {
    title: "Six Core Capabilities",
    subheading: "Three operating lanes. Six specialist capabilities. One decision intelligence partner built to clarify, build, and scale.",
    pillars: [
      {
        name: "Clarify",
        summary:
          "Diagnose where the drag starts and sharpen decision criteria before more build work starts eating budget.",
        outcome: "Best when leadership needs direction before a bigger analytics spend.",
        capabilities: [
          {
            icon: "mdi:compass-outline",
            title: "Operating diagnostics",
            description: "Pinpoint the reporting, ownership, and process failures causing the mess.",
          },
          {
            icon: "mdi:scale-balance",
            title: "Decision design",
            description: "Turn recurring high-stakes calls into clearer thresholds, rules, and review logic.",
          },
        ],
      },
      {
        name: "Build",
        summary:
          "Rework the data and reporting layers the business depends on every week, not just the presentation layer on top.",
        outcome: "Best when trust, speed, or self-serve is already breaking under real usage.",
        capabilities: [
          {
            icon: "mdi:file-tree",
            title: "Data foundations",
            description: "Stabilize architecture, ownership, and source-of-truth logic before scale multiplies the damage.",
          },
          {
            icon: "mdi:view-dashboard-outline",
            title: "Reporting systems",
            description: "Replace fragmented dashboards and packs with cleaner, governed decision views.",
          },
        ],
      },
      {
        name: "Scale",
        summary:
          "Increase analytical throughput without hiring more manual reporting habits or bolting hype onto a weak operating model.",
        outcome: "Best when the team needs leverage, not more heroics.",
        capabilities: [
          {
            icon: "mdi:robot-outline",
            title: "Workflow automation",
            description: "Eliminate repetitive analytics routines and add controls so automation does not create new fragility.",
          },
          {
            icon: "mdi:lightbulb-on-outline",
            title: "Applied AI",
            description: "Use AI for bounded analytical workflows where quality, review, and business fit are explicit.",
          },
        ],
      },
    ],
  },
  featuredServices: {
    title: "Start where the friction is",
    subheading: "These are the three entry points buyers use most when the analytics problem is real but the next move is not obvious yet.",
    items: [
      homepageServiceItem(
        "foundation-readiness",
        "01",
        "Get the architecture, ownership, and KPI layer straight before the next build starts.",
        "Audit the data foundation before dashboards, automation, or AI scale the wrong system.",
      ),
      homepageServiceItem(
        "reporting-reset",
        "02",
        "Replace fragmented reporting with a governed system people can actually use.",
        "Rebuild the reporting layer around shared metrics, role-based views, and cleaner self-serve.",
      ),
      homepageServiceItem(
        "performance-diagnostics",
        "03",
        "Find the warehouse, model, and dashboard bottlenecks slowing real decisions down.",
        "Diagnose speed, reliability, and cost drag before the stack loses business trust completely.",
      ),
    ],
    navigationButton: {
      href: "/services/",
      text: "View all services",
    },
  },
  finalCta: {
    body: "Bring the reporting mess, the planning bottleneck, or the automation backlog. You will leave with a clearer read on where the operating drag starts and what should happen first.",
    bodyHighlight: ["where the operating drag starts", "what should happen first"],
    ctaHref: "/contact/",
    ctaText: "Book a discovery call",
    reassuranceLine: "No performative discovery workshop. Just a direct conversation and a cleaner starting point.",
    subtitle: "Book a 30-minute working call.",
    title: "Find the right starting point",
  },
  methodology: {
    navigationButton: {
      href: "/about/",
      text: "See how AUXO works",
    },
    steps: [
      {
        description: "Clarify the operating problem, the decisions that matter, and the real friction underneath the request.",
        descriptionHighlight: ["operating problem", "real friction"],
        icon: "mdi:database-search",
        number: 1,
        output: "Discovery\nFrame",
        title: "Explore",
      },
      {
        description: "Structure the data, reporting logic, and workflow so the system supports the business rhythm properly.",
        descriptionHighlight: ["data, reporting logic, and workflow"],
        icon: "mdi:file-tree",
        number: 2,
        output: "System\nDesign",
        title: "Design",
      },
      {
        description: "Build the reporting, forecasting, automation, or AI layer that solves the defined operating problem.",
        descriptionHighlight: ["reporting, forecasting, automation, or AI layer"],
        icon: "mdi:rocket-launch",
        number: 3,
        output: "Working\nSystem",
        title: "Generate",
      },
      {
        description: "Embed the controls, handoff, and operating habits needed so the work survives real use.",
        descriptionHighlight: ["controls, handoff, and operating habits"],
        icon: "mdi:account-group-outline",
        number: 4,
        output: "Adoption &\nOwnership",
        title: "Embed",
      },
    ],
    subtitle: "AUXO runs a tight four-step operating model.",
    title: "How",
    titleHighlight: "AUXO works",
  },
  techStack: {
    items: [
      { icon: "simple-icons:python", name: "Python" },
      { icon: "simple-icons:amazonaws", name: "AWS" },
      { icon: "simple-icons:microsoftazure", name: "Azure" },
      { icon: "simple-icons:googlecloud", name: "GCP" },
      { icon: "simple-icons:snowflake", name: "Snowflake" },
      { icon: "simple-icons:databricks", name: "Databricks" },
      { icon: "simple-icons:tableau", name: "Tableau" },
      { icon: "simple-icons:powerbi", name: "Power BI" },
      { icon: "simple-icons:dbt", name: "dbt" },
      { icon: "simple-icons:apacheairflow", name: "Airflow" },
      { icon: "simple-icons:apachespark", name: "Spark" },
      { icon: "simple-icons:apachekafka", name: "Kafka" },
      { icon: "simple-icons:tensorflow", name: "TensorFlow" },
      { icon: "simple-icons:pytorch", name: "PyTorch" },
      { icon: "simple-icons:postgresql", name: "PostgreSQL" },
      { icon: "simple-icons:mongodb", name: "MongoDB" },
      { icon: "simple-icons:docker", name: "Docker" },
      { icon: "simple-icons:kubernetes", name: "Kubernetes" },
    ],
    subtitle: "Modern tools matter. They just come after the operating problem is defined properly.",
    title: "Platforms we work inside",
  },
  valueProposition: {
    line1: "Most organizations already have dashboards. They still wait too long for numbers they trust.",
    line2: "AUXO fixes the data, reporting, and decision workflows underneath so analytics changes operating behavior.",
  },
};
