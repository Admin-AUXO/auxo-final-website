import type { ServiceDetail } from '../types';

export const forecastingLab: ServiceDetail = {
  slug: "forecasting-lab",
  name: "Forecasting Lab",
  shortDescription: "Build predictive models for better planning",
  icon: "mdi:crystal-ball",
  hero: {
    title: "Build Predictive Capabilities",
    subtitle: "Forecasting Lab Service",
    description: "Develop accurate forecasting models that improve planning and decision-making. We build sophisticated models for demand forecasting, financial planning, and scenario analysis using statistical and machine learning techniques.",
    descriptionHighlight: ['accurate forecasting models'],
    keyBenefits: [
      "Advanced predictive modeling",
      "Demand forecasting and planning",
      "Financial forecasting accuracy",
      "Scenario planning capabilities"
    ]
  },
  overview: {
    title: "The Value of Forecasting",
    description: "Better forecasts lead to better plans. Our Forecasting Lab builds models that predict key business metrics with greater accuracy than traditional methods, giving you a clearer view of what's ahead.",
    descriptionHighlight: ['greater accuracy'],
    challenges: [
      "Inaccurate forecasting leading to poor planning decisions",
      "Lack of sophisticated modeling capabilities",
      "Manual forecasting processes prone to bias",
      "Inability to model complex scenarios and variables"
    ],
    solutions: [
      "Advanced statistical and machine learning models",
      "Automated forecasting pipelines",
      "Scenario planning and what-if analysis",
      "Model validation and accuracy monitoring"
    ]
  },
  benefits: {
    title: "Forecasting Lab Benefits",
    description: "Make better plans based on reliable predictions of future outcomes.",
    descriptionHighlight: ['reliable predictions'],
    features: [
      {
        title: "Advanced Models",
        description: "Statistical and machine learning models tailored to your specific forecasting needs.",
        icon: "mdi:function-variant"
      },
      {
        title: "Automated Pipelines",
        description: "Forecasting processes that update automatically as new data arrives.",
        icon: "mdi:cog-play"
      },
      {
        title: "Scenario Analysis",
        description: "What-if analysis capabilities to evaluate different planning scenarios.",
        icon: "mdi:ab-testing"
      },
      {
        title: "Accuracy Monitoring",
        description: "Continuous tracking and improvement of forecast accuracy over time.",
        icon: "mdi:chart-line-variant"
      }
    ]
  },
  process: {
    title: "Forecasting Lab Process",
    description: "A 10-week program to build and deploy forecasting capabilities.",
    descriptionHighlight: ['10-week program'],
    steps: [
      {
        step: 1,
        title: "Business Requirements",
        description: "Understand forecasting needs and business objectives.",
        deliverables: [
          "Requirements document",
          "Success criteria",
          "Data requirements"
        ]
      },
      {
        step: 2,
        title: "Data Preparation",
        description: "Collect, clean, and prepare historical data for modeling.",
        deliverables: [
          "Data quality assessment",
          "Feature engineering",
          "Training datasets"
        ]
      },
      {
        step: 3,
        title: "Model Development",
        description: "Build and test multiple forecasting approaches.",
        deliverables: [
          "Model prototypes",
          "Performance comparison",
          "Model selection"
        ]
      },
      {
        step: 4,
        title: "Model Validation",
        description: "Rigorous testing and validation of selected models.",
        deliverables: [
          "Validation results",
          "Accuracy metrics",
          "Error analysis"
        ]
      },
      {
        step: 5,
        title: "Production Deployment",
        description: "Deploy models to production with monitoring and alerting.",
        deliverables: [
          "Production pipeline",
          "Monitoring dashboard",
          "Alert system"
        ]
      },
      {
        step: 6,
        title: "Integration & Training",
        description: "Integrate forecasts into business processes and train users.",
        deliverables: [
          "System integration",
          "User training",
          "Documentation"
        ]
      }
    ]
  },
  outcomes: {
    title: "Expected Results",
    description: "Improved forecasting accuracy leading to better planning outcomes.",
    descriptionHighlight: ['better planning outcomes'],
    metrics: [
      {
        label: "Forecast Accuracy",
        value: "85%+",
        description: "Improvement in forecast accuracy vs. baseline"
      },
      {
        label: "Planning Efficiency",
        value: "40%",
        description: "Reduction in planning cycle time"
      },
      {
        label: "Inventory Optimization",
        value: "25%",
        description: "Reduction in excess inventory costs"
      },
      {
        label: "Revenue Impact",
        value: "15%",
        description: "Improvement in revenue forecasting accuracy"
      }
    ]
  },
  cta: {
    title: "Build Forecasting Capabilities",
    description: "Develop predictive models that improve planning and decision-making across your organization.",
    descriptionHighlight: ['improve planning'],
    ctaText: "Launch Forecasting Lab",
    ctaHref: "/contact"
  }
};
