import type { ServiceDetail } from '../types';

export const foundationReadiness: ServiceDetail = {
  slug: "foundation-readiness",
  name: "Foundation Readiness",
  shortDescription: "Assess and prepare your data infrastructure",
  icon: "mdi:layers",
  hero: {
    title: "Build a Solid Analytics Foundation",
    subtitle: "Foundation Readiness Assessment",
    description: "Establish reliable data infrastructure that supports analytics initiatives. Our assessment identifies gaps in your data architecture, establishes governance frameworks, and creates a roadmap for scalable analytics capabilities.",
    descriptionHighlight: ['reliable data infrastructure'],
    keyBenefits: [
      "Complete data infrastructure audit",
      "Governance framework implementation",
      "Scalable architecture roadmap",
      "Risk assessment and mitigation"
    ]
  },
  overview: {
    title: "Why Foundation Readiness Matters",
    description: "Analytics capabilities are only as strong as their underlying foundation. Our Foundation Readiness service evaluates your data infrastructure to identify what's working, what's missing, and what needs improvement to support your analytics goals.",
    descriptionHighlight: ['underlying foundation'],
    challenges: [
      "Fragmented data sources and inconsistent quality",
      "Lack of data governance and security protocols",
      "Inadequate infrastructure for analytics workloads",
      "Unclear data ownership and accountability"
    ],
    solutions: [
      "Comprehensive data architecture assessment",
      "Implementation of governance frameworks",
      "Infrastructure optimization and modernization",
      "Data quality and lineage establishment"
    ]
  },
  benefits: {
    title: "What You Get",
    description: "A comprehensive foundation that enables analytics initiatives across your organization.",
    descriptionHighlight: ['comprehensive foundation'],
    features: [
      {
        title: "Data Architecture Assessment",
        description: "Thorough evaluation of current data infrastructure with specific recommendations for improvement.",
        icon: "mdi:database-search"
      },
      {
        title: "Governance Framework",
        description: "Clear data ownership, security policies, and compliance standards tailored to your organization.",
        icon: "mdi:shield-check"
      },
      {
        title: "Infrastructure Roadmap",
        description: "Prioritized plan for infrastructure improvements aligned with business objectives.",
        icon: "mdi:map-marker-path"
      },
      {
        title: "Quality Assurance",
        description: "Data quality monitoring and validation processes that ensure reliable analytics.",
        icon: "mdi:quality-high"
      }
    ]
  },
  process: {
    title: "Our Approach",
    description: "A structured 6-week process that evaluates and strengthens your data foundation.",
    descriptionHighlight: ['6-week process'],
    steps: [
      {
        step: 1,
        title: "Discovery & Assessment",
        description: "Comprehensive audit of current data infrastructure, systems, and processes.",
        deliverables: [
          "Infrastructure inventory",
          "Gap analysis report",
          "Risk assessment"
        ]
      },
      {
        step: 2,
        title: "Architecture Design",
        description: "Design scalable data architecture that supports your analytics goals.",
        deliverables: [
          "Architecture blueprint",
          "Technology recommendations",
          "Cost-benefit analysis"
        ]
      },
      {
        step: 3,
        title: "Governance Framework",
        description: "Establish data governance policies and organizational structure.",
        deliverables: [
          "Governance policies",
          "Data stewardship model",
          "Security protocols"
        ]
      },
      {
        step: 4,
        title: "Implementation Roadmap",
        description: "Create detailed implementation plan with timelines and milestones.",
        deliverables: [
          "Phased implementation plan",
          "Resource requirements",
          "Success metrics"
        ]
      },
      {
        step: 5,
        title: "Pilot & Validation",
        description: "Test foundation components and validate against requirements.",
        deliverables: [
          "Pilot results",
          "Performance benchmarks",
          "Validation report"
        ]
      },
      {
        step: 6,
        title: "Knowledge Transfer",
        description: "Train your team and provide documentation for ongoing maintenance.",
        deliverables: [
          "Training materials",
          "Documentation",
          "Support procedures"
        ]
      }
    ]
  },
  outcomes: {
    title: "Expected Results",
    description: "Quantifiable improvements in data infrastructure reliability and analytics readiness.",
    descriptionHighlight: ['Quantifiable improvements'],
    metrics: [
      {
        label: "Data Quality Score",
        value: "85%+",
        description: "Improvement in data accuracy and completeness"
      },
      {
        label: "Infrastructure Uptime",
        value: "99.5%+",
        description: "Increased system reliability and availability"
      },
      {
        label: "Time to Insight",
        value: "60%",
        description: "Reduction in time from data to actionable insights"
      },
      {
        label: "Governance Compliance",
        value: "100%",
        description: "Adherence to data governance standards"
      }
    ]
  },
  cta: {
    title: "Ready to Build Your Foundation?",
    description: "Let's assess your current data infrastructure and create a roadmap for analytics success.",
    descriptionHighlight: ['analytics success'],
    ctaText: "Start Foundation Assessment",
    ctaHref: "/contact"
  }
};
