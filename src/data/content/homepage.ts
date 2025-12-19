export interface ProcessStep {
  number: number;
  icon: string;
  title: string;
  description: string;
  descriptionHighlight?: string | string[];
  output?: string;
}

export interface CapabilityCard {
  icon: string;
  title: string;
  description: string;
  descriptionHighlight?: string | string[];
  metric: string;
}

export interface ServiceIntroItem {
  number: string;
  icon: string;
  title: string;
  description: string;
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
    cards: CapabilityCard[];
  };
  servicesIntro: {
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
  problem: {
    valueProposition: string;
  };
}

export const homepageContent: HomepageContent = {
  hero: {
    title: 'Intelligence,',
    titleHighlight: 'Engineered.',
    subtitle: 'AUXO delivers end-to-end DAAS — Data Analytics as a Service tailored to your organisation.',
    subtitleHighlight: ['DAAS', 'Data Analytics as a Service'],
    primaryCta: {
      text: 'Book a discovery call',
      href: '/contact/',
    },
    scrollIndicator: 'Scroll More',
  },
  problem: {
    valueProposition: 'Most companies collect data. Few convert it into decisions.\n\nAUXO bridges the gap — connecting business understanding with data intelligence.',
  },
  finalCta: {
    title: 'Find your next step',
    subtitle: 'Book a 30-minute discovery call.',
    ctaText: 'Book a discovery call',
    ctaHref: '/contact/',
    body: "Share your goals, current challenges, and timelines. You'll leave with a concise view of where analytics can create the most impact and what to do first—before you commit to anything.",
    bodyHighlight: ['most impact', 'what to do first'],
    reassuranceLine: 'No sales pitch—just a structured discussion and clear next steps.',
  },
  methodology: {
    title: 'AUXO',
    titleHighlight: 'Edge',
    subtitle: 'A practical four-step model',
    steps: [
      {
        number: 1,
        icon: 'mdi:database-search',
        title: 'Explore',
        description: 'Explore the problem space, the decisions that matter most, and the realities of your data.',
        descriptionHighlight: ['decisions that matter most'],
        output: 'Discovery\nDocument',
      },
      {
        number: 2,
        icon: 'mdi:palette',
        title: 'Design',
        description: 'Design the analytics strategy, architecture, and end‑user experience to support those decisions.',
        descriptionHighlight: ['analytics strategy'],
        output: 'Technical\nSpecification',
      },
      {
        number: 3,
        icon: 'mdi:rocket-launch',
        title: 'Generate',
        description: 'Generate the solutions—pipelines, models, dashboards, and automations—that run in your real environment.',
        descriptionHighlight: ['pipelines, models, dashboards'],
        output: 'Production\nCodebase',
      },
      {
        number: 4,
        icon: 'mdi:account-group-outline',
        title: 'Embed',
        description: 'Embed these capabilities through training, governance, and change management so they become part of everyday work.',
        descriptionHighlight: ['training, governance'],
        output: 'Training &\nHandoff',
      },
    ],
    navigationButton: {
      text: 'Learn about our approach',
      href: '/about/',
    },
  },
  capabilities: {
    title: 'Six Core Capabilities',
    subheading: 'Six disciplines powering every project.',
    cards: [
      {
        icon: 'mdi:compass-outline',
        title: 'Strategy Blueprint',
        description: 'Identifying where analytics creates value and building actionable roadmaps.',
        descriptionHighlight: ['creates value'],
        metric: '3x faster\ntime‑to‑insights',
      },
      {
        icon: 'mdi:server-network',
        title: 'Data Foundations',
        description: 'Designing and implementing cloud data platforms, models, and pipelines.',
        descriptionHighlight: ['Designing and implementing'],
        metric: '50% leaner\ndata processing costs',
      },
      {
        icon: 'mdi:view-dashboard-variant',
        title: 'Insight Hub',
        description: 'Unifying metrics and dashboards into governed, self-serve BI layers.',
        descriptionHighlight: ['Unifying'],
        metric: '5x decision velocity\ncompany‑wide',
      },
      {
        icon: 'mdi:atom',
        title: 'Pattern Lab',
        description: 'Building, deploying, and monitoring data science and ML solutions.',
        descriptionHighlight: ['Building, deploying'],
        metric: '30% elevated\nmodel precision',
      },
      {
        icon: 'mdi:chart-timeline-variant',
        title: 'Growth Signals',
        description: 'Transforming customer, product, and revenue data into growth insights.',
        descriptionHighlight: ['Transforming'],
        metric: '25% faster\nrevenue growth',
      },
      {
        icon: 'mdi:shield-check-outline',
        title: 'Trust Frameworks',
        description: 'Establishing policies and controls for reliable, secure, compliant data.',
        descriptionHighlight: ['Establishing'],
        metric: '80% faster\ncompliance cycles',
      },
    ],
  },
  servicesIntro: {
    title: 'Three Common Starting Points',
    subheading: 'Where most teams begin their analytics journey.',
    items: [
      {
        number: '01',
        icon: 'mdi:layers',
        title: 'Foundation Readiness',
        description: 'Assess and prepare your data infrastructure',
        descriptionHighlight: ['Assess and prepare'],
        link: '/services/#foundation',
      },
      {
        number: '02',
        icon: 'mdi:chart-box',
        title: 'Reporting Reset',
        description: 'Modernize your reporting capabilities',
        descriptionHighlight: ['reporting capabilities'],
        link: '/services/#reporting',
      },
      {
        number: '03',
        icon: 'mdi:chart-line',
        title: 'Performance Diagnostics',
        description: 'Identify and optimize performance bottlenecks',
        descriptionHighlight: ['optimize'],
        link: '/services/#diagnostics',
      },
    ],
    navigationButton: {
      text: 'View all Services',
      href: '/services/',
    },
  },
  techStack: {
    title: 'Technologies We Work With',
    subtitle: 'Modern analytics tools and platforms powering our solutions',
    items: [
      // Programming Languages
      { name: 'Python', icon: 'simple-icons:python' },
      { name: 'R', icon: 'simple-icons:r' },
      { name: 'SQL', icon: 'mdi:database' },
      // Cloud Platforms
      { name: 'AWS', icon: 'simple-icons:amazonaws' },
      { name: 'Azure', icon: 'simple-icons:microsoftazure' },
      { name: 'GCP', icon: 'simple-icons:googlecloud' },
      { name: 'Snowflake', icon: 'simple-icons:snowflake' },
      { name: 'Databricks', icon: 'simple-icons:databricks' },
      // BI & Visualization
      { name: 'Tableau', icon: 'simple-icons:tableau' },
      { name: 'Power BI', icon: 'simple-icons:powerbi' },
      { name: 'Looker', icon: 'simple-icons:looker' },
      { name: 'Metabase', icon: 'simple-icons:metabase' },
      { name: 'Apache Superset', icon: 'simple-icons:apachesuperset' },
      // Data Engineering
      { name: 'dbt', icon: 'simple-icons:dbt' },
      { name: 'Airflow', icon: 'simple-icons:apacheairflow' },
      { name: 'Prefect', icon: 'mdi:cog-sync' },
      { name: 'Dagster', icon: 'mdi:workflow' },
      { name: 'Fivetran', icon: 'mdi:cloud-upload' },
      { name: 'Spark', icon: 'simple-icons:apachespark' },
      { name: 'Kafka', icon: 'simple-icons:apachekafka' },
      // ML & AI Frameworks
      { name: 'TensorFlow', icon: 'simple-icons:tensorflow' },
      { name: 'PyTorch', icon: 'simple-icons:pytorch' },
      { name: 'Hugging Face', icon: 'simple-icons:huggingface' },
      { name: 'Scikit-learn', icon: 'simple-icons:scikitlearn' },
      { name: 'H2O.ai', icon: 'mdi:water' },
      { name: 'MLflow', icon: 'simple-icons:mlflow' },
      { name: 'Ray', icon: 'mdi:ray-start-end' },
      // Modern AI Tools 2025
      { name: 'LangChain', icon: 'mdi:link-variant' },
      { name: 'Weaviate', icon: 'mdi:vector-triangle' },
      { name: 'Pinecone', icon: 'mdi:database-search' },
      { name: 'KNIME', icon: 'mdi:chart-box-outline' },
      { name: 'MindsDB', icon: 'mdi:brain' },
      { name: 'Chalk', icon: 'mdi:chart-timeline-variant' },
      // Data Science Tools
      { name: 'Jupyter', icon: 'simple-icons:jupyter' },
      { name: 'Pandas', icon: 'simple-icons:pandas' },
      { name: 'NumPy', icon: 'simple-icons:numpy' },
      // Databases
      { name: 'PostgreSQL', icon: 'simple-icons:postgresql' },
      { name: 'MongoDB', icon: 'simple-icons:mongodb' },
      { name: 'Redis', icon: 'simple-icons:redis' },
      { name: 'Elasticsearch', icon: 'simple-icons:elasticsearch' },
      // DevOps & Infrastructure
      { name: 'Git', icon: 'simple-icons:git' },
      { name: 'Docker', icon: 'simple-icons:docker' },
      { name: 'Kubernetes', icon: 'simple-icons:kubernetes' },
      // Additional Data Tools
      { name: 'Apache Flink', icon: 'mdi:flash' },
      { name: 'Trino', icon: 'mdi:database-search' },
      { name: 'ClickHouse', icon: 'mdi:database' },
      { name: 'BigQuery', icon: 'mdi:cloud' },
      { name: 'Redshift', icon: 'mdi:database' },
      { name: 'S3', icon: 'mdi:cloud' },
      { name: 'Delta Lake', icon: 'mdi:layers' },
      { name: 'Iceberg', icon: 'mdi:cube' },
      { name: 'Hive', icon: 'mdi:database' },
      { name: 'Presto', icon: 'mdi:database' },
      { name: 'Apache Beam', icon: 'mdi:chart-line' },
      { name: 'Luigi', icon: 'mdi:workflow' },
      { name: 'Great Expectations', icon: 'mdi:check-circle' },
      { name: 'Monte Carlo', icon: 'mdi:chart-line' },
      { name: 'Datafold', icon: 'mdi:compare-horizontal' },
      { name: 'Soda', icon: 'mdi:water' },
      { name: 'Apache NiFi', icon: 'mdi:pipe' },
      { name: 'Talend', icon: 'mdi:database' },
      { name: 'Informatica', icon: 'mdi:database' },
      { name: 'Matillion', icon: 'mdi:cloud' },
      { name: 'Stitch', icon: 'mdi:cloud-upload' },
      { name: 'Segment', icon: 'mdi:chart-box' },
      { name: 'RudderStack', icon: 'mdi:chart-line' },
      { name: 'Amplitude', icon: 'mdi:chart-line' },
      { name: 'Mixpanel', icon: 'mdi:chart-box' },
      { name: 'Mode', icon: 'mdi:chart-box' },
      { name: 'Hex', icon: 'mdi:hexagon' },
      { name: 'Deepnote', icon: 'mdi:notebook' },
      { name: 'Observable', icon: 'mdi:chart-box' },
      { name: 'Streamlit', icon: 'mdi:web' },
      { name: 'Grafana', icon: 'simple-icons:grafana' },
      { name: 'Prometheus', icon: 'simple-icons:prometheus' },
      { name: 'Apache Druid', icon: 'mdi:database' },
      { name: 'InfluxDB', icon: 'simple-icons:influxdb' },
      { name: 'TimescaleDB', icon: 'mdi:database-clock' },
      { name: 'CockroachDB', icon: 'simple-icons:cockroachlabs' },
      { name: 'Cassandra', icon: 'simple-icons:apachecassandra' },
      { name: 'DuckDB', icon: 'mdi:database' },
      { name: 'Polars', icon: 'mdi:chart-line' },
      { name: 'Vaex', icon: 'mdi:chart-line' },
      { name: 'Modin', icon: 'mdi:chart-line' },
      { name: 'Dask', icon: 'mdi:chart-line' },
      { name: 'XGBoost', icon: 'mdi:chart-line' },
      { name: 'LightGBM', icon: 'mdi:chart-line' },
      { name: 'CatBoost', icon: 'mdi:chart-line' },
      { name: 'FastAPI', icon: 'mdi:api' },
      { name: 'Flask', icon: 'simple-icons:flask' },
      { name: 'Celery', icon: 'mdi:cog' },
      { name: 'RabbitMQ', icon: 'mdi:rabbit' },
    ],
  },
};

