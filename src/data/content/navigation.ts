import { getServiceIconBySlug } from "./service-page-details";

export interface DropdownItem {
  _key?: string;
  name: string;
  href: string;
  icon: string;
  description?: string;
  group?: string;
  fit?: string;
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

const iconForServicePath = (href: string) =>
  getServiceIconBySlug(href.split("/").filter(Boolean).pop() ?? "");

export const navigationContent: NavigationContent = {
  "items": [
    {
      "dropdown": [
        {
          "description": "Audit data foundations before reporting, automation, or AI scale the wrong architecture.",
          "fit": "Best when source-of-truth, ownership, and architecture are still unstable.",
          "group": "Stabilize",
          "href": "/services/foundation-readiness/",
          "icon": iconForServicePath("/services/foundation-readiness/"),
          "name": "Foundation Readiness"
        },
        {
          "description": "Replace fragmented reporting with clearer KPIs, role-based dashboards, and cleaner self-serve.",
          "fit": "Best when reporting is duplicated, distrusted, or too manual.",
          "group": "Stabilize",
          "href": "/services/reporting-reset/",
          "icon": iconForServicePath("/services/reporting-reset/"),
          "name": "Reporting Reset"
        },
        {
          "description": "Diagnose slow dashboards, warehouse drag, and brittle transformations before users disengage.",
          "fit": "Best when the analytics stack feels slow, costly, or fragile.",
          "group": "Optimize",
          "href": "/services/performance-diagnostics/",
          "icon": iconForServicePath("/services/performance-diagnostics/"),
          "name": "Performance Diagnostics"
        },
        {
          "description": "Build forecasting workflows that support real planning cycles and scenario decisions.",
          "fit": "Best when teams need forward visibility, not just historical reporting.",
          "group": "Optimize",
          "href": "/services/forecasting-lab/",
          "icon": iconForServicePath("/services/forecasting-lab/"),
          "name": "Forecasting Lab"
        },
        {
          "description": "Turn recurring high-stakes choices into playbooks with explicit criteria and thresholds.",
          "fit": "Best when important decisions are inconsistent across teams or leaders.",
          "group": "Optimize",
          "href": "/services/decision-playbooks/",
          "icon": iconForServicePath("/services/decision-playbooks/"),
          "name": "Decision Playbooks"
        },
        {
          "description": "Automate repetitive analytics workflows with monitoring, exception handling, and ownership.",
          "fit": "Best when analysts are buried in repetitive preparation, checks, and delivery work.",
          "group": "Scale",
          "href": "/services/smart-automation/",
          "icon": iconForServicePath("/services/smart-automation/"),
          "name": "Smart Automation"
        },
        {
          "description": "Apply AI where it improves analytical throughput and decision quality without the theater.",
          "fit": "Best when you need an AI use-case filter before building expensive nonsense.",
          "group": "Scale",
          "href": "/services/augmented-intelligence-studio/",
          "icon": iconForServicePath("/services/augmented-intelligence-studio/"),
          "name": "Augmented Intelligence Studio"
        },
        {
          "description": "Expand self-serve analytics with the governance, support, and controls needed to keep trust intact.",
          "fit": "Best when broader analytics access is the goal, but governance is not ready yet.",
          "group": "Stabilize",
          "href": "/services/autonomy-readiness-review/",
          "icon": iconForServicePath("/services/autonomy-readiness-review/"),
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
