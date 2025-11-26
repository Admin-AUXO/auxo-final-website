import type { ServiceDetail } from '../types';

export const decisionPlaybooks: ServiceDetail = {
  slug: "decision-playbooks",
  name: "Decision Playbooks",
  shortDescription: "Create structured frameworks for key decisions",
  icon: "mdi:book-open-variant",
  hero: {
    title: "Standardize Critical Decisions",
    subtitle: "Decision Playbooks Service",
    description: "Create structured frameworks that improve decision quality and speed. We develop decision playbooks that standardize processes, incorporate relevant data, and ensure consistency across your organization.",
    descriptionHighlight: ['structured frameworks'],
    keyBenefits: [
      "Structured decision frameworks",
      "Data-driven decision criteria",
      "Accelerated decision timelines",
      "Improved decision quality and consistency"
    ]
  },
  overview: {
    title: "Better Decisions Through Structure",
    description: "Consistent, high-quality decisions require clear frameworks. Our Decision Playbooks provide repeatable processes that ensure key decisions are made with the right data, criteria, and stakeholder input.",
    descriptionHighlight: ['repeatable processes'],
    challenges: [
      "Inconsistent decision-making processes across teams",
      "Lack of clear decision criteria and frameworks",
      "Slow decision timelines impacting business agility",
      "Poor documentation of decision rationale and outcomes"
    ],
    solutions: [
      "Standardized decision frameworks",
      "Data-driven decision criteria",
      "Automated decision support tools",
      "Decision documentation and tracking"
    ]
  },
  benefits: {
    title: "Decision Playbooks Benefits",
    description: "Improve how your organization makes important decisions.",
    descriptionHighlight: ['important decisions'],
    features: [
      {
        title: "Structured Frameworks",
        description: "Clear, repeatable processes for different types of business decisions.",
        icon: "mdi:clipboard-list"
      },
      {
        title: "Decision Criteria",
        description: "Well-defined evaluation criteria based on business priorities.",
        icon: "mdi:checkbox-marked"
      },
      {
        title: "Data Integration",
        description: "Seamless access to relevant data and analytics during decision-making.",
        icon: "mdi:database-plus"
      },
      {
        title: "Documentation",
        description: "Systematic documentation of decisions, rationale, and outcomes.",
        icon: "mdi:file-document"
      }
    ]
  },
  process: {
    title: "Decision Playbooks Process",
    description: "An 8-week program to create and implement decision frameworks.",
    descriptionHighlight: ['8-week program'],
    steps: [
      {
        step: 1,
        title: "Decision Inventory",
        description: "Identify key decisions and current decision-making processes.",
        deliverables: [
          "Decision catalog",
          "Process mapping",
          "Pain point analysis"
        ]
      },
      {
        step: 2,
        title: "Framework Design",
        description: "Design structured frameworks for each decision type.",
        deliverables: [
          "Decision frameworks",
          "Evaluation criteria",
          "Process flows"
        ]
      },
      {
        step: 3,
        title: "Data Integration",
        description: "Identify and integrate relevant data sources and analytics.",
        deliverables: [
          "Data requirements",
          "Analytics integration",
          "Dashboard design"
        ]
      },
      {
        step: 4,
        title: "Tool Development",
        description: "Create decision support tools and templates.",
        deliverables: [
          "Decision templates",
          "Calculation tools",
          "Documentation forms"
        ]
      },
      {
        step: 5,
        title: "Pilot Testing",
        description: "Test frameworks with real decisions and refine based on feedback.",
        deliverables: [
          "Pilot results",
          "User feedback",
          "Framework refinements"
        ]
      },
      {
        step: 6,
        title: "Training & Rollout",
        description: "Train teams and implement decision playbooks across the organization.",
        deliverables: [
          "Training materials",
          "Implementation plan",
          "Support procedures"
        ]
      }
    ]
  },
  outcomes: {
    title: "Expected Results",
    description: "Improved decision speed, quality, and consistency across the organization.",
    descriptionHighlight: ['decision speed, quality'],
    metrics: [
      {
        label: "Decision Speed",
        value: "50%",
        description: "Reduction in time to make key decisions"
      },
      {
        label: "Decision Quality",
        value: "75%",
        description: "Improvement in decision outcome quality"
      },
      {
        label: "Process Consistency",
        value: "90%",
        description: "Adherence to standardized decision processes"
      },
      {
        label: "Stakeholder Satisfaction",
        value: "85%",
        description: "Improvement in stakeholder satisfaction"
      }
    ]
  },
  cta: {
    title: "Standardize Your Decisions",
    description: "Create frameworks that improve the quality and speed of critical business decisions.",
    descriptionHighlight: ['quality and speed'],
    ctaText: "Build Decision Playbooks",
    ctaHref: "/contact"
  }
};
