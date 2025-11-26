import type { ServiceDetail } from '../types';

export const reportingReset: ServiceDetail = {
  slug: "reporting-reset",
  name: "Reporting Reset",
  shortDescription: "Modernize your reporting capabilities",
  icon: "mdi:chart-box",
  hero: {
    title: "Modernize Your Reporting Infrastructure",
    subtitle: "Reporting Reset Service",
    description: "Replace static reports with dynamic, interactive analytics. We modernize your reporting infrastructure, implement self-service capabilities, and create dashboards that support better decision-making.",
    descriptionHighlight: ['interactive analytics'],
    keyBenefits: [
      "Self-service analytics platform",
      "Interactive dashboards and reports",
      "Automated report generation",
      "Real-time data visualization"
    ]
  },
  overview: {
    title: "The Case for Modern Reporting",
    description: "Traditional reporting often means waiting for IT to create static reports that are outdated by the time they're delivered. Modern reporting puts insights directly in the hands of business users with tools that update in real-time.",
    descriptionHighlight: ['real-time'],
    challenges: [
      "Outdated reporting tools and processes",
      "Manual report creation consuming valuable time",
      "Limited user access to data and insights",
      "Static reports that don't support dynamic decision-making"
    ],
    solutions: [
      "Modern BI platform implementation",
      "Self-service analytics enablement",
      "Automated reporting workflows",
      "Interactive dashboard creation"
    ]
  },
  benefits: {
    title: "Modern Reporting Capabilities",
    description: "Equip your organization with reporting tools that match the pace of business.",
    descriptionHighlight: ['pace of business'],
    features: [
      {
        title: "Self-Service Analytics",
        description: "Business users can create their own reports and analyses without waiting for IT support.",
        icon: "mdi:account-cog"
      },
      {
        title: "Real-Time Dashboards",
        description: "Interactive dashboards that update automatically as new data becomes available.",
        icon: "mdi:monitor-dashboard"
      },
      {
        title: "Automated Distribution",
        description: "Schedule reports to generate and distribute automatically to stakeholders.",
        icon: "mdi:email-send"
      },
      {
        title: "Mobile Access",
        description: "Responsive dashboards and reports accessible from any device.",
        icon: "mdi:cellphone-cog"
      }
    ]
  },
  process: {
    title: "Our Reporting Reset Process",
    description: "An 8-week program to transform your reporting capabilities.",
    descriptionHighlight: ['8-week program'],
    steps: [
      {
        step: 1,
        title: "Current State Analysis",
        description: "Audit existing reports, tools, and user requirements.",
        deliverables: [
          "Reporting inventory",
          "User needs assessment",
          "Technology evaluation"
        ]
      },
      {
        step: 2,
        title: "Platform Selection",
        description: "Choose and configure the right BI platform for your needs.",
        deliverables: [
          "Platform recommendation",
          "Architecture design",
          "Security configuration"
        ]
      },
      {
        step: 3,
        title: "Data Preparation",
        description: "Clean, transform, and prepare data for reporting.",
        deliverables: [
          "Data models",
          "ETL processes",
          "Quality validation"
        ]
      },
      {
        step: 4,
        title: "Dashboard Development",
        description: "Create interactive dashboards and reports aligned to business needs.",
        deliverables: [
          "Executive dashboards",
          "Operational reports",
          "User training materials"
        ]
      },
      {
        step: 5,
        title: "Automation Setup",
        description: "Implement automated report generation and distribution.",
        deliverables: [
          "Scheduling system",
          "Distribution lists",
          "Alert configurations"
        ]
      },
      {
        step: 6,
        title: "User Training",
        description: "Train users on self-service tools and reporting best practices.",
        deliverables: [
          "Training sessions",
          "Documentation",
          "Support procedures"
        ]
      },
      {
        step: 7,
        title: "Testing & Validation",
        description: "Comprehensive testing of all reporting functionality.",
        deliverables: [
          "Test results",
          "Performance benchmarks",
          "User acceptance"
        ]
      },
      {
        step: 8,
        title: "Go-Live & Support",
        description: "Launch the new system with ongoing support during transition.",
        deliverables: [
          "Launch plan",
          "Support documentation",
          "Maintenance procedures"
        ]
      }
    ]
  },
  outcomes: {
    title: "Expected Results",
    description: "Significant improvements in reporting efficiency and user capability.",
    descriptionHighlight: ['reporting efficiency'],
    metrics: [
      {
        label: "Report Creation Time",
        value: "75%",
        description: "Reduction in time to create new reports"
      },
      {
        label: "User Satisfaction",
        value: "90%+",
        description: "Increase in user satisfaction with reporting tools"
      },
      {
        label: "Self-Service Adoption",
        value: "80%",
        description: "Percentage of reports created by business users"
      },
      {
        label: "Time to Insight",
        value: "50%",
        description: "Faster access to business insights"
      }
    ]
  },
  cta: {
    title: "Ready to Modernize Reporting?",
    description: "Upgrade your reporting capabilities and enable self-service analytics across your organization.",
    descriptionHighlight: ['self-service analytics'],
    ctaText: "Start Reporting Reset",
    ctaHref: "/contact"
  }
};
