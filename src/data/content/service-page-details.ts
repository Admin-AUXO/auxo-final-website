export interface ServicePageDetail {
  slug: string;
  name: string;
  shortDescription: string;
  category: string;
  hero: {
    title: string;
    subtitle: string;
    description: string;
    descriptionHighlight?: string | string[];
    keyBenefits: string[];
  };
  snapshot: {
    title: string;
    description: string;
    details: {
      label: string;
      value: string;
    }[];
    triggers: string[];
  };
  overview: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    challenges: string[];
    solutions: string[];
  };
  benefits: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    features: {
      title: string;
      description: string;
      icon: string;
    }[];
  };
  process: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    steps: {
      step: number;
      title: string;
      description: string;
      deliverables: string[];
    }[];
  };
  outcomes: {
    title: string;
    description: string;
    descriptionHighlight?: string | string[];
    metrics: {
      label: string;
      value: string;
      description: string;
      icon: string;
    }[];
    note: string;
  };
  faq: {
    title: string;
    description: string;
    items: {
      question: string;
      answer: string;
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

export const servicePageDetails: ServicePageDetail[] = [
  {
    slug: "foundation-readiness",
    name: "Foundation Readiness",
    shortDescription: "Audit the data foundation before dashboards, automation, or AI amplify the mess.",
    category: "Data Foundation",
    hero: {
      title: "Build the data foundation before you scale the noise",
      subtitle: "Foundation Readiness",
      description:
        "We audit your sources, definitions, governance, and platform decisions so the next analytics investment starts from an architecture the business can trust.",
      descriptionHighlight: ["architecture the business can trust"],
      keyBenefits: [
        "Current-state data audit",
        "KPI and governance gaps",
        "Target architecture options",
        "Phased implementation roadmap",
      ],
    },
    snapshot: {
      title: "Best Fit",
      description:
        "For teams preparing to invest in reporting, automation, forecasting, or AI but still arguing over source-of-truth questions.",
      details: [
        { label: "Typical scope", value: "3-6 week assessment and roadmap" },
        { label: "Primary stakeholders", value: "Ops, finance, IT, and business owners" },
        { label: "Primary output", value: "A prioritized foundation plan with decision-ready tradeoffs" },
      ],
      triggers: [
        "Dashboards keep exposing source-system contradictions.",
        "Every metric review turns into a debate about definitions.",
        "Leadership wants to spend on analytics, but nobody can defend the architecture yet.",
        "Teams are patching data issues with spreadsheets, manual exports, and local fixes.",
      ],
    },
    overview: {
      title: "Fix the substrate first",
      description:
        "Most analytics programs do not fail because the dashboard was ugly. They fail because the underlying data model, ownership, and operating rules were never settled.",
      descriptionHighlight: ["underlying data model, ownership, and operating rules"],
      challenges: [
        "Core data sits across disconnected tools with unclear ownership.",
        "Important KPIs are calculated differently by different teams.",
        "Data quality issues are discovered late, inside executive reporting.",
        "Technology decisions are being made before the delivery model is clear.",
      ],
      solutions: [
        "Map the current estate, flows, ownership, and reliability risks.",
        "Define the KPI layer and governance principles needed for trusted reporting.",
        "Evaluate platform choices against actual use cases instead of vendor theater.",
        "Sequence quick wins, dependencies, and long-range architecture decisions.",
      ],
    },
    benefits: {
      title: "What you leave with",
      description:
        "The deliverables are designed to reduce implementation risk and stop the usual rework cycle before it starts.",
      descriptionHighlight: ["reduce implementation risk"],
      features: [
        {
          title: "Data Estate Map",
          description:
            "A clear view of source systems, ownership, critical tables, handoffs, and failure points across the current stack.",
          icon: "mdi:graph-outline",
        },
        {
          title: "KPI Governance Pack",
          description:
            "Definitions, ownership rules, and review controls for the metrics that drive planning, performance, and reporting.",
          icon: "mdi:shield-check-outline",
        },
        {
          title: "Target-State Blueprint",
          description:
            "A practical architecture direction covering ingestion, modeling, access, and governance choices for the next stage.",
          icon: "mdi:file-tree",
        },
        {
          title: "90-Day Priority Plan",
          description:
            "A phased action plan that identifies what to fix now, what to pilot next, and what should wait until the foundation is stable.",
          icon: "mdi:calendar-check-outline",
        },
      ],
    },
    process: {
      title: "How the assessment runs",
      description:
        "A compact diagnostic that turns scattered technical facts into an executive-ready implementation path.",
      descriptionHighlight: ["executive-ready implementation path"],
      steps: [
        {
          step: 1,
          title: "Discovery and data landscape review",
          description:
            "We interview stakeholders, inspect the current stack, and document where data originates, moves, breaks, and gets manually corrected.",
          deliverables: ["Stakeholder map", "Current-state inventory", "Risk and dependency log"],
        },
        {
          step: 2,
          title: "KPI and governance diagnosis",
          description:
            "We isolate inconsistent business definitions, ownership gaps, and control failures that make reporting unreliable.",
          deliverables: ["Metric issue register", "Ownership matrix", "Governance gap summary"],
        },
        {
          step: 3,
          title: "Architecture options and tradeoffs",
          description:
            "We assess realistic platform patterns and recommend the one that fits your team, delivery velocity, and future use cases.",
          deliverables: ["Architecture options", "Decision criteria", "Recommendation memo"],
        },
        {
          step: 4,
          title: "Roadmap and leadership readout",
          description:
            "We package the work into a phased roadmap so leaders can align budget, sequencing, and accountability with less guesswork.",
          deliverables: ["90-day roadmap", "Investment priorities", "Executive presentation"],
        },
      ],
    },
    outcomes: {
      title: "What changes after this work",
      description:
        "The point is not another audit deck. The point is removing foundation ambiguity so delivery can move without hidden fragility.",
      descriptionHighlight: ["removing foundation ambiguity"],
      metrics: [
        {
          label: "Shared definitions",
          value: "Metric trust",
          description: "Leaders and operators stop carrying parallel KPI versions into the same meeting.",
          icon: "mdi:check-decagram-outline",
        },
        {
          label: "Lower implementation risk",
          value: "Fewer rebuilds",
          description: "Reporting, automation, and forecasting projects start from clearer dependencies and cleaner ownership.",
          icon: "mdi:alert-decagram-outline",
        },
        {
          label: "Stronger investment logic",
          value: "Better sequencing",
          description: "Platform and vendor decisions are tied to business needs instead of vague future-state promises.",
          icon: "mdi:map-marker-path",
        },
        {
          label: "Faster next-stage delivery",
          value: "Ready to build",
          description: "The team can move into implementation with a grounded roadmap instead of another round of discovery.",
          icon: "mdi:rocket-launch-outline",
        },
      ],
      note:
        "Outcome quality depends on stakeholder access, current documentation quality, and how quickly data owners can resolve open decisions.",
    },
    faq: {
      title: "Questions buyers ask before starting",
      description:
        "The usual objections are governance, scope, tooling, and whether this turns into a consulting time sink.",
      items: [
        {
          question: "Do we need to pick a warehouse or BI tool before this starts?",
          answer:
            "No. Choosing tools before clarifying ownership, metric logic, and operating constraints is how teams buy themselves rework.",
        },
        {
          question: "Is this just a strategy exercise with no implementation value?",
          answer:
            "No. You leave with priorities, dependencies, and architecture decisions that can be executed, not a vague maturity score.",
        },
        {
          question: "Can you work with an internal engineering or analytics team?",
          answer:
            "Yes. This service works best when internal owners are involved because we can validate operating reality instead of designing around assumptions.",
        },
        {
          question: "What if our documentation is poor or incomplete?",
          answer:
            "That is normal. The assessment is built to surface missing ownership, undocumented logic, and brittle handoffs, not pretend they do not exist.",
        },
      ],
    },
    cta: {
      title: "Get the foundation straight before you scale anything else",
      description:
        "If reporting, automation, or AI is on the roadmap, start by removing the structural ambiguity that will sabotage it later.",
      descriptionHighlight: ["structural ambiguity"],
      ctaText: "Discuss foundation readiness",
      ctaHref: "/contact",
    },
  },
  {
    slug: "reporting-reset",
    name: "Reporting Reset",
    shortDescription: "Replace fragmented reporting with a governed system people can actually use.",
    category: "Reporting and BI",
    hero: {
      title: "Replace brittle reporting with a system people trust",
      subtitle: "Reporting Reset",
      description:
        "We redesign the reporting layer around shared metrics, role-based dashboards, and cleaner self-serve access so decisions stop waiting on manual report assembly.",
      descriptionHighlight: ["shared metrics, role-based dashboards"],
      keyBenefits: [
        "Reporting inventory and cleanup",
        "KPI definitions that stick",
        "Executive and operator dashboards",
        "Governed self-serve rollout",
      ],
    },
    snapshot: {
      title: "Best Fit",
      description:
        "For teams buried under weekly packs, duplicate dashboards, and endless requests for one more export or one more version.",
      details: [
        { label: "Typical scope", value: "6-10 week redesign and rollout" },
        { label: "Primary stakeholders", value: "Business leads, finance, ops, analytics, and IT" },
        { label: "Primary output", value: "A streamlined dashboard and reporting operating model" },
      ],
      triggers: [
        "Reporting is split across spreadsheets, slides, PDFs, and too many BI folders.",
        "The same question gets answered by different dashboards depending on who opened them.",
        "Analysts spend more time preparing reports than interpreting them.",
        "Leaders do not trust the numbers enough to act without a side conversation.",
      ],
    },
    overview: {
      title: "Reporting debt is operating debt",
      description:
        "When reporting is slow, duplicative, or inconsistent, it wastes analyst time, slows management routines, and erodes confidence in the numbers.",
      descriptionHighlight: ["erodes confidence in the numbers"],
      challenges: [
        "Important dashboards exist in multiple versions with conflicting logic.",
        "Manual report packs are consuming analyst time every week.",
        "Executives and operators are forced into the same view despite different decisions.",
        "Users cannot self-serve without creating more metric sprawl.",
      ],
      solutions: [
        "Rationalize the report estate and remove duplicated or low-value assets.",
        "Define a consistent KPI layer and naming system across audiences.",
        "Design role-specific dashboards around decisions, not around data availability.",
        "Roll out self-serve access with controls, guardrails, and adoption support.",
      ],
    },
    benefits: {
      title: "What gets rebuilt",
      description:
        "This is not a cosmetic dashboard refresh. It is a reporting operating model reset with cleaner structure underneath.",
      descriptionHighlight: ["reporting operating model reset"],
      features: [
        {
          title: "Report Estate Cleanup",
          description:
            "A rationalized inventory of existing reports with retirement candidates, ownership updates, and migration priorities.",
          icon: "mdi:file-document-multiple-outline",
        },
        {
          title: "Metric and Semantic Layer",
          description:
            "Business-ready KPI definitions, dimensional logic, and role-based access rules that keep one question from producing three answers.",
          icon: "mdi:database-check-outline",
        },
        {
          title: "Dashboard Suite",
          description:
            "Decision-focused views for leaders, operators, and functional teams with clearer hierarchy and narrative flow.",
          icon: "mdi:view-dashboard-outline",
        },
        {
          title: "Adoption and Governance Plan",
          description:
            "Documentation, training, and ownership rules that help the new system survive contact with the business.",
          icon: "mdi:account-group-outline",
        },
      ],
    },
    process: {
      title: "How the reset is delivered",
      description:
        "We move from reporting sprawl to a tighter system that is easier to maintain and easier to read.",
      descriptionHighlight: ["reporting sprawl"],
      steps: [
        {
          step: 1,
          title: "Inventory and usage review",
          description:
            "We catalog current reports, audiences, dependencies, and known trust issues to identify what should be retired, merged, or rebuilt.",
          deliverables: ["Reporting inventory", "Usage and audience map", "Retire or rebuild list"],
        },
        {
          step: 2,
          title: "Metric alignment and model cleanup",
          description:
            "We tighten KPI logic, dimensional definitions, and source mappings so the dashboard layer rests on something coherent.",
          deliverables: ["KPI dictionary", "Source logic notes", "Metric governance decisions"],
        },
        {
          step: 3,
          title: "Dashboard redesign and prototyping",
          description:
            "We rebuild the reporting experience around real management questions and role-specific reading patterns.",
          deliverables: ["Wireframes or prototypes", "Dashboard hierarchy", "Feedback loops with stakeholders"],
        },
        {
          step: 4,
          title: "Rollout, enablement, and handoff",
          description:
            "We launch the new reporting set with ownership, usage guidance, and support routines instead of hoping adoption just happens.",
          deliverables: ["Published dashboards", "Training materials", "Runbook and ownership model"],
        },
      ],
    },
    outcomes: {
      title: "What changes after the reset",
      description:
        "The reporting layer becomes easier to trust, easier to navigate, and less dependent on analyst heroics.",
      descriptionHighlight: ["less dependent on analyst heroics"],
      metrics: [
        {
          label: "Faster answer cycles",
          value: "Less waiting",
          description: "Managers get the number they need without starting another report request thread.",
          icon: "mdi:timer-outline",
        },
        {
          label: "Cleaner executive routines",
          value: "One version",
          description: "Leadership reviews stop derailing into arguments about which dashboard is right.",
          icon: "mdi:chart-box-multiple-outline",
        },
        {
          label: "Higher self-serve confidence",
          value: "Better adoption",
          description: "Business users can explore safely without generating more metric chaos.",
          icon: "mdi:compass-outline",
        },
        {
          label: "Reduced reporting drag",
          value: "Time returned",
          description: "Analysts spend less effort rebuilding recurring packs and more effort interpreting what changed.",
          icon: "mdi:briefcase-clock-outline",
        },
      ],
      note:
        "Results depend on source-data quality, the BI platform in play, and how willing owners are to retire duplicate legacy reporting.",
    },
    faq: {
      title: "Questions that decide whether this works",
      description:
        "Most reporting projects fail on ownership, migration discipline, or adoption. Not on chart colors.",
      items: [
        {
          question: "Can you work within our existing BI stack?",
          answer:
            "Yes. We can work within the current stack when it is viable. If the tooling is part of the problem, we will say so directly and explain why.",
        },
        {
          question: "Will you migrate every legacy report?",
          answer:
            "No. Migrating every report is how reporting debt survives. We identify what is still useful, what should be merged, and what deserves to die.",
        },
        {
          question: "How do you prevent self-serve from creating more inconsistency?",
          answer:
            "By defining the KPI layer, naming rules, ownership, and access boundaries first. Self-serve without guardrails is just distributed confusion.",
        },
        {
          question: "Do you handle dashboard design as well as data logic?",
          answer:
            "Yes. Pretty reporting on top of inconsistent logic is still bad reporting.",
        },
      ],
    },
    cta: {
      title: "Reset reporting before the next quarter buries the team again",
      description:
        "If reporting cycles are slow, duplicated, or distrusted, we can rebuild the layer around decisions instead of manual rituals.",
      descriptionHighlight: ["decisions instead of manual rituals"],
      ctaText: "Discuss reporting reset",
      ctaHref: "/contact",
    },
  },
  {
    slug: "performance-diagnostics",
    name: "Performance Diagnostics",
    shortDescription: "Find the warehouse, model, and dashboard bottlenecks making analytics feel slow and fragile.",
    category: "Performance and Reliability",
    hero: {
      title: "Find the analytics bottlenecks before users abandon the stack",
      subtitle: "Performance Diagnostics",
      description:
        "We diagnose slow dashboards, bloated queries, brittle transformations, and warehouse inefficiencies so your reporting layer stops feeling expensive and sluggish.",
      descriptionHighlight: ["slow dashboards, bloated queries, brittle transformations"],
      keyBenefits: [
        "Performance baseline",
        "Root-cause analysis",
        "Optimization backlog",
        "Monitoring and guardrails",
      ],
    },
    snapshot: {
      title: "Best Fit",
      description:
        "For teams with dashboards that time out, warehouses that keep getting more expensive, or users who stopped trusting the experience because it is too slow.",
      details: [
        { label: "Typical scope", value: "2-5 week diagnostic and remediation plan" },
        { label: "Primary stakeholders", value: "Analytics engineering, BI, data platform, and ops leads" },
        { label: "Primary output", value: "A prioritized fix list backed by measured bottlenecks" },
      ],
      triggers: [
        "Dashboards load slowly or fail during high-traffic periods.",
        "Warehouse costs keep rising without a clear explanation.",
        "Pipelines finish late and downstream teams start the day behind schedule.",
        "Nobody can tell whether the real issue is SQL, modeling, infrastructure, or tool configuration.",
      ],
    },
    overview: {
      title: "Analytics performance is a trust problem",
      description:
        "Once reporting becomes slow or unstable, users stop exploring, adoption drops, and every new request feels like it might break the system again.",
      descriptionHighlight: ["users stop exploring"],
      challenges: [
        "Queries scan too much data or fight the warehouse in inefficient ways.",
        "Transformation layers have grown without clear performance discipline.",
        "Dashboards pull more data than the decision actually needs.",
        "There is little monitoring around freshness, latency, or cost spikes.",
      ],
      solutions: [
        "Measure warehouse, model, query, and dashboard performance against real usage paths.",
        "Identify the top cost and latency drivers instead of tuning blindly.",
        "Refactor high-impact queries, models, or aggregates for faster response.",
        "Add performance guardrails so the same issue does not quietly return next month.",
      ],
    },
    benefits: {
      title: "What the diagnostic produces",
      description:
        "The work is built to separate symptom from cause so the team fixes the right layer first.",
      descriptionHighlight: ["separate symptom from cause"],
      features: [
        {
          title: "Performance Baseline",
          description:
            "Measured benchmarks for dashboard latency, query behavior, transformation runtime, freshness, and cost drivers.",
          icon: "mdi:speedometer-medium",
        },
        {
          title: "Root-Cause Map",
          description:
            "A ranked view of the specific models, queries, joins, dashboard patterns, or configuration issues creating the drag.",
          icon: "mdi:map-search-outline",
        },
        {
          title: "Optimization Backlog",
          description:
            "A prioritized remediation plan that balances user pain, engineering effort, and expected impact.",
          icon: "mdi:format-list-checks",
        },
        {
          title: "Monitoring Guardrails",
          description:
            "Recommended checks and alerts for performance regressions, freshness failures, and unnecessary compute burn.",
          icon: "mdi:monitor-dashboard",
        },
      ],
    },
    process: {
      title: "How the diagnostic runs",
      description:
        "A focused engagement designed to identify the high-impact problems first instead of tuning random things and hoping.",
      descriptionHighlight: ["high-impact problems first"],
      steps: [
        {
          step: 1,
          title: "Baseline current performance",
          description:
            "We inspect usage patterns, dashboard load paths, warehouse behavior, and data pipeline timings to establish a measurable starting point.",
          deliverables: ["Baseline metrics", "Usage-path review", "Initial risk register"],
        },
        {
          step: 2,
          title: "Trace bottlenecks to root cause",
          description:
            "We isolate whether the real issue sits in SQL patterns, data models, orchestration, dashboards, or infrastructure configuration.",
          deliverables: ["Root-cause findings", "Impact ranking", "Technical evidence pack"],
        },
        {
          step: 3,
          title: "Design the fix plan",
          description:
            "We build an optimization backlog that sequences quick wins and deeper structural changes with expected tradeoffs.",
          deliverables: ["Optimization backlog", "Effort and impact matrix", "Implementation sequence"],
        },
        {
          step: 4,
          title: "Validate and harden",
          description:
            "We test recommended improvements and define the monitoring rules needed to keep the experience stable after the cleanup.",
          deliverables: ["Validation results", "Monitoring recommendations", "Performance handoff notes"],
        },
      ],
    },
    outcomes: {
      title: "What changes after the cleanup",
      description:
        "The immediate goal is faster systems. The larger goal is restoring user confidence in the analytics experience.",
      descriptionHighlight: ["restoring user confidence"],
      metrics: [
        {
          label: "Shorter load times",
          value: "Faster reads",
          description: "Dashboards and recurring reports feel responsive enough to use during live decision-making.",
          icon: "mdi:flash-outline",
        },
        {
          label: "More stable delivery",
          value: "Fewer failures",
          description: "Pipelines and refresh jobs stop introducing preventable delays into reporting cycles.",
          icon: "mdi:shield-sync-outline",
        },
        {
          label: "Lower performance waste",
          value: "Cleaner compute",
          description: "The team gets clearer visibility into where spend and scan volume are being burned for little value.",
          icon: "mdi:cash-fast",
        },
        {
          label: "Better operating discipline",
          value: "Guardrails",
          description: "Monitoring and performance ownership improve so regressions are caught before users feel them.",
          icon: "mdi:radar",
        },
      ],
      note:
        "Improvement magnitude depends on platform limits, modeling quality, and whether deeper architectural issues are in scope for remediation.",
    },
    faq: {
      title: "Questions before you diagnose the stack",
      description:
        "The main issue is usually not whether the system is slow. It is whether the team can prove where the drag actually starts.",
      items: [
        {
          question: "Can you work with our current warehouse and BI setup?",
          answer:
            "Yes. The diagnostic is designed to work with the system you already have. If the architecture itself is the issue, the findings will make that explicit.",
        },
        {
          question: "Do you only give recommendations, or can you help validate them?",
          answer:
            "We validate the major findings and can support remediation planning. Otherwise you are paying for a fancy list of suspicions.",
        },
        {
          question: "What if the issue is poor modeling rather than infrastructure?",
          answer:
            "Then that is what the diagnostic should reveal. Tuning hardware around bad models is just paying interest on a design mistake.",
        },
        {
          question: "Is this only for very large data teams?",
          answer:
            "No. Smaller teams often need it more because they feel the drag sooner and have less margin for warehouse waste or manual firefighting.",
        },
      ],
    },
    cta: {
      title: "Stop tolerating slow analytics as normal",
      description:
        "If the stack is sluggish, expensive, or fragile, we can isolate the bottlenecks and show where the fix actually belongs.",
      descriptionHighlight: ["where the fix actually belongs"],
      ctaText: "Discuss performance diagnostics",
      ctaHref: "/contact",
    },
  },
  {
    slug: "forecasting-lab",
    name: "Forecasting Lab",
    shortDescription: "Build forecasting systems your teams can actually plan from, not just model in a notebook.",
    category: "Predictive Planning",
    hero: {
      title: "Build forecasts people trust enough to plan from",
      subtitle: "Forecasting Lab",
      description:
        "We design practical forecasting systems for demand, revenue, staffing, inventory, or capacity so planning moves from reactive guesswork to defensible forward visibility.",
      descriptionHighlight: ["defensible forward visibility"],
      keyBenefits: [
        "Forecast target and horizon design",
        "Baseline and advanced models",
        "Scenario planning outputs",
        "Operational deployment plan",
      ],
    },
    snapshot: {
      title: "Best Fit",
      description:
        "For teams that already have recurring planning rituals but lack a forecasting system that is accurate, interpretable, and usable by the business.",
      details: [
        { label: "Typical scope", value: "6-12 week model and workflow build" },
        { label: "Primary stakeholders", value: "Finance, commercial, supply chain, ops, and analytics" },
        { label: "Primary output", value: "A forecasting workflow that supports real planning cycles" },
      ],
      triggers: [
        "Planning is still anchored to static budgets or recent history with minimal forward signal.",
        "Teams have built ad hoc models, but nobody operationalized them into planning routines.",
        "Forecast reviews are dominated by instinct because model assumptions are not trusted.",
        "You need scenario planning, not just a single prediction line on a chart.",
      ],
    },
    overview: {
      title: "Forecasting only matters if it changes planning",
      description:
        "A model that cannot survive real business usage is decoration. The work has to connect data, assumptions, error review, and operating decisions.",
      descriptionHighlight: ["connect data, assumptions, error review, and operating decisions"],
      challenges: [
        "Historical data is messy, incomplete, or not aligned with the planning horizon.",
        "The business wants forecasts, but not enough thought has gone into the decision they should support.",
        "Teams lack a baseline, so they cannot tell whether a complex model is actually better.",
        "Forecasts are produced once, then forgotten because ownership and review routines are weak.",
      ],
      solutions: [
        "Define the forecast target, horizon, cadence, and business decision before modeling starts.",
        "Build baselines and advanced candidates so model quality is evaluated honestly.",
        "Package forecasts into decision-ready views with confidence, assumptions, and scenario levers.",
        "Establish monitoring and review routines so the model keeps learning after launch.",
      ],
    },
    benefits: {
      title: "What gets built",
      description:
        "The output is a forecasting workflow, not just a model artifact trapped in a notebook or slide deck.",
      descriptionHighlight: ["forecasting workflow"],
      features: [
        {
          title: "Forecast Design Brief",
          description:
            "A definition of target variable, horizon, granularity, planning use case, and decision owners before feature engineering starts.",
          icon: "mdi:file-chart-outline",
        },
        {
          title: "Model Stack",
          description:
            "Baseline and champion approaches evaluated against business-relevant metrics, not just technical vanity scores.",
          icon: "mdi:chart-timeline-variant",
        },
        {
          title: "Scenario Toolkit",
          description:
            "Inputs and views that let teams explore ranges, assumptions, and intervention options instead of staring at a single deterministic output.",
          icon: "mdi:tune-variant",
        },
        {
          title: "Operational Handoff",
          description:
            "A deployment and monitoring approach so the forecast feeds real planning routines and gets reviewed when drift appears.",
          icon: "mdi:cog-transfer-outline",
        },
      ],
    },
    process: {
      title: "How the lab runs",
      description:
        "We move from planning use case to forecast deployment with an emphasis on interpretability and operational fit.",
      descriptionHighlight: ["interpretability and operational fit"],
      steps: [
        {
          step: 1,
          title: "Define the planning question",
          description:
            "We lock the business use case, forecast horizon, granularity, review cadence, and owner expectations before touching model choice.",
          deliverables: ["Use-case brief", "Forecast target definition", "Success criteria"],
        },
        {
          step: 2,
          title: "Prepare data and baselines",
          description:
            "We clean historical inputs, assess signal quality, and establish baseline methods so model improvement can be measured honestly.",
          deliverables: ["Data quality review", "Feature candidates", "Baseline models"],
        },
        {
          step: 3,
          title: "Build and compare forecasting approaches",
          description:
            "We test model candidates, compare error behavior, and identify the level of complexity the business can actually support.",
          deliverables: ["Candidate model results", "Error analysis", "Champion recommendation"],
        },
        {
          step: 4,
          title: "Operationalize the forecast",
          description:
            "We package outputs into planning views, scenario tools, and monitoring routines so the forecast stays useful after launch.",
          deliverables: ["Scenario views", "Monitoring rules", "Business handoff pack"],
        },
      ],
    },
    outcomes: {
      title: "What changes after forecasting is operationalized",
      description:
        "Teams gain a forward-looking planning discipline instead of reacting after the damage is already visible in the numbers.",
      descriptionHighlight: ["forward-looking planning discipline"],
      metrics: [
        {
          label: "Earlier signals",
          value: "Better lead time",
          description: "Commercial, finance, or operations teams can see demand or capacity movement sooner and act with more room.",
          icon: "mdi:timeline-clock-outline",
        },
        {
          label: "More credible planning",
          value: "Defensible assumptions",
          description: "Forecast reviews shift from opinion contests toward explicit assumptions, ranges, and error conversations.",
          icon: "mdi:clipboard-check-outline",
        },
        {
          label: "Scenario-ready decisions",
          value: "Range thinking",
          description: "Leaders can compare interventions and downside cases instead of planning around a single static number.",
          icon: "mdi:chart-box-outline",
        },
        {
          label: "Sustainable model ownership",
          value: "Review cadence",
          description: "The business has a clearer routine for monitoring drift, retraining logic, and updating assumptions over time.",
          icon: "mdi:refresh-circle",
        },
      ],
      note:
        "Forecast quality depends heavily on historical signal quality, planning discipline, and whether the business is willing to review errors honestly.",
    },
    faq: {
      title: "Questions before building a forecasting system",
      description:
        "Buyers usually ask about data quality, explainability, and whether the output will survive contact with the business calendar.",
      items: [
        {
          question: "Do we need perfect historical data to start?",
          answer:
            "No. Perfect data is fiction. But we do need enough signal, enough context, and enough honesty about gaps to choose the right forecasting approach.",
        },
        {
          question: "Can you build something interpretable for non-technical teams?",
          answer:
            "Yes. If the forecast cannot be explained well enough for planning teams to challenge it intelligently, adoption will collapse.",
        },
        {
          question: "Will this work for scenario planning, not just point forecasts?",
          answer:
            "Yes. In many planning environments, scenario handling matters more than squeezing out marginal accuracy gains on a single predicted value.",
        },
        {
          question: "What happens after the model is launched?",
          answer:
            "There needs to be review cadence, drift checks, and owner accountability. Otherwise the forecast decays quietly and nobody notices until trust is gone.",
        },
      ],
    },
    cta: {
      title: "Put forecasting into the planning loop, not just the analytics backlog",
      description:
        "If the business needs forward visibility, we can design a forecast that supports real decisions, not just model demos.",
      descriptionHighlight: ["supports real decisions"],
      ctaText: "Discuss forecasting lab",
      ctaHref: "/contact",
    },
  },
  {
    slug: "decision-playbooks",
    name: "Decision Playbooks",
    shortDescription: "Turn recurring high-stakes choices into repeatable decision systems with explicit criteria.",
    category: "Decision Intelligence",
    hero: {
      title: "Turn recurring judgment calls into repeatable decision systems",
      subtitle: "Decision Playbooks",
      description:
        "We structure pricing, targeting, allocation, approval, and portfolio decisions into transparent playbooks so teams move faster with less noise and better evidence.",
      descriptionHighlight: ["transparent playbooks"],
      keyBenefits: [
        "Decision inventory and prioritization",
        "Criteria and rule design",
        "Data inputs and thresholds",
        "Operating playbook rollout",
      ],
    },
    snapshot: {
      title: "Best Fit",
      description:
        "For organizations making the same high-value decisions repeatedly, but with inconsistent logic across people, regions, or business units.",
      details: [
        { label: "Typical scope", value: "4-8 week decision-system design" },
        { label: "Primary stakeholders", value: "Commercial, ops, finance, and functional owners" },
        { label: "Primary output", value: "A documented playbook tied to data, thresholds, and actions" },
      ],
      triggers: [
        "Pricing or allocation decisions depend too much on whoever is in the room.",
        "Teams escalate routine calls because criteria are vague or inconsistent.",
        "Decision quality varies across regions, managers, or channels.",
        "Leaders want more consistency without stripping away necessary business judgment.",
      ],
    },
    overview: {
      title: "Standardization beats improvisation when the stakes repeat",
      description:
        "Not every decision should be automated, but recurring high-value decisions should stop depending on mood, memory, or who spoke last.",
      descriptionHighlight: ["mood, memory, or who spoke last"],
      challenges: [
        "Critical decisions are being made with inconsistent criteria and weak documentation.",
        "Data inputs exist, but they are not translated into action thresholds or guardrails.",
        "Exceptions are common because the standard process is too vague to follow.",
        "There is little ability to review why a past decision was made or whether it was any good.",
      ],
      solutions: [
        "Identify the decisions worth standardizing based on volume, value, and risk.",
        "Define criteria, thresholds, evidence, and escalation points clearly.",
        "Connect decision steps to the necessary data, roles, and approval flows.",
        "Create a playbook teams can actually use inside routine operations.",
      ],
    },
    benefits: {
      title: "What the playbook includes",
      description:
        "The goal is to make recurring decisions faster and more defensible without turning the business into a robot.",
      descriptionHighlight: ["faster and more defensible"],
      features: [
        {
          title: "Decision Inventory",
          description:
            "A prioritized list of recurring choices where better structure will improve speed, consistency, or margin.",
          icon: "mdi:playlist-check",
        },
        {
          title: "Criteria Framework",
          description:
            "Explicit rules, thresholds, and exception paths that convert vague judgment into a repeatable operating method.",
          icon: "mdi:scale-balance",
        },
        {
          title: "Data and Trigger Inputs",
          description:
            "A mapping of the signals, metrics, and thresholds each decision needs in order to be made cleanly.",
          icon: "mdi:database-arrow-right-outline",
        },
        {
          title: "Operational Playbook",
          description:
            "A usable guide for teams that links decision steps, ownership, escalation, and documentation standards.",
          icon: "mdi:book-open-variant-outline",
        },
      ],
    },
    process: {
      title: "How the playbook gets built",
      description:
        "We move from messy decision reality to a practical framework teams can follow under pressure.",
      descriptionHighlight: ["practical framework"],
      steps: [
        {
          step: 1,
          title: "Select the target decisions",
          description:
            "We identify which recurring choices are worth structuring first based on business value, inconsistency, and operational pain.",
          deliverables: ["Decision shortlist", "Prioritization criteria", "Stakeholder alignment"],
        },
        {
          step: 2,
          title: "Map how decisions are made today",
          description:
            "We document current inputs, unwritten rules, bottlenecks, and escalation patterns to understand where inconsistency enters.",
          deliverables: ["Current-state flow", "Failure modes", "Decision pain points"],
        },
        {
          step: 3,
          title: "Design the playbook logic",
          description:
            "We define rules, thresholds, evidence requirements, and exception paths that balance speed with needed judgment.",
          deliverables: ["Decision criteria", "Threshold logic", "Exception handling model"],
        },
        {
          step: 4,
          title: "Roll into operations",
          description:
            "We package the logic into a usable operating tool, guide, or workflow so the team can apply it consistently.",
          deliverables: ["Playbook artifact", "Owner responsibilities", "Rollout guidance"],
        },
      ],
    },
    outcomes: {
      title: "What changes after the playbook is live",
      description:
        "The business gets faster, more legible decision-making without pretending every choice should be fully automated.",
      descriptionHighlight: ["more legible decision-making"],
      metrics: [
        {
          label: "Cleaner decisions",
          value: "Explicit criteria",
          description: "Teams know what evidence matters and when an exception should be escalated instead of improvised.",
          icon: "mdi:clipboard-text-clock-outline",
        },
        {
          label: "Faster turnaround",
          value: "Less friction",
          description: "Routine decisions require less back-and-forth because the threshold logic is already documented.",
          icon: "mdi:run-fast",
        },
        {
          label: "More consistent execution",
          value: "Across teams",
          description: "Regions or managers stop applying different logic to the same category of decision.",
          icon: "mdi:relation-many-to-many",
        },
        {
          label: "Stronger reviewability",
          value: "Decision trail",
          description: "Leaders can look back at what was decided, why it was decided, and where the framework needs refinement.",
          icon: "mdi:file-search-outline",
        },
      ],
      note:
        "The strongest gains happen when owners are willing to expose unwritten rules and refine them instead of defending their current local workarounds.",
    },
    faq: {
      title: "Questions before standardizing decisions",
      description:
        "The main fear is usually that structure will remove useful judgment. The real problem is unexamined inconsistency.",
      items: [
        {
          question: "Will this over-standardize decisions that still need human judgment?",
          answer:
            "No. The point is to clarify where judgment belongs and where it is just compensating for missing criteria. Good playbooks preserve discretion where it matters.",
        },
        {
          question: "Can this feed automation later?",
          answer:
            "Yes. Playbooks often become the bridge to smarter automation because they define the rules, thresholds, and exception paths first.",
        },
        {
          question: "What types of decisions are a good fit?",
          answer:
            "High-frequency, high-value decisions with recurring inputs are usually strongest candidates. Rare one-off strategic calls are not.",
        },
        {
          question: "Do you need lots of data to do this well?",
          answer:
            "You need enough data to support the decision, but clarity of criteria matters just as much. Plenty of teams have data and still make bad calls because the logic is fuzzy.",
        },
      ],
    },
    cta: {
      title: "Give recurring decisions a structure strong enough to survive pressure",
      description:
        "If important decisions keep turning into ad hoc negotiations, we can turn them into a more consistent operating system.",
      descriptionHighlight: ["more consistent operating system"],
      ctaText: "Discuss decision playbooks",
      ctaHref: "/contact",
    },
  },
  {
    slug: "smart-automation",
    name: "Smart Automation",
    shortDescription: "Automate repetitive analytics work so the team stops paying skilled people to move data by hand.",
    category: "Workflow Automation",
    hero: {
      title: "Automate the analytics work that should never be manual twice",
      subtitle: "Smart Automation",
      description:
        "We identify repetitive reporting, data prep, and monitoring routines, then turn them into reliable workflows with clear exception handling and ownership.",
      descriptionHighlight: ["reliable workflows with clear exception handling"],
      keyBenefits: [
        "Workflow inventory",
        "Pipeline and reporting automation",
        "Alerting and exception handling",
        "Operational handoff",
      ],
    },
    snapshot: {
      title: "Best Fit",
      description:
        "For teams still spending serious time on repetitive exports, spreadsheet stitching, recurring QA checks, or manual report distribution.",
      details: [
        { label: "Typical scope", value: "4-10 week automation build" },
        { label: "Primary stakeholders", value: "Analytics, ops, finance, and platform owners" },
        { label: "Primary output", value: "Production-safe workflows with monitoring and handoff" },
      ],
      triggers: [
        "Analysts are repeatedly performing the same preparation or delivery steps every week.",
        "Critical workflows depend on one person remembering the sequence.",
        "Reporting delays happen because one upstream handoff was late or missed.",
        "The team wants automation but cannot afford brittle scripts nobody owns.",
      ],
    },
    overview: {
      title: "Manual analytics work does not scale politely",
      description:
        "At first it looks manageable. Then reporting volume grows, people add local fixes, and the operating model starts relying on memory and heroics.",
      descriptionHighlight: ["memory and heroics"],
      challenges: [
        "Recurring workflows depend on manual exports, copy-paste steps, or calendar reminders.",
        "Automation exists in fragments, but nobody monitors it properly.",
        "Exception handling is weak, so failures are discovered after stakeholders are already waiting.",
        "Ownership is unclear when workflows cross analytics, operations, and source-system teams.",
      ],
      solutions: [
        "Map the current workflow and remove the highest-friction manual steps first.",
        "Design production-safe automation with monitoring, retries, and ownership.",
        "Automate reporting and pipeline routines around real SLAs and exception paths.",
        "Document the operating model so the team can maintain the system after launch.",
      ],
    },
    benefits: {
      title: "What gets automated",
      description:
        "The work focuses on repeated, high-friction analytics routines where automation creates reliable leverage instead of new fragility.",
      descriptionHighlight: ["reliable leverage"],
      features: [
        {
          title: "Workflow Inventory and Priorities",
          description:
            "A map of recurring manual routines with effort, risk, and automation potential ranked against business value.",
          icon: "mdi:vector-arrange-above",
        },
        {
          title: "Pipeline and Report Automation",
          description:
            "Automated steps for ingestion, preparation, report generation, distribution, and recurring business checks.",
          icon: "mdi:robot-outline",
        },
        {
          title: "Monitoring and Exceptions",
          description:
            "Alerting, failure paths, and operator visibility so issues are caught early and handled without chaos.",
          icon: "mdi:alarm-light-outline",
        },
        {
          title: "Handoff and Ownership Model",
          description:
            "Documentation and responsibilities that keep the automation estate from becoming another orphaned technical side project.",
          icon: "mdi:account-cog-outline",
        },
      ],
    },
    process: {
      title: "How automation gets implemented",
      description:
        "We start with workflow reality, not tool hype, and design automations that survive routine operational use.",
      descriptionHighlight: ["workflow reality"],
      steps: [
        {
          step: 1,
          title: "Identify the best automation candidates",
          description:
            "We find the recurring analytics tasks creating the most friction, delay, and manual error risk.",
          deliverables: ["Workflow inventory", "Automation priority list", "Risk profile"],
        },
        {
          step: 2,
          title: "Design the operating pattern",
          description:
            "We define data dependencies, triggers, exception paths, owners, and the right level of automation for each routine.",
          deliverables: ["Workflow design", "Ownership map", "Exception logic"],
        },
        {
          step: 3,
          title: "Build and test the workflows",
          description:
            "We implement the automations with validation, monitoring, and enough transparency for the team to trust the outputs.",
          deliverables: ["Automated workflows", "Validation results", "Monitoring setup"],
        },
        {
          step: 4,
          title: "Roll out and hand over",
          description:
            "We move the workflows into day-to-day use with runbooks, owner guidance, and post-launch support expectations.",
          deliverables: ["Runbooks", "Owner handoff", "Support guidance"],
        },
      ],
    },
    outcomes: {
      title: "What changes after the workflows are automated",
      description:
        "The team gets time back, but more importantly the operating model becomes less fragile and less dependent on memory.",
      descriptionHighlight: ["less fragile"],
      metrics: [
        {
          label: "Time returned to analysts",
          value: "Less repetition",
          description: "Skilled people stop spending their week moving the same data through the same manual sequence.",
          icon: "mdi:clock-check-outline",
        },
        {
          label: "Lower manual error risk",
          value: "Cleaner delivery",
          description: "Routine reporting and data prep become more consistent because the workflow is executed the same way every time.",
          icon: "mdi:shield-alert-outline",
        },
        {
          label: "More reliable deadlines",
          value: "Better SLAs",
          description: "Stakeholders are less exposed to missed handoffs or hidden last-minute fixes before a report goes out.",
          icon: "mdi:calendar-clock-outline",
        },
        {
          label: "Clearer operational ownership",
          value: "Sustainable upkeep",
          description: "The automation layer has defined monitors, responders, and maintenance expectations instead of mystery custody.",
          icon: "mdi:account-switch-outline",
        },
      ],
      note:
        "Automation quality depends on process discipline, system access, and whether the current workflow is worth preserving at all before automating it.",
    },
    faq: {
      title: "Questions before automating analytics work",
      description:
        "The right question is not whether something can be automated. It is whether it should be automated in its current form.",
      items: [
        {
          question: "Can you automate workflows without replacing our whole stack?",
          answer:
            "Yes. Most automation work should start by improving the existing flow and only replacing tools when the current ones are genuinely blocking the result.",
        },
        {
          question: "How do you avoid building brittle automations?",
          answer:
            "By designing for validation, monitoring, exception handling, and ownership up front. A script with no operator model is not a solution.",
        },
        {
          question: "What kinds of tasks are the strongest candidates?",
          answer:
            "High-frequency, rules-based analytics routines with clear triggers and repetitive manual effort are usually the first targets.",
        },
        {
          question: "Will this reduce the need for analysts?",
          answer:
            "It should reduce the need for analysts to do low-value repetitive work. You keep the judgment and cut the drudgery.",
        },
      ],
    },
    cta: {
      title: "Automate the drudge work without creating a new reliability problem",
      description:
        "If recurring analytics workflows are soaking up skilled time, we can turn them into cleaner operational systems.",
      descriptionHighlight: ["cleaner operational systems"],
      ctaText: "Discuss smart automation",
      ctaHref: "/contact",
    },
  },
  {
    slug: "augmented-intelligence-studio",
    name: "Augmented Intelligence Studio",
    shortDescription: "Apply AI where it improves analytical throughput and decision quality, not where it adds theater.",
    category: "Applied AI",
    hero: {
      title: "Use AI where it sharpens analysis, not where it adds theater",
      subtitle: "Augmented Intelligence Studio",
      description:
        "We design practical AI workflows for retrieval, summarization, classification, recommendation, and analyst support with data readiness, governance, and production fit built in.",
      descriptionHighlight: ["practical AI workflows"],
      keyBenefits: [
        "Use-case prioritization",
        "Data and readiness assessment",
        "Pilot workflow design",
        "Guardrails and production path",
      ],
    },
    snapshot: {
      title: "Best Fit",
      description:
        "For teams under pressure to use AI, but unwilling to ship a gimmick that breaks trust, leaks data, or produces work nobody can rely on.",
      details: [
        { label: "Typical scope", value: "4-10 week AI use-case sprint or pilot" },
        { label: "Primary stakeholders", value: "Analytics, product, ops, risk, and leadership" },
        { label: "Primary output", value: "A prioritized AI use-case path with pilot-ready design" },
      ],
      triggers: [
        "Leadership wants AI, but the business problem is still fuzzy.",
        "Teams have promising ideas but weak data readiness or no governance path.",
        "Analysts are overloaded with repetitive research, triage, or synthesis work.",
        "You need a hard-nosed filter for where AI adds leverage and where it is just noise.",
      ],
    },
    overview: {
      title: "Applied AI needs operating discipline",
      description:
        "The hard part is not generating a demo. It is choosing the right use case, constraining the failure modes, and integrating the result into real workflows.",
      descriptionHighlight: ["choosing the right use case"],
      challenges: [
        "Teams are jumping to model selection before defining the workflow or user need.",
        "The available data is messy, incomplete, or governed too loosely for safe deployment.",
        "AI outputs cannot be trusted yet, but nobody has defined fallback behavior or review paths.",
        "There is pressure to show movement quickly, even when the use case is weak.",
      ],
      solutions: [
        "Prioritize AI use cases based on business value, feasibility, and operating risk.",
        "Assess the data foundation, human review points, and governance requirements early.",
        "Design pilots around bounded workflows where quality can be measured and monitored.",
        "Define a path from experiment to production that includes control, auditability, and ownership.",
      ],
    },
    benefits: {
      title: "What the studio delivers",
      description:
        "The aim is not to spray AI across the org chart. The aim is to find the workflows where it improves throughput without wrecking trust.",
      descriptionHighlight: ["improves throughput without wrecking trust"],
      features: [
        {
          title: "Use-Case Shortlist",
          description:
            "A ranked portfolio of realistic AI opportunities with value, feasibility, data needs, and risk considerations laid out clearly.",
          icon: "mdi:lightbulb-on-outline",
        },
        {
          title: "Readiness and Guardrail Review",
          description:
            "An assessment of data quality, access, review requirements, privacy constraints, and failure-risk boundaries for each candidate workflow.",
          icon: "mdi:shield-search",
        },
        {
          title: "Pilot Workflow Design",
          description:
            "A practical design for the first pilot, including user flow, prompts or logic, evaluation criteria, and human-in-the-loop controls.",
          icon: "mdi:brain",
        },
        {
          title: "Production Path",
          description:
            "A plan for ownership, monitoring, adoption, and technical integration if the pilot clears the bar and deserves to scale.",
          icon: "mdi:vector-polyline-plus",
        },
      ],
    },
    process: {
      title: "How the studio engagement runs",
      description:
        "We move from AI ambition to a bounded, testable workflow that has a chance of surviving production reality.",
      descriptionHighlight: ["bounded, testable workflow"],
      steps: [
        {
          step: 1,
          title: "Prioritize use cases",
          description:
            "We identify where AI could create leverage and remove the ideas that are too vague, too risky, or too weak to deserve a pilot.",
          deliverables: ["Use-case inventory", "Prioritization matrix", "Pilot shortlist"],
        },
        {
          step: 2,
          title: "Assess readiness and constraints",
          description:
            "We inspect data accessibility, workflow fit, privacy constraints, and review needs so the pilot design starts grounded.",
          deliverables: ["Readiness assessment", "Risk controls", "Data requirement notes"],
        },
        {
          step: 3,
          title: "Design and test the pilot",
          description:
            "We specify the workflow, evaluation criteria, prompt or logic structure, and human review pattern needed for a credible pilot.",
          deliverables: ["Pilot design", "Evaluation criteria", "Workflow prototype or spec"],
        },
        {
          step: 4,
          title: "Define the production path",
          description:
            "If the pilot earns the right to continue, we outline the integration, ownership, governance, and monitoring path needed to scale it responsibly.",
          deliverables: ["Go or no-go recommendation", "Production roadmap", "Ownership model"],
        },
      ],
    },
    outcomes: {
      title: "What changes when AI is applied with discipline",
      description:
        "You get clearer leverage points, safer pilots, and a stronger filter for what deserves investment versus what should be killed quickly.",
      descriptionHighlight: ["stronger filter"],
      metrics: [
        {
          label: "Better use-case selection",
          value: "Less hype",
          description: "The business stops chasing vague AI ideas and starts investing in workflows with measurable operational value.",
          icon: "mdi:filter-check-outline",
        },
        {
          label: "Higher analytical throughput",
          value: "Faster support",
          description: "Analysts and operators can offload bounded synthesis, search, or triage tasks without losing control.",
          icon: "mdi:rocket-outline",
        },
        {
          label: "Safer experimentation",
          value: "Guardrails",
          description: "Risk, privacy, and review expectations are built into the pilot instead of bolted on after a problem appears.",
          icon: "mdi:lock-check-outline",
        },
        {
          label: "Clearer production decisions",
          value: "Go or stop",
          description: "The team gets an evidence-based path for whether to scale, redesign, or kill the use case.",
          icon: "mdi:source-branch-check",
        },
      ],
      note:
        "AI outcomes depend on data readiness, workflow fit, evaluation rigor, and whether the team is willing to say no to weak use cases.",
    },
    faq: {
      title: "Questions before anyone says 'AI strategy' again",
      description:
        "The real questions are about use-case quality, governance, and whether the workflow will be better after AI is added.",
      items: [
        {
          question: "Do we need a mature data platform before doing any AI work?",
          answer:
            "Not always, but weak data and unclear ownership limit what can be deployed safely. The point of the assessment is to find the realistic ceiling before money gets wasted.",
        },
        {
          question: "Can you help decide whether we even have a good AI use case?",
          answer:
            "Yes. That is one of the main reasons this service exists. Most organizations have more AI enthusiasm than valid workflow candidates.",
        },
        {
          question: "Do you only build generative AI use cases?",
          answer:
            "No. We look at the workflow first. Sometimes retrieval, classification, rules, or conventional ML create a better outcome than a chat interface.",
        },
        {
          question: "How do you handle trust and review for AI outputs?",
          answer:
            "By defining quality checks, reviewer roles, fallback behavior, and constraints before rollout. Blind trust in model output is not a strategy.",
        },
      ],
    },
    cta: {
      title: "Find the AI workflows worth building and kill the weak ones early",
      description:
        "If the organization wants practical AI, we can separate real leverage from expensive theater and design a safer path forward.",
      descriptionHighlight: ["real leverage from expensive theater"],
      ctaText: "Discuss augmented intelligence",
      ctaHref: "/contact",
    },
  },
  {
    slug: "autonomy-readiness-review",
    name: "Autonomy Readiness Review",
    shortDescription: "Prepare the business for self-serve analytics without creating uncontrolled metric sprawl.",
    category: "Enablement and Governance",
    hero: {
      title: "Prepare the business for self-serve analytics without losing control",
      subtitle: "Autonomy Readiness Review",
      description:
        "We assess whether your teams, tools, governance, and operating habits are ready for broader analytics ownership so self-serve becomes useful instead of chaotic.",
      descriptionHighlight: ["useful instead of chaotic"],
      keyBenefits: [
        "Readiness scorecard",
        "Governance and ownership model",
        "Enablement plan",
        "Rollout blueprint",
      ],
    },
    snapshot: {
      title: "Best Fit",
      description:
        "For organizations trying to expand analytics access, but wary of shadow dashboards, uncontrolled definitions, and low adoption after the launch push.",
      details: [
        { label: "Typical scope", value: "3-6 week readiness review and rollout plan" },
        { label: "Primary stakeholders", value: "Analytics leaders, business owners, IT, and enablement teams" },
        { label: "Primary output", value: "A readiness verdict with governance and adoption actions" },
      ],
      triggers: [
        "Leadership wants broader self-serve, but current reporting discipline is weak.",
        "Business teams ask for more access, yet analytics fears another wave of metric sprawl.",
        "Tooling exists, but adoption is shallow and concentrated in a few power users.",
        "The organization needs a realistic answer on whether it is ready to decentralize more analysis.",
      ],
    },
    overview: {
      title: "Self-serve fails when governance is treated as optional",
      description:
        "Giving more people access to data only helps if the organization also clarifies metric logic, ownership, support, training, and escalation paths.",
      descriptionHighlight: ["metric logic, ownership, support, training"],
      challenges: [
        "Teams want independence, but shared definitions and access rules are not mature enough yet.",
        "Tool rollout is being confused with operating readiness.",
        "Training is inconsistent, so users either overreach or disengage.",
        "Ownership of certified content, support, and exceptions is unclear.",
      ],
      solutions: [
        "Assess readiness across tooling, governance, content quality, and user capability.",
        "Define where self-serve should expand and where centralized control still matters.",
        "Design a governance and ownership model that supports safe access at scale.",
        "Create an enablement plan that links training, adoption, and support routines.",
      ],
    },
    benefits: {
      title: "What the review delivers",
      description:
        "The goal is a realistic readiness call and a plan that helps the organization scale access without detonating trust.",
      descriptionHighlight: ["realistic readiness call"],
      features: [
        {
          title: "Readiness Scorecard",
          description:
            "A structured view of current capability across governance, tooling, content quality, ownership, and user behavior.",
          icon: "mdi:clipboard-list-outline",
        },
        {
          title: "Governance Model",
          description:
            "Recommended ownership rules, certification logic, and escalation paths for expanding self-serve responsibly.",
          icon: "mdi:gavel",
        },
        {
          title: "Enablement Plan",
          description:
            "Training and support actions tailored to the maturity of different user groups instead of one generic launch deck.",
          icon: "mdi:school-outline",
        },
        {
          title: "Rollout Blueprint",
          description:
            "A staged rollout approach that shows where to expand self-serve first and what conditions must be met before wider release.",
          icon: "mdi:account-network",
        },
      ],
    },
    process: {
      title: "How the readiness review runs",
      description:
        "We test whether the organization is ready for more autonomy, then define the changes needed if the answer is not yet.",
      descriptionHighlight: ["if the answer is not yet"],
      steps: [
        {
          step: 1,
          title: "Assess the current operating model",
          description:
            "We review tooling, content ownership, access patterns, governance habits, and how business users currently interact with analytics.",
          deliverables: ["Current-state review", "Stakeholder interviews", "Readiness findings"],
        },
        {
          step: 2,
          title: "Identify the blockers to safe self-serve",
          description:
            "We isolate where metric inconsistency, weak controls, or low capability would undermine broader autonomy.",
          deliverables: ["Risk areas", "Capability gaps", "Governance weaknesses"],
        },
        {
          step: 3,
          title: "Design the readiness plan",
          description:
            "We define the governance, enablement, and ownership actions needed before or alongside wider self-serve rollout.",
          deliverables: ["Governance actions", "Enablement plan", "Rollout criteria"],
        },
        {
          step: 4,
          title: "Package the rollout blueprint",
          description:
            "We turn the findings into a phased plan that leadership can use to sequence autonomy expansion responsibly.",
          deliverables: ["Rollout blueprint", "Decision checkpoints", "Leadership readout"],
        },
      ],
    },
    outcomes: {
      title: "What changes when autonomy is approached responsibly",
      description:
        "The organization gains a clearer path to self-serve adoption without treating governance, support, and metric discipline as afterthoughts.",
      descriptionHighlight: ["clearer path to self-serve adoption"],
      metrics: [
        {
          label: "Better readiness decisions",
          value: "Go with eyes open",
          description: "Leadership gets a realistic view of whether the org is ready for broader self-serve and what still needs work.",
          icon: "mdi:eye-check-outline",
        },
        {
          label: "Stronger governance",
          value: "Control retained",
          description: "Certified content, ownership, and exception handling are clarified before access expands further.",
          icon: "mdi:shield-account-outline",
        },
        {
          label: "More usable enablement",
          value: "Adoption support",
          description: "Training and support are matched to user maturity instead of dumped into a one-size-fits-all rollout.",
          icon: "mdi:human-greeting-variant",
        },
        {
          label: "Lower self-serve chaos",
          value: "Less sprawl",
          description: "The business can move toward autonomy without multiplying shadow dashboards and conflicting metrics.",
          icon: "mdi:vector-difference-ab",
        },
      ],
      note:
        "Readiness quality depends on the current state of KPI discipline, tool configuration, and whether business owners accept shared governance responsibilities.",
    },
    faq: {
      title: "Questions before broadening analytics autonomy",
      description:
        "The real concern is not access. It is whether more access will improve decisions or just distribute confusion faster.",
      items: [
        {
          question: "Does self-serve mean every team should build its own dashboards?",
          answer:
            "No. Good self-serve expands access to trusted content and bounded exploration. It does not mean turning the metric layer into a free-for-all.",
        },
        {
          question: "Can this review tell us we are not ready yet?",
          answer:
            "Yes. That is part of the value. A fake green light helps nobody if governance and content quality are still weak.",
        },
        {
          question: "What if adoption is the bigger issue than tooling?",
          answer:
            "Then the review should show that. Tool capability and organizational capability are not the same thing, and teams confuse them constantly.",
        },
        {
          question: "Can this work alongside an existing BI program?",
          answer:
            "Yes. In many cases it should. This review is often the missing operating-model layer around a BI platform that already exists.",
        },
      ],
    },
    cta: {
      title: "Expand self-serve only when the organization can support it",
      description:
        "If broader analytics access is the goal, we can assess the readiness honestly and define the controls that keep trust intact.",
      descriptionHighlight: ["keep trust intact"],
      ctaText: "Discuss autonomy readiness",
      ctaHref: "/contact",
    },
  },
];

export function getServicePageDetailBySlug(slug: string) {
  if (!slug) return null;
  return servicePageDetails.find((service) => service.slug === slug) || null;
}
