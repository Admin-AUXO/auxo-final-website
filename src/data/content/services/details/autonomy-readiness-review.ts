import type { ServiceDetail } from '../types';

export const autonomyReadinessReview: ServiceDetail = {
  slug: "autonomy-readiness-review",
  name: "Autonomy Readiness Review",
  shortDescription: "Prepare your team for self-service analytics",
  icon: "mdi:shield-check",
  hero: {
    title: "Enable Self-Service Analytics",
    subtitle: "Autonomy Readiness Review",
    description: "Prepare your organization for self-service analytics. We assess readiness, implement governance frameworks, and develop training programs that enable business users to access and analyze data independently.",
    descriptionHighlight: ['self-service analytics'],
    keyBenefits: [
      "Self-service analytics capabilities",
      "Data governance and security",
      "User training and adoption",
      "Scalable analytics infrastructure"
    ]
  },
  overview: {
    title: "Building Analytics Capability",
    description: "Self-service analytics empowers business users to answer their own questions without waiting for IT or analytics teams. Our Autonomy Readiness Review ensures you have the right governance, tools, and training to make this successful.",
    descriptionHighlight: ['right governance, tools, and training'],
    challenges: [
      "IT bottlenecks preventing timely data access",
      "Lack of data literacy and analytical skills",
      "Inadequate governance and security controls",
      "Resistance to change and technology adoption"
    ],
    solutions: [
      "Comprehensive autonomy assessment and roadmap",
      "Data governance and security framework implementation",
      "User training and change management programs",
      "Self-service tool deployment and adoption support"
    ]
  },
  benefits: {
    title: "Autonomy Benefits",
    description: "Build a data-capable organization where users can find answers independently.",
    descriptionHighlight: ['data-capable organization'],
    features: [
      {
        title: "Self-Service Tools",
        description: "User-friendly tools that enable business users to analyze data without technical support.",
        icon: "mdi:account-cog"
      },
      {
        title: "Data Governance",
        description: "Governance framework that balances access with data quality and security.",
        icon: "mdi:shield-account"
      },
      {
        title: "User Training",
        description: "Training programs tailored to different user skill levels and roles.",
        icon: "mdi:school"
      },
      {
        title: "Change Management",
        description: "Strategies to drive adoption and build data literacy across the organization.",
        icon: "mdi:account-group"
      }
    ]
  },
  process: {
    title: "Autonomy Readiness Process",
    description: "A 10-week program to enable self-service analytics.",
    descriptionHighlight: ['10-week program'],
    steps: [
      {
        step: 1,
        title: "Readiness Assessment",
        description: "Evaluate current analytics maturity, skills, and infrastructure.",
        deliverables: [
          "Maturity assessment",
          "Skills gap analysis",
          "Infrastructure evaluation"
        ]
      },
      {
        step: 2,
        title: "Governance Design",
        description: "Design data governance and security frameworks.",
        deliverables: [
          "Governance policies",
          "Security protocols",
          "Access control models"
        ]
      },
      {
        step: 3,
        title: "Platform Setup",
        description: "Configure self-service analytics platform and tools.",
        deliverables: [
          "Platform configuration",
          "Data catalog setup",
          "User interface design"
        ]
      },
      {
        step: 4,
        title: "Training Program",
        description: "Develop training curriculum and materials for different user levels.",
        deliverables: [
          "Training curriculum",
          "Learning materials",
          "Certification programs"
        ]
      },
      {
        step: 5,
        title: "Pilot Program",
        description: "Launch pilot program with select users and gather feedback.",
        deliverables: [
          "Pilot results",
          "User feedback",
          "Program refinements"
        ]
      },
      {
        step: 6,
        title: "Organization Rollout",
        description: "Expand successful pilot across the organization.",
        deliverables: [
          "Rollout plan",
          "Change management",
          "Support procedures"
        ]
      },
      {
        step: 7,
        title: "Monitoring & Support",
        description: "Establish ongoing monitoring and user support.",
        deliverables: [
          "Usage analytics",
          "Support system",
          "Continuous improvement"
        ]
      }
    ]
  },
  outcomes: {
    title: "Expected Results",
    description: "Increased analytics autonomy and reduced dependency on central teams.",
    descriptionHighlight: ['analytics autonomy'],
    metrics: [
      {
        label: "Self-Service Adoption",
        value: "80%",
        description: "Percentage of analytics created by business users"
      },
      {
        label: "Time to Insight",
        value: "70%",
        description: "Reduction in time from question to answer"
      },
      {
        label: "User Satisfaction",
        value: "90%",
        description: "Improvement in user satisfaction with analytics"
      },
      {
        label: "IT Efficiency",
        value: "60%",
        description: "Reduction in IT support requests for analytics"
      }
    ]
  },
  cta: {
    title: "Enable Analytics Autonomy",
    description: "Build self-service analytics capabilities that empower users across your organization.",
    descriptionHighlight: ['self-service analytics capabilities'],
    ctaText: "Start Autonomy Review",
    ctaHref: "/contact"
  }
};
