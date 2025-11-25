import { createUrl } from '../utils/url';

export interface DropdownItem {
  name: string;
  href: string;
  icon: string;
  description?: string;
}

export interface NavItem {
  name: string;
  href: string;
  dropdown?: DropdownItem[];
  isModal?: boolean; // Full-width modal dropdowns
}

export const navItems: NavItem[] = [
  {
    name: 'Services',
    href: createUrl('services'),
    isModal: true,
    dropdown: [
      { 
        name: 'Foundation Readiness', 
        href: createUrl('services/foundation-readiness'), 
        icon: 'mdi:shield-lock',
        description: 'Assess and prepare your data infrastructure'
      },
      { 
        name: 'Reporting Reset', 
        href: createUrl('services/reporting-reset'), 
        icon: 'mdi:file-document-edit',
        description: 'Modernize your reporting capabilities'
      },
      { 
        name: 'Performance Diagnostics', 
        href: createUrl('services/performance-diagnostics'), 
        icon: 'mdi:chart-bar',
        description: 'Identify and optimize performance bottlenecks'
      },
      { 
        name: 'Forecasting Lab', 
        href: createUrl('services/forecasting-lab'), 
        icon: 'mdi:trending-up',
        description: 'Advanced predictive analytics and forecasting'
      },
      { 
        name: 'Decision Playbooks', 
        href: createUrl('services/decision-playbooks'), 
        icon: 'mdi:book-open',
        description: 'Structured frameworks for data-driven decisions'
      },
      { 
        name: 'Smart Automation', 
        href: createUrl('services/smart-automation'), 
        icon: 'mdi:robot-industrial',
        description: 'Intelligent process automation solutions'
      },
      { 
        name: 'Augmented Intelligence Studio', 
        href: createUrl('services/augmented-intelligence-studio'), 
        icon: 'mdi:robot-industrial',
        description: 'AI-powered analytics and insights'
      },
      { 
        name: 'Autonomy Readiness Review', 
        href: createUrl('services/autonomy-readiness-review'), 
        icon: 'mdi:rocket-launch',
        description: 'Evaluate and enhance autonomous capabilities'
      },
    ]
  },
  { name: 'About', href: createUrl('about') },
];

