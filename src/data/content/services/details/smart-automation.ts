import type { ServiceDetail } from '../types';

export const smartAutomation: ServiceDetail = {
  slug: "smart-automation",
  name: "Smart Automation",
  shortDescription: "Automate repetitive analytics workflows",
  icon: "mdi:robot",
  hero: {
    title: "Automate Analytics Workflows",
    subtitle: "Smart Automation Service",
    description: "Eliminate repetitive manual work in analytics. We automate data pipelines, report generation, and analytical workflows, freeing your team to focus on analysis and insights rather than data processing.",
    descriptionHighlight: ['focus on analysis'],
    keyBenefits: [
      "Automated data pipelines",
      "Intelligent report generation",
      "Workflow optimization",
      "Scalable analytics processes"
    ]
  },
  overview: {
    title: "The Case for Automation",
    description: "Manual analytics workflows are time-consuming, error-prone, and don't scale. Our Smart Automation service eliminates repetitive tasks, ensuring consistent, reliable analytics delivery while freeing analysts for higher-value work.",
    descriptionHighlight: ['higher-value work'],
    challenges: [
      "Time-consuming manual data preparation and processing",
      "Repetitive report generation and distribution",
      "Inconsistent analytical processes and outputs",
      "Limited scalability of manual analytics workflows"
    ],
    solutions: [
      "Automated data ingestion and processing pipelines",
      "Intelligent report generation and distribution",
      "Workflow orchestration and scheduling",
      "Quality assurance and error handling automation"
    ]
  },
  benefits: {
    title: "Smart Automation Benefits",
    description: "Reduce manual effort and improve analytics consistency across your organization.",
    descriptionHighlight: ['analytics consistency'],
    features: [
      {
        title: "Data Pipelines",
        description: "Reliable, automated data ingestion and processing workflows.",
        icon: "mdi:pipe"
      },
      {
        title: "Report Automation",
        description: "Automated generation and distribution of reports and dashboards.",
        icon: "mdi:file-chart"
      },
      {
        title: "Workflow Orchestration",
        description: "Centralized scheduling and monitoring of analytics workflows.",
        icon: "mdi:cog-sync"
      },
      {
        title: "Quality Assurance",
        description: "Automated validation and error detection in data processing.",
        icon: "mdi:quality-high"
      }
    ]
  },
  process: {
    title: "Smart Automation Process",
    description: "A 12-week program to automate analytics workflows.",
    descriptionHighlight: ['12-week program'],
    steps: [
      {
        step: 1,
        title: "Workflow Analysis",
        description: "Map and analyze current manual processes and workflows.",
        deliverables: [
          "Process documentation",
          "Automation opportunities",
          "Priority matrix"
        ]
      },
      {
        step: 2,
        title: "Architecture Design",
        description: "Design automation architecture and select appropriate technologies.",
        deliverables: [
          "Architecture blueprint",
          "Technology selection",
          "Integration plan"
        ]
      },
      {
        step: 3,
        title: "Pipeline Development",
        description: "Build automated data processing and analytics pipelines.",
        deliverables: [
          "Data pipelines",
          "ETL processes",
          "Quality checks"
        ]
      },
      {
        step: 4,
        title: "Report Automation",
        description: "Implement automated report generation and distribution.",
        deliverables: [
          "Report templates",
          "Scheduling system",
          "Distribution automation"
        ]
      },
      {
        step: 5,
        title: "Orchestration Setup",
        description: "Implement workflow orchestration and monitoring.",
        deliverables: [
          "Orchestration platform",
          "Monitoring dashboards",
          "Alert system"
        ]
      },
      {
        step: 6,
        title: "Testing & Validation",
        description: "Comprehensive testing and validation of automated processes.",
        deliverables: [
          "Test scenarios",
          "Validation results",
          "Performance benchmarks"
        ]
      },
      {
        step: 7,
        title: "Training & Handover",
        description: "Train team on maintaining and monitoring automated workflows.",
        deliverables: [
          "User training",
          "Documentation",
          "Support procedures"
        ]
      }
    ]
  },
  outcomes: {
    title: "Expected Results",
    description: "Significant improvements in efficiency, consistency, and scalability.",
    descriptionHighlight: ['efficiency, consistency'],
    metrics: [
      {
        label: "Time Savings",
        value: "70%",
        description: "Reduction in time spent on manual tasks"
      },
      {
        label: "Process Consistency",
        value: "95%",
        description: "Improvement in process consistency and reliability"
      },
      {
        label: "Error Reduction",
        value: "80%",
        description: "Reduction in manual errors and inconsistencies"
      },
      {
        label: "Scalability",
        value: "10x",
        description: "Increase in analytics processing capacity"
      }
    ]
  },
  cta: {
    title: "Automate Your Analytics",
    description: "Eliminate repetitive tasks and scale your analytics capabilities through automation.",
    descriptionHighlight: ['scale your analytics'],
    ctaText: "Start Smart Automation",
    ctaHref: "/contact"
  }
};
