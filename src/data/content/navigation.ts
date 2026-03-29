export interface DropdownItem {
  _key?: string;
  name: string;
  href: string;
  icon: string;
  description?: string;
}

export interface NavItem {
  _key?: string;
  name: string;
  href: string;
  isModal?: boolean;
  dropdown?: DropdownItem[];
}

export interface NavigationContent {
  items: NavItem[];
}

export const navigationContent: NavigationContent = {
  "items": [
    {
      "dropdown": [
        {
          "description": "Assess and prepare your data infrastructure",
          "href": "/services/foundation-readiness/",
          "icon": "mdi:layers",
          "name": "Foundation Readiness"
        },
        {
          "description": "Modernize your reporting capabilities",
          "href": "/services/reporting-reset/",
          "icon": "mdi:chart-box",
          "name": "Reporting Reset"
        },
        {
          "description": "Identify and optimize performance bottlenecks",
          "href": "/services/performance-diagnostics/",
          "icon": "mdi:chart-line",
          "name": "Performance Diagnostics"
        },
        {
          "description": "Advanced predictive analytics and forecasting",
          "href": "/services/forecasting-lab/",
          "icon": "mdi:crystal-ball",
          "name": "Forecasting Lab"
        },
        {
          "description": "Structured frameworks for data-driven decisions",
          "href": "/services/decision-playbooks/",
          "icon": "mdi:book-open-variant",
          "name": "Decision Playbooks"
        },
        {
          "description": "Intelligent process automation solutions",
          "href": "/services/smart-automation/",
          "icon": "mdi:robot",
          "name": "Smart Automation"
        },
        {
          "description": "AI-powered analytics and insights",
          "href": "/services/augmented-intelligence-studio/",
          "icon": "mdi:brain",
          "name": "Augmented Intelligence Studio"
        },
        {
          "description": "Evaluate and enhance autonomous capabilities",
          "href": "/services/autonomy-readiness-review/",
          "icon": "mdi:shield-account",
          "name": "Autonomy Readiness Review"
        }
      ],
      "href": "/services/",
      "isModal": true,
      "name": "Services"
    },
    {
      "href": "/about/",
      "name": "About"
    },
    {
      "href": "/blog/",
      "name": "Insights"
    }
  ]
};
