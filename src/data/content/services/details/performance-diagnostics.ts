import type { ServiceDetail } from '../types';

export const performanceDiagnostics: ServiceDetail = {
  slug: "performance-diagnostics",
  name: "Performance Diagnostics",
  shortDescription: "Identify and optimize performance bottlenecks",
  icon: "mdi:chart-line",
  hero: {
    title: "Optimize Analytics Performance",
    subtitle: "Performance Diagnostics Service",
    description: "Identify and resolve performance bottlenecks across your analytics stack. We analyze queries, optimize databases, and implement monitoring to ensure your analytics systems perform efficiently.",
    descriptionHighlight: ['perform efficiently'],
    keyBenefits: [
      "Query performance optimization",
      "System bottleneck identification",
      "Infrastructure tuning recommendations",
      "Performance monitoring setup"
    ]
  },
  overview: {
    title: "Performance Matters",
    description: "Slow analytics systems frustrate users and delay decisions. Our diagnostics pinpoint performance issues across your analytics infrastructure—from queries to infrastructure—and implement targeted optimizations.",
    descriptionHighlight: ['targeted optimizations'],
    challenges: [
      "Slow query performance and long report generation times",
      "Inefficient data models and query structures",
      "Infrastructure limitations and resource constraints",
      "Lack of performance monitoring and alerting"
    ],
    solutions: [
      "Comprehensive performance analysis",
      "Query optimization and tuning",
      "Infrastructure capacity planning",
      "Performance monitoring implementation"
    ]
  },
  benefits: {
    title: "Performance Optimization Benefits",
    description: "Faster analytics systems that support timely decision-making.",
    descriptionHighlight: ['timely decision-making'],
    features: [
      {
        title: "Query Optimization",
        description: "Identify and rewrite slow queries for better performance.",
        icon: "mdi:database-cog"
      },
      {
        title: "System Monitoring",
        description: "Implement performance monitoring and alerting to catch issues early.",
        icon: "mdi:monitor-eye"
      },
      {
        title: "Infrastructure Tuning",
        description: "Optimize database, server, and network configurations for analytics workloads.",
        icon: "mdi:tune"
      },
      {
        title: "Capacity Planning",
        description: "Plan infrastructure capacity based on current usage and growth projections.",
        icon: "mdi:chart-areaspline"
      }
    ]
  },
  process: {
    title: "Performance Diagnostics Process",
    description: "A focused 4-week investigation and optimization program.",
    descriptionHighlight: ['4-week investigation'],
    steps: [
      {
        step: 1,
        title: "Performance Assessment",
        description: "Comprehensive analysis of current system performance and user impact.",
        deliverables: [
          "Performance baseline",
          "User impact assessment",
          "System health report"
        ]
      },
      {
        step: 2,
        title: "Bottleneck Analysis",
        description: "Identify specific performance bottlenecks and root causes.",
        deliverables: [
          "Bottleneck identification",
          "Root cause analysis",
          "Impact prioritization"
        ]
      },
      {
        step: 3,
        title: "Optimization Planning",
        description: "Develop detailed optimization plan with implementation roadmap.",
        deliverables: [
          "Optimization strategy",
          "Implementation timeline",
          "Risk assessment"
        ]
      },
      {
        step: 4,
        title: "Implementation & Testing",
        description: "Execute optimizations and validate performance improvements.",
        deliverables: [
          "Optimized configurations",
          "Performance test results",
          "Monitoring setup"
        ]
      }
    ]
  },
  outcomes: {
    title: "Performance Improvements",
    description: "Measurable performance gains across your analytics infrastructure.",
    descriptionHighlight: ['Measurable performance gains'],
    metrics: [
      {
        label: "Query Performance",
        value: "5x",
        description: "Average improvement in query execution speed"
      },
      {
        label: "Report Generation",
        value: "60%",
        description: "Reduction in report generation time"
      },
      {
        label: "User Satisfaction",
        value: "85%",
        description: "Improvement in user experience ratings"
      },
      {
        label: "System Uptime",
        value: "99.9%",
        description: "Increase in system availability"
      }
    ]
  },
  cta: {
    title: "Improve Analytics Performance",
    description: "Identify bottlenecks and optimize your analytics systems for better performance.",
    descriptionHighlight: ['better performance'],
    ctaText: "Start Performance Diagnostics",
    ctaHref: "/contact"
  }
};
